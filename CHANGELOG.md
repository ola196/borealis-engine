# Changelog

All notable changes to Borealis Engine will be documented in this file.

## [1.0.0] - 2024

### Added

**Smart Contract**
- Core Wave creation and management functionality
- Points allocation system with admin authorization
- Dependency split configuration (basis point routing)
- Pro-rata distribution with safe arithmetic
- TTL management for state persistence
- Comprehensive error handling

**Frontend**
- Next.js 14 dashboard with Tailwind CSS
- Freighter wallet integration
- Wave browser and details view
- Split configuration UI
- Real-time balance and point tracking
- Responsive design

**Deployment**
- Automated Makefile build pipeline
- Stellar CLI deployment scripts
- Testnet and Mainnet support
- Contract initialization and verification

**Documentation**
- Comprehensive API reference
- Security model and audit readiness
- Development setup and guidelines
- Deployment walkthrough

### Security

- Authorization enforced via `require_auth()`
- Safe integer arithmetic throughout
- Bounded storage operations
- State expiration handling

## Roadmap

### [1.1.0] - Planned
- Multi-sig admin support
- Wave pause/unpause functionality
- Wave cancellation with refunds

### [1.2.0] - Planned
- Formal verification of arithmetic
- Advanced DOS protection
- Contract upgrade mechanism
