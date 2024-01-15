import { ethers } from 'hardhat';
import { SimpleEquippable } from '../typechain-types';
import { InitDataNativePay } from '../typechain-types/contracts/SimpleEquippable';
import { getRegistry } from './getRegistry';

async function main() {
  await deployContracts();
}

async function deployContracts(): Promise<void> {
  console.log('Deploying smart simple equippable contract');

  const contractFactory = await ethers.getContractFactory('SimpleEquippable');
  const initData: InitDataNativePay.InitDataStruct = {
    royaltyRecipient: ethers.ZeroAddress,
    royaltyPercentageBps: 1000,
    maxSupply: 1000n,
    pricePerMint: ethers.parseEther('1.0'),
  };

  const contract: SimpleEquippable = await contractFactory.deploy(
    'Kanaria',
    'KAN',
    'ipfs://collectionMeta',
    'ipfs://tokenMeta',
    initData,
  );

  await contract.waitForDeployment();
  console.log(`Sample contracts deployed to ${await contract.getAddress()}.`);

  // Only do on testing, or if whitelisted for production
  const registry = await getRegistry();
  await registry.addExternalCollection(await contract.getAddress(), 'ipfs://collectionMeta');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
