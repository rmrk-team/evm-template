import { ethers, run, network } from 'hardhat';
import { SimpleEquippable } from '../typechain-types';
import { InitDataNativePay } from '../typechain-types/contracts/SimpleEquippable';
import { getRegistry } from './get-gegistry';
import { delay } from './utils';

async function main() {
  await deployContracts();
}

async function deployContracts(): Promise<SimpleEquippable> {
  console.log(`Deploying SimpleEquippable to ${network.name} blockchain...`);

  const contractFactory = await ethers.getContractFactory('SimpleEquippable');
  const initData: InitDataNativePay.InitDataStruct = {
    royaltyRecipient: (await ethers.getSigners())[0].address,
    royaltyPercentageBps: 300,
    maxSupply: 1000n,
    pricePerMint: ethers.parseUnits('1', 18),
  };

  const collectionMeta = undefined; // TODO: Replace with IPFS with metadata for collection, e.g. 'ipfs://collectionMeta.json' See https://evm.rmrk.app/metadata#collection-metadata for more info on expected content
  const baseURI = undefined; // TODO: Replace with IPFS with metadata for collection, e.g. 'ipfs://baseURI/'

  if (collectionMeta === undefined || baseURI === undefined) {
    throw new Error('Please set collectionMeta and baseURI');
  } else {
    const args = [collectionMeta, baseURI, initData] as const;
    const contract: SimpleEquippable = await contractFactory.deploy(...args);
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`SimpleEquippable deployed to ${contractAddress}.`);

    if (network.name !== 'hardhat' && network.name !== 'localhost') {
      console.log('Waiting 10 seconds before verifying contract...');
      delay(10000);
      await run('verify:verify', {
        address: contractAddress,
        constructorArguments: args,
        contract: 'contracts/SimpleEquippable.sol:SimpleEquippable',
      });

      // Only do on testing, or if whitelisted for production
      const registry = await getRegistry();
      await registry.addExternalCollection(contractAddress, args[0]);
      console.log('Collection added to Singular Registry');
    }
    return contract;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
