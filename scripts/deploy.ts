import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
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
    royaltyRecipient: ethers.constants.AddressZero,
    royaltyPercentageBps: 1000,
    maxSupply: BigNumber.from(1000),
    pricePerMint: ethers.utils.parseEther('1.0'),
  };

  const kanaria: SimpleEquippable = await contractFactory.deploy(
    'Kanaria',
    'KAN',
    'ipfs://collectionMeta',
    'ipfs://tokenMeta',
    initData,
  );

  await kanaria.deployed();
  console.log(`Sample contracts deployed to ${kanaria.address}.`);

  // Only do on testing, or if whitelisted for production
  const registry = await getRegistry();
  await registry.addExternalCollection(kanaria.address, 'ipfs://collectionMeta');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
