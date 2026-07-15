#![no_std]

mod types;
mod storage;
mod errors;
mod validation;

use soroban_sdk::{contract, contractimpl, Address, Env, Map, Vec, token};
use types::{Wave, WaveMetadata, Split};
use storage::{Storage, ContractState};
use errors::ContractError;
use validation::{validate_amount, validate_wave_state, validate_splits, validate_addresses};

// Constants for state management and security
const DAY_IN_LEDGERS: u32 = 17280;
const BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
const LIFETIME_THRESHOLD: u32 = BUMP_AMOUNT - DAY_IN_LEDGERS;
const MAX_SPLIT_COUNT: u32 = 100;
const MAX_BASIS_POINTS: u32 = 10000;
const MIN_WAVE_AMOUNT: i128 = 1_000_000;

/// Borealis Engine: Sustainable open-source funding on Stellar
#[contract]
pub struct BorealisEngine;

#[contractimpl]
impl BorealisEngine {
    pub fn initialize(env: Env, admin: Address) -> Result<(), ContractError> {
        storage::assert_not_initialized(&env)?;
        
        let storage = Storage::new(&env);
        storage.set_admin(&admin)?;
        storage.set_wave_count(0)?;
        storage.set_initialized()?;
        
        extend_instance_ttl(&env);
        Ok(())
    }

    pub fn create_wave(
        env: Env,
        sponsor: Address,
        token: Address,
        amount: i128,
        metadata: WaveMetadata,
    ) -> Result<u32, ContractError> {
        sponsor.require_auth();
        extend_instance_ttl(&env);

        validate_amount(amount)?;
        
        let storage = Storage::new(&env);
        storage.assert_initialized()?;

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&sponsor, &env.current_contract_address(), &amount);

        let wave_id = storage.get_wave_count()? + 1;
        let wave = Wave {
            id: wave_id,
            sponsor,
            token,
            total_funds: amount,
            total_points: 0,
            is_distributed: false,
            metadata,
            created_at: env.ledger().timestamp(),
        };

        storage.set_wave(&wave)?;
        storage.set_wave_count(wave_id)?;

        Ok(wave_id)
    }

    pub fn allocate_points(
        env: Env,
        wave_id: u32,
        contributor: Address,
        points: u32,
    ) -> Result<(), ContractError> {
        extend_instance_ttl(&env);

        let storage = Storage::new(&env);
        storage.assert_initialized()?;
        storage.assert_admin(&env)?;

        let mut wave = storage.get_wave(wave_id)?;
        validate_wave_state(&wave)?;

        let current_points = storage.get_contributor_points(wave_id, &contributor)
            .unwrap_or(0);
        let new_total = current_points.checked_add(points)
            .ok_or(ContractError::ArithmeticOverflow)?;
        
        storage.set_contributor_points(wave_id, &contributor, new_total)?;

        wave.total_points = wave.total_points.checked_add(points)
            .ok_or(ContractError::ArithmeticOverflow)?;
        storage.set_wave(&wave)?;

        Ok(())
    }

    pub fn set_splits(
        env: Env,
        contributor: Address,
        splits: Map<Address, u32>,
    ) -> Result<(), ContractError> {
        contributor.require_auth();

        validate_splits(&splits)?;

        let storage = Storage::new(&env);
        storage.set_splits(&contributor, &splits)?;

        Ok(())
    }

    pub fn get_splits(env: Env, contributor: Address) -> Result<Map<Address, u32>, ContractError> {
        let storage = Storage::new(&env);
        storage.get_splits(&contributor)
            .or_else(|_| Ok(Map::new(&env)))
    }

    pub fn distribute(
        env: Env,
        wave_id: u32,
        contributors: Vec<Address>,
    ) -> Result<(), ContractError> {
        extend_instance_ttl(&env);

        let storage = Storage::new(&env);
        storage.assert_initialized()?;
        storage.assert_admin(&env)?;

        let mut wave = storage.get_wave(wave_id)?;
        
        if wave.is_distributed {
            return Err(ContractError::WaveAlreadyDistributed);
        }
        if wave.total_points == 0 {
            return Err(ContractError::NoPointsAllocated);
        }

        let token_client = token::Client::new(&env, &wave.token);
        let contract_address = env.current_contract_address();

        for contributor in contributors.iter() {
            distribute_to_contributor(
                &env,
                &storage,
                &token_client,
                &contract_address,
                &wave,
                &contributor,
            )?;
        }

        wave.is_distributed = true;
        storage.set_wave(&wave)?;

        Ok(())
    }

    pub fn get_wave(env: Env, wave_id: u32) -> Result<Wave, ContractError> {
        let storage = Storage::new(&env);
        storage.get_wave(wave_id)
    }

    pub fn get_admin(env: Env) -> Result<Address, ContractError> {
        let storage = Storage::new(&env);
        storage.get_admin()
    }

    pub fn get_wave_count(env: Env) -> Result<u32, ContractError> {
        let storage = Storage::new(&env);
        storage.get_wave_count()
    }

    pub fn get_contributor_points(
        env: Env,
        wave_id: u32,
        contributor: Address,
    ) -> Result<u32, ContractError> {
        let storage = Storage::new(&env);
        storage.get_contributor_points(wave_id, &contributor)
            .or(Ok(0))
    }

    pub fn set_admin(env: Env, new_admin: Address) -> Result<(), ContractError> {
        extend_instance_ttl(&env);

        let storage = Storage::new(&env);
        storage.assert_initialized()?;
        storage.assert_admin(&env)?;

        storage.set_admin(&new_admin)?;
        Ok(())
    }
}

fn distribute_to_contributor(
    env: &Env,
    storage: &Storage,
    token_client: &token::Client,
    contract_address: &Address,
    wave: &Wave,
    contributor: &Address,
) -> Result<(), ContractError> {
    let points = storage.get_contributor_points(wave.id, contributor)
        .unwrap_or(0);
    
    if points == 0 {
        return Ok(());
    }

    let share = (wave.total_funds as i128)
        .checked_mul(points as i128)
        .ok_or(ContractError::ArithmeticOverflow)?
        .checked_div(wave.total_points as i128)
        .ok_or(ContractError::ArithmeticOverflow)?;

    if share == 0 {
        return Ok(());
    }

    let splits = storage.get_splits(contributor)
        .unwrap_or_else(|_| Map::new(env));

    let mut remaining_share = share;

    for (dependency, basis_points) in splits.iter() {
        let split_amount = share
            .checked_mul(basis_points as i128)
            .ok_or(ContractError::ArithmeticOverflow)?
            .checked_div(MAX_BASIS_POINTS as i128)
            .ok_or(ContractError::ArithmeticOverflow)?;

        if split_amount > 0 {
            token_client.transfer(contract_address, &dependency, &split_amount);
            remaining_share = remaining_share
                .checked_sub(split_amount)
                .ok_or(ContractError::ArithmeticOverflow)?;
        }
    }

    if remaining_share > 0 {
        token_client.transfer(contract_address, contributor, &remaining_share);
    }

    Ok(())
}

fn extend_instance_ttl(env: &Env) {
    env.storage().instance().extend_ttl(LIFETIME_THRESHOLD, BUMP_AMOUNT);
}
