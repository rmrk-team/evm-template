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

You can use token repository to store your tokens's attributes. This is a draft feature so the final address will change, for now it is only deployed on a few test networks. Contact us through our implementers telegram group if you want us to deploy in another network.

To use it, you must first configure the attribute, you can do so by calling:

```bash copy
pnpm hardhat attributes:configure CONTRACT_ADDRESS ATTRIBUTE_NAME ACCESS_TYPE [SPECIFIC_ADDRESS] [--first-time true] --network NETWORK
```

Access type defines who can write to the attribute:

- 0: Issuer
- 1: Collaborator
- 2: IssuerOrCollaborator
- 3: TokenOwner
- 4: SpecificAddress. In this case you must specify in the fourth argument.

The first time you configure an attribute you will also need to register access control. This might removed from the final version, but for now you can do so by adding the `--first-time` flag to the command.

If we want to configure the name attribute on collection `0x5FbDB2315678afecb367f032d93F642f64180aa3` to be written by the token owner, we would call (with the collection owner account):

```bash copy
pnpm hardhat attributes:configure 0xd536FC5918117776064AEF0b2e7b126D63d697F3 name 3 --first-time true --network baseSepolia
```

Then, to set the attribute, you can call:

```bash copy
pnpm hardhat attributes:set CONTRACT_ADDRESS TOKEN_ID TYPE ATTRIBUTE_NAME ATTRIBUTE_VALUE --network NETWORK
```

Type is the type of the attribute, options are: 'boolean', 'uint', 'int', 'string', 'address', 'bytes'. For example, to set the name of the token `15` on collection `0x5FbDB2315678afecb367f032d93F642f64180aa3` to be "My Token" you would call, in this case with the token holder account:

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

## Generating Metadata

This package provides a way to generate metadata for collections, tokens, assets, catalogs, fixed parts and slot parts. For not it is individual but we plan to add a way to generate them from a csv file where needed.

The scripts will generate all the metadata under a metadata directory on the root of the project, and subfolders per collection. Some scripts include a COLLECTION_SLUG argument, this is used to create a subfolder for the collection metadata.

You do not need to create any folder, the scripts will do it for you. You can use the following commands to generate metadata.

### For collections

#### Single collection

Basic usage:

```bash copy
pnpm hardhat metadata:collection COLLECTION_SLUG NAME DESCRIPTION MEDIA_URI [--animation-uri <STRING>] [--external-uri <STRING>] [--license <STRING>] [--license-uri <STRING>] [--tags <STRING>] [--thumbnail-uri <STRING>]
```

Example:

```bash copy
pnpm hardhat metadata:collection backgrounds "Kanaria Community Backgrounds" "Created by 3 artists" "ipfs://collection-image-uri" --thumbnail-uri "ipfs://collection-image-thumb-uri"
```

See `pnpm hardhat metadata:collection --help` for a detailed description of each parameter.

#### Multiple collections from csv

You can also create the metadata for multiple collections using a csv file. See 'metadata/collections.csv' for an example. This file is used by default but you can also pass a different path as an argument.

Basic usage:
```bash copy
pnpm hardhat metadata:collections-csv [CSV_FILE_PATH] [--base-uri <STRING>] [--external-uri <STRING>] [--license <STRING>] [--license-uri <STRING>]
```

Example:
```bash copy
pnpm hardhat metadata:collections-csv metadata/collections.csv
```

See `pnpm hardhat metadata:collections-csv --help` for a detailed list of arguments.

### For tokens

#### Single token

Basic usage:

```bash copy
pnpm hardhat metadata:token COLLECTION_SLUG FILE_NAME NAME DESCRIPTION MEDIA_URI [--animation-uri <STRING>] [--attributes <STRING>] [--external-uri <STRING>] [--license <STRING>] [--license-uri <STRING>] [--thumbnail-uri <STRING>]
```

Example:

```bash copy
pnpm hardhat metadata:token backgrounds 1 "Mystical Background" "A mystical background" "ipfs://token-image-uri" --attributes "Max units:number:1,Artist:string:winner"
```

See `pnpm hardhat metadata:token --help` for a detailed list of arguments.

#### Multiple tokens from csv

You can also create the metadata for multiple tokens using a csv file. See 'metadata/tokens.csv' for an example. This file is used by default but you can also pass a different path as an argument.

Basic usage:
```bash copy
pnpm hardhat metadata:tokens-csv COLLECTION_SLUG [CSV_FILE_PATH] [--base-uri <STRING>] [--external-uri <STRING>] [--license <STRING>] [--license-uri <STRING>]
```

Example:
```bash copy
pnpm hardhat metadata:tokens-csv backgrounds metadata/tokens.csv
```

See `pnpm hardhat metadata:tokens-csv --help` for a detailed list of arguments.

### For assets

#### Single asset

Basic usage:

```bash copy
pnpm hardhat metadata:asset COLLECTION_SLUG FILE_NAME NAME DESCRIPTION MEDIA_URI [--attributes <STRING>] [--external-uri <STRING>] [--license <STRING>] [--license-uri <STRING>] [--thumbnail-uri <STRING>]
```

Example:

```bash copy
pnpm hardhat metadata:asset backgrounds 001 "Mystical Background" "A mystical background" "ipfs://token-image-uri" --attributes "Max units:number:1,Artist:string:winner"
```

See `pnpm hardhat metadata:asset --help` for a detailed list of arguments.

#### Multiple assets from csv

You can also create the metadata for multiple assets using a csv file. See 'metadata/assets.csv' for an example. This file is used by default but you can also pass a different path as an argument.

Basic usage:
```bash copy
pnpm hardhat metadata:assets-csv COLLECTION_SLUG [CSV_FILE_PATH] [--base-uri <STRING>] [--external-uri <STRING>] [--license <STRING>] [--license-uri <STRING>]
```

Example:
```bash copy
pnpm hardhat metadata:assets-csv backgrounds metadata/assets.csv
```

See `pnpm hardhat metadata:assets-csv --help` for a detailed list of arguments.

### For catalogs

Basic usage:

```bash copy
pnpm hardhat metadata:catalog NAME DESCRIPTION
```

Example:

```bash copy
pnpm hardhat metadata:catalog "Kanaria Catalog" "A catalog with assets of mystical creatures"
```

See `pnpm hardhat metadata:catalog --help` for a detailed list of arguments.

### For Fixed Parts

#### Single fixed part

Basic usage:

```bash copy
pnpm hardhat metadata:fixed-part NAME MEDIA_URI [DESCRIPTION]
```

Example:

```bash copy
pnpm hardhat metadata:fixed-part "Left Fire Wing" "ipfs://fixedpart-image-uri"
```

See `pnpm hardhat metadata:fixed-part --help` for a detailed list of arguments.

#### Multiple fixed parts from csv

You can also create the metadata for multiple fixed parts using a csv file. See 'metadata/fixed-parts.csv' for an example. This file is used by default but you can also pass a different path as an argument.

Basic usage:
```bash copy
pnpm hardhat metadata:fixed-parts-csv [CSV_FILE_PATH] [--base-uri <STRING>]
```

Example:
```bash copy
pnpm hardhat metadata:fixed-parts-csv metadata/fixed-parts.csv
```

See `pnpm hardhat metadata:fixed-parts-csv --help` for a detailed list of arguments.

### For Slot Parts

#### Single slot part

Basic usage:

```bash copy
pnpm hardhat metadata:slot-part NAME [--description <STRING>] [--fallback-media-uri <STRING>]
```

Example with no fallback:

```bash copy
pnpm hardhat metadata:slot-part "Left Wing Item" --description "A slot on the left wing to hold items"
```

Example with fallback, rendered if nothing is equipped in the slot:

```bash copy
pnpm hardhat metadata:slot-part "Background" --fallback-media-uri "ipfs://fallback-image-uri"
```

See `pnpm hardhat metadata:slot-part --help` for a detailed list of arguments.

#### Multiple slot parts from csv

You can also create the metadata for multiple slot parts using a csv file. See 'metadata/slot-parts.csv' for an example. This file is used by default but you can also pass a different path as an argument.

Basic usage:
```bash copy
pnpm hardhat metadata:slot-parts-csv [CSV_FILE_PATH] [--base-uri <STRING>]
```

Example:
```bash copy
pnpm hardhat metadata:slot-parts-csv metadata/slot-parts.csv
```

See `pnpm hardhat metadata:slot-parts-csv --help` for a detailed list of arguments.
