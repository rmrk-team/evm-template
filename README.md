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

## Emoting on an NFT

You can emote to an NFT from the account that you have configured in your `.env` file with the `PRIVATE_KEY` variable. To do so you must simply call:

```bash copy
pnpm hardhat emotes:emote CONTRACT_ADDRESS TOKEN_ID EMOTE [ENABLE] --network NETWORK
```

For example, to send a 😁 emote to the token Id `15` on collection `0x5FbDB2315678afecb367f032d93F642f64180aa3` and sepolia network, you would call:

```bash copy
pnpm hardhat emotes:emote 0x5FbDB2315678afecb367f032d93F642f64180aa3 15 '😁' --network sepolia
```

To remove it you would call:

```bash copy
pnpm hardhat emotes:emote 0x5FbDB2315678afecb367f032d93F642f64180aa3 15 😁 false --network sepolia
```

You can also send emotes in bulk, the collection and enable parameters are used for all emotes, the token ids and emotes must be comma separated and have the same length. To do so you must simply call:

```bash copy
pnpm hardhat emotes:bulkEmote CONTRACT_ADDRESS TOKEN_IDS EMOTES [ENABLE] --network NETWORK
```

For example, to send a 😁 emote to the token Id `15` and a 😂 emote to the token Id `16` on collection `0x5FbDB2315678afecb367f032d93F642f64180aa3` and sepolia network, you would call:

```bash copy
pnpm hardhat emotes:bulkEmote 0x5FbDB2315678afecb367f032d93F642f64180aa3 '15,16' '😁,😂' --network sepolia
```

To remove it you would call:

```bash copy
pnpm hardhat emotes:bulkEmote 0x5FbDB2315678afecb367f032d93F642f64180aa3 '15,16' '😁,😂' false --network sepolia
```

## Using Token Attributes Repository (Draft feature)

You can use token repositories to store your tokens. This is a draft feature so the final address will change, for now it is only deployed on a few test networks. Contact us through our implementers telegram group if you want us to deploy in another network.

To use it, you must first configure the attribute, you can do so by calling:

```bash copy
pnpm hardhat attributes:configure CONTRACT_ADDRESS ATTRIBUTE_NAME ACCESS_TYPE [SPECIFIC_ADDRESS] --network NETWORK
```

Access type defines who can write to the attribute:

- 0: Issuer
- 1: Collaborator
- 2: IssuerOrCollaborator
- 3: TokenOwner
- 4: SpecificAddress. In this case you must specify in the fourth argument.

If we want to configure the name attribute on collection `0x5FbDB2315678afecb367f032d93F642f64180aa3` to be written by the token owner, we would call (with the collection owner account):

```bash copy
pnpm hardhat attributes:configure 0xd536FC5918117776064AEF0b2e7b126D63d697F3 name 3 --network baseSepolia
```

Then, to set the attribute, you can call:

```bash copy
pnpm hardhat attributes:set CONTRACT_ADDRESS TOKEN_ID TYPE ATTRIBUTE_NAME ATTRIBUTE_VALUE --network NETWORK
```

Type is the type of the attribute, options are: 'boolean', 'int', 'string', 'address', 'bytes'. For example, to set the name of the token `15` on collection `0x5FbDB2315678afecb367f032d93F642f64180aa3` to be "My Token" you would call, in this case with the token holder account:

```bash copy
pnpm hardhat attributes:set 0x5FbDB2315678afecb367f032d93F642f64180aa3 15 string name 'My Token' --network sepolia
```

To get the attribute, you can call:

```bash copy
pnpm hardhat attributes:get CONTRACT_ADDRESS TOKEN_ID TYPE ATTRIBUTE_NAME --network NETWORK
```

For example, to get the name of the token `15` on collection `0x5FbDB2315678afecb367f032d93F642f64180aa3` you would call:

```bash copy
pnpm hardhat attributes:get 0x5FbDB2315678afecb367f032d93F642f64180aa3 15 string name --network sepolia
```
