.PHONY: help build test optimize deploy-testnet deploy-mainnet init clean

TARGET := target/wasm32-unknown-unknown/release/borealis_engine.wasm
OPTIMIZED := target/wasm32-unknown-unknown/release/borealis_engine.optimized.wasm
WASM_DIR := contracts/borealis-engine
NETWORK ?= testnet

help:
	@echo "Borealis Engine - Makefile Commands"
	@echo ""
	@echo "Contract Commands:"
	@echo "  make build           - Build the smart contract"
	@echo "  make test            - Run contract unit tests"
	@echo "  make optimize        - Optimize WASM binary"
	@echo "  make deploy-testnet  - Deploy to Stellar Testnet"
	@echo ""
	@echo "Frontend Commands:"
	@echo "  make frontend-dev    - Start frontend development server"
	@echo "  make frontend-build  - Build frontend for production"

build:
	@echo "Building smart contract..."
	cd $(WASM_DIR) && cargo build --target wasm32-unknown-unknown --release
	@echo "✓ Build complete: $(TARGET)"

test:
	@echo "Running contract tests..."
	cd $(WASM_DIR) && cargo test --lib
	@echo "✓ Tests passed"

optimize: build
	@echo "Optimizing WASM binary..."
	stellar contract optimize --wasm $(TARGET) --out-wasm $(OPTIMIZED)
	@echo "✓ Optimized: $(OPTIMIZED)"

deploy-testnet: optimize
	@echo "Deploying contract to Stellar Testnet..."
	stellar contract deploy \
		--wasm $(OPTIMIZED) \
		--source-account $(ADMIN_KEY) \
		--network $(NETWORK) > contract_id.txt
	@echo "✓ Contract deployed!"
	@echo "Contract ID saved to contract_id.txt"

init:
	@echo "Initializing contract..."
	stellar contract invoke \
		--id $$(cat contract_id.txt) \
		--source-account $(ADMIN_KEY) \
		--network $(NETWORK) \
		-- initialize \
		--admin $(ADMIN_ADDRESS)
	@echo "✓ Contract initialized"

frontend-dev:
	@echo "Starting frontend development server..."
	cd frontend && npm install && npm run dev

frontend-build:
	@echo "Building frontend for production..."
	cd frontend && npm install && npm run build
	@echo "✓ Frontend build complete"

clean:
	@echo "Cleaning build artifacts..."
	cd $(WASM_DIR) && cargo clean
	rm -f contract_id.txt
	@echo "✓ Clean complete"

all: clean test optimize
	@echo "✓ Full pipeline complete"
