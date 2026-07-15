use soroban_sdk::{Env, Address, Map};
use crate::types::{DataKey, Wave};
use crate::errors::ContractError;

const DAY_IN_LEDGERS: u32 = 17280;
const BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
const LIFETIME_THRESHOLD: u32 = BUMP_AMOUNT - DAY_IN_LEDGERS;

pub struct Storage<'a> {
    env: &'a Env,
}

impl<'a> Storage<'a> {
    pub fn new(env: &'a Env) -> Self {
        Storage { env }
    }

    pub fn is_initialized(&self) -> bool {
        self.env.storage().instance().has(&DataKey::Initialized)
    }

    pub fn assert_initialized(&self) -> Result<(), ContractError> {
        if !self.is_initialized() {
            Err(ContractError::NotInitialized)
        } else {
            Ok(())
        }
    }

    pub fn set_initialized(&self) -> Result<(), ContractError> {
        self.env.storage().instance().set(&DataKey::Initialized, &true);
        Ok(())
    }

    pub fn get_admin(&self) -> Result<Address, ContractError> {
        self.env.storage().instance().get(&DataKey::Admin)
            .map_err(|_| ContractError::NotInitialized)
    }

    pub fn set_admin(&self, admin: &Address) -> Result<(), ContractError> {
        self.env.storage().instance().set(&DataKey::Admin, admin);
        self.env.storage().instance().extend_ttl(LIFETIME_THRESHOLD, BUMP_AMOUNT);
        Ok(())
    }

    pub fn assert_admin(&self, env: &Env) -> Result<(), ContractError> {
        let admin = self.get_admin()?;
        admin.require_auth();
        Ok(())
    }

    pub fn get_wave_count(&self) -> Result<u32, ContractError> {
        Ok(self.env.storage().instance().get(&DataKey::WaveCount)
            .unwrap_or(0))
    }

    pub fn set_wave_count(&self, count: u32) -> Result<(), ContractError> {
        self.env.storage().instance().set(&DataKey::WaveCount, &count);
        self.env.storage().instance().extend_ttl(LIFETIME_THRESHOLD, BUMP_AMOUNT);
        Ok(())
    }

    pub fn get_wave(&self, wave_id: u32) -> Result<Wave, ContractError> {
        self.env.storage().persistent().get(&DataKey::Wave(wave_id))
            .map_err(|_| ContractError::WaveNotFound)
    }

    pub fn set_wave(&self, wave: &Wave) -> Result<(), ContractError> {
        self.env.storage().persistent().set(&DataKey::Wave(wave.id), wave);
        self.env.storage().persistent()
            .extend_ttl(&DataKey::Wave(wave.id), LIFETIME_THRESHOLD, BUMP_AMOUNT);
        Ok(())
    }

    pub fn get_contributor_points(
        &self,
        wave_id: u32,
        contributor: &Address,
    ) -> Result<u32, ContractError> {
        let key = DataKey::Points(wave_id, contributor.clone());
        self.env.storage().persistent().get(&key)
            .ok()
    }

    pub fn set_contributor_points(
        &self,
        wave_id: u32,
        contributor: &Address,
        points: u32,
    ) -> Result<(), ContractError> {
        let key = DataKey::Points(wave_id, contributor.clone());
        self.env.storage().persistent().set(&key, &points);
        self.env.storage().persistent()
            .extend_ttl(&key, LIFETIME_THRESHOLD, BUMP_AMOUNT);
        Ok(())
    }

    pub fn get_splits(&self, contributor: &Address) -> Result<Map<Address, u32>, ContractError> {
        let key = DataKey::Splits(contributor.clone());
        self.env.storage().persistent().get(&key)
            .map_err(|_| ContractError::InvalidSplitConfiguration)
    }

    pub fn set_splits(
        &self,
        contributor: &Address,
        splits: &Map<Address, u32>,
    ) -> Result<(), ContractError> {
        let key = DataKey::Splits(contributor.clone());
        self.env.storage().persistent().set(&key, splits);
        self.env.storage().persistent()
            .extend_ttl(&key, LIFETIME_THRESHOLD, BUMP_AMOUNT);
        Ok(())
    }
}

pub struct ContractState;

impl ContractState {
    pub fn assert_not_initialized(env: &Env) -> Result<(), ContractError> {
        if env.storage().instance().has(&DataKey::Initialized) {
            Err(ContractError::AlreadyInitialized)
        } else {
            Ok(())
        }
    }
}

pub fn assert_not_initialized(env: &Env) -> Result<(), ContractError> {
    ContractState::assert_not_initialized(env)
}
