use soroban_sdk::{contracttype, Address};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Wave {
    pub id: u32,
    pub sponsor: Address,
    pub token: Address,
    pub total_funds: i128,
    pub total_points: u32,
    pub is_distributed: bool,
    pub metadata: WaveMetadata,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WaveMetadata {
    pub description: soroban_sdk::String,
    pub duration_seconds: u32,
    pub project_ref: soroban_sdk::String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Split {
    pub dependency: Address,
    pub basis_points: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    WaveCount,
    Wave(u32),
    Points(u32, Address),
    Splits(Address),
    Initialized,
}
