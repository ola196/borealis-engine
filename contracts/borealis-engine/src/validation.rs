use soroban_sdk::{Address, Map};
use crate::types::Wave;
use crate::errors::ContractError;

const MIN_WAVE_AMOUNT: i128 = 1_000_000;
const MAX_SPLIT_COUNT: u32 = 100;
const MAX_BASIS_POINTS: u32 = 10000;

pub fn validate_amount(amount: i128) -> Result<(), ContractError> {
    if amount < MIN_WAVE_AMOUNT {
        Err(ContractError::InvalidAmount)
    } else {
        Ok(())
    }
}

pub fn validate_wave_state(wave: &Wave) -> Result<(), ContractError> {
    if wave.is_distributed {
        Err(ContractError::WaveAlreadyDistributed)
    } else {
        Ok(())
    }
}

pub fn validate_splits(splits: &Map<Address, u32>) -> Result<(), ContractError> {
    let mut total_basis_points: u32 = 0;
    let mut split_count = 0u32;

    for (_, basis_points) in splits.iter() {
        split_count += 1;
        
        if split_count > MAX_SPLIT_COUNT {
            return Err(ContractError::TooManySplits);
        }

        total_basis_points = total_basis_points.checked_add(basis_points)
            .ok_or(ContractError::ArithmeticOverflow)?;
    }

    if total_basis_points > MAX_BASIS_POINTS {
        Err(ContractError::SplitsExceedMaximum)
    } else {
        Ok(())
    }
}

pub fn validate_addresses(addresses: &[Address]) -> Result<(), ContractError> {
    if addresses.is_empty() {
        return Err(ContractError::InvalidAddress);
    }
    Ok(())
}
