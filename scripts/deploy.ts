import { ethers, run, network } from 'hardhat';
import { SimpleEquippable } from '../typechain-types';
import { getRegistry } from './getRegistry';
import { InitDataNativePay } from '../typechain-types/contracts/SimpleEquippable';

async function main() {
  await deployContracts();
}

export default async function deployContracts(): Promise<SimpleEquippable> {
  console.log(`Deploying SimpleEquippable to ${network.name} blockchain...`);

  const contractFactory = await ethers.getContractFactory('SimpleEquippable');
  const initData: InitDataNativePay.InitDataStruct = {
    royaltyRecipient: (await ethers.getSigners())[0].address,
    royaltyPercentageBps: 300,
    maxSupply: 1000n,
    pricePerMint: ethers.parseUnits('1', 18),
  };

  const args = ['ipfs://collectionMeta.json', 'ipfs://baseURI/', initData] as const;

  const contract: SimpleEquippable = await contractFactory.deploy(...args);
  await contract.waitForDeployment();
  console.log(`SimpleEquippable deployed to ${await contract.getAddress()}.`);

  if ((await ethers.provider.getNetwork()).name !== 'hardhat') {
    // Only do on testing, or if whitelisted for production
    const registry = await getRegistry();
    await registry.addExternalCollection(await contract.getAddress(), args[0]);
    console.log('Collection added to Singular Registry');

    console.log('Waiting 10 seconds before verifying contract...');
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await run('verify:verify', {
      address: await contract.getAddress(),
      constructorArguments: args,
      contract: 'contracts/SimpleEquippable.sol:SimpleEquippable',
    });
  }
  return contract;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
