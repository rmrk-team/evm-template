# Instructions

1. Install packages with `yarn`, `npm i` or your favorite package manager. This example uses `yarn`.
2. Test contracts compile: `yarn hardhat compile`
3. Check contract size: `yarn hardhat size-contracts`
4. Run tests: `yarn test`
5. Run prettier: `yarn prettier`
6. Copy `.env.example` into `.env` and set your variables
7. Use `contracts/`, `tests/` and `scripts/` to build your code.

## Deploying on localhost

1. On a separate terminal, start a local hardhat node: `yarn hardhat node`
2. Deploy: `yarn hardhat run scripts/deploy.ts --network localhost`
3. Optionally deploy utils, to do tests locally. `yarn hardhat run scripts/deployUtils.ts --network localhost`

## Deploying on a real blockchain

1. Deploy on testnet: `yarn hardhat run scripts/deploy.ts --network NETWORK`
2. If you did not verify the contracts in the script, you can do it using the contract address and arguments you used to deploy previous step:

```
yarn hardhat verify YOUR_CONTRACT_ADDRESS --network NETWORK --contract contracts/YOUR_CONTRACT_NAME.sol:YOUR_CONTRACT_NAME [ARGUMENTS_HERE]

// Example:
yarn hardhat verify 0x5FbDB2315678afecb367f032d93F642f64180aa3 --network sepolia --contract contracts/SimpleEquippable.sol:SimpleEquippable 'ipfs://collectionMeta.json', 'ipfs://baseURI/' ...
```

Remember to give credit to RMRK if you're using it's technology. Check the license and notice for more details.
