use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum ContractError {
    #[error(display = "Contract already initialized")]
    AlreadyInitialized = 1,
    
    #[error(display = "Contract not initialized")]
    NotInitialized = 2,

    #[error(display = "Unauthorized: caller does not have required permissions")]
    Unauthorized = 3,

    #[error(display = "Amount must be positive and meet minimum requirements")]
    InvalidAmount = 4,
    #[error(display = "Transfer failed")]
    TransferFailed = 5,

    #[error(display = "Wave not found")]
    WaveNotFound = 6,

    #[error(display = "Wave already distributed")]
    WaveAlreadyDistributed = 7,

    #[error(display = "No points allocated in this Wave")]
    NoPointsAllocated = 8,

    #[error(display = "Invalid split configuration: exceeds limits or malformed")]
    InvalidSplitConfiguration = 9,

    #[error(display = "Split allocation exceeds 100% (10000 basis points)")]
    SplitsExceedMaximum = 10,

    #[error(display = "Too many splits configured (max 100 allowed)")]
    TooManySplits = 11,

    #[error(display = "Arithmetic overflow/underflow")]
    ArithmeticOverflow = 12,

    #[error(display = "Invalid address provided")]
    InvalidAddress = 13,
}
