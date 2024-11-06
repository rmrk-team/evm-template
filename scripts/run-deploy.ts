import { ethers, run, network } from 'hardhat';
import { SimpleEquippable } from '../typechain-types';
import { getRegistry } from './get-registry';
import { delay, isHardhatNetwork } from './utils';

async function main() {
  await deployContracts();
}

async function deployContracts(): Promise<SimpleEquippable> {
  console.log(`Deploying SimpleEquippable to ${network.name} blockchain...`);

  const contractFactory = await ethers.getContractFactory('SimpleEquippable');
  const collectionMeta = undefined; // TODO: Replace with IPFS with metadata for collection, e.g. 'ipfs://collectionMeta.json' See https://evm.rmrk.app/metadata#collection-metadata for more info on expected content
  const maxSupply = undefined; // TODO: Replace with max supply of the collection
  const royaltyRecipient = (await ethers.getSigners())[0].address;
  const royaltyPercentageBps = 300; // 3%

  if (collectionMeta === undefined || maxSupply === undefined) {
    throw new Error('Please set collectionMeta and maxSupply');
  } else {
    const args = [collectionMeta, maxSupply, royaltyRecipient, royaltyPercentageBps] as const;
    const contract: SimpleEquippable = await contractFactory.deploy(...args);
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`SimpleEquippable deployed to ${contractAddress}`);

    if (!isHardhatNetwork()) {
      console.log('Waiting 20 seconds before verifying contract...');
      await delay(20000);
      await run('verify:verify', {
        address: contractAddress,
        constructorArguments: args,
        contract: 'contracts/SimpleEquippable.sol:SimpleEquippable',
      });

      // Before deploying in production, contact RMRK to give permissions to your deployer address.
      // If you skip this and mint items or add assets, adding it to singular later will be costly.
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
