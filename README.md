# Instructions

1. Install packages with `yarn`, `npm i`, `pnpm i` or your favorite package manager. This example uses `pnpm`.
2. Test contracts compile: `pnpm hardhat compile`
3. Check contract size: `pnpm hardhat size-contracts`
4. Run tests: `pnpm test`
5. Run prettier: `pnpm prettier`
6. Copy `.env.example` into `.env` and set your variables
7. Use `contracts/`, `tests/` and `scripts/` to build your code.

## Deploying on localhost

1. On a separate terminal, start a local hardhat node: `pnpm hardhat node`
2. Deploy: `pnpm hardhat run scripts/deploy.ts --network localhost`
3. Optionally deploy utils, to do tests locally. `pnpm hardhat run scripts/deployUtils.ts --network localhost`

## Deploying on a real blockchain

1. Deploy on testnet: `pnpm hardhat run scripts/deploy.ts --network NETWORK`
2. If you did not verify the contracts in the script, you can do it using the contract address and arguments you used to deploy previous step:

```
pnpm hardhat verify YOUR_CONTRACT_ADDRESS --network NETWORK --contract contracts/YOUR_CONTRACT_NAME.sol:YOUR_CONTRACT_NAME [ARGUMENTS_HERE]

// Example:
pnpm hardhat verify 0x5FbDB2315678afecb367f032d93F642f64180aa3 --network sepolia --contract contracts/SimpleEquippable.sol:SimpleEquippable 'ipfs://collectionMeta.json', 'ipfs://baseURI/' ...
```

Remember to give credit to RMRK if you're using it's technology. Check the license and notice for more details.
