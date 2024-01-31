import { ethers, run, network } from 'hardhat';
import { delay } from './utils';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address: ' + (await deployer.getAddress()));

  const bulkwriterFactory = await ethers.getContractFactory('RMRKBulkWriter');
  const bulkwriter = await bulkwriterFactory.deploy();
  await bulkwriter.waitForDeployment();
  const bulkwriterAddress = await bulkwriter.getAddress();
  console.log('Bulk Writer deployed to:', bulkwriterAddress);

  const catalogUtilsFactory = await ethers.getContractFactory('RMRKCatalogUtils');
  const catalogUtils = await catalogUtilsFactory.deploy();
  await catalogUtils.waitForDeployment();
  const catalogUtilsAddress = await catalogUtils.getAddress();
  console.log('Catalog Utils deployed to:', catalogUtilsAddress);

  const collectionUtilsFactory = await ethers.getContractFactory('RMRKCollectionUtils');
  const collectionUtils = await collectionUtilsFactory.deploy();
  await collectionUtils.waitForDeployment();
  const collectionUtilsAddress = await collectionUtils.getAddress();
  console.log('Collection Utils deployed to:', collectionUtilsAddress);

  const renderUtilsFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');
  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.waitForDeployment();
  const renderUtilsAddress = await renderUtils.getAddress();
  console.log('Equip Render Utils deployed to:', renderUtilsAddress);

  if (network.name === 'hardhat' || network.name === 'localhost') {
    // Hardhat
    return;
  }

  // sleep 10s
  delay(10000);

  console.log('Etherscan contract verification starting now.');
  try {
    await run('verify:verify', {
      address: bulkwriterAddress,
      constructorArguments: [],
    });
  } catch (error) {
    // probably already verified
  }

  try {
    await run('verify:verify', {
      address: catalogUtilsAddress,
      constructorArguments: [],
    });
  } catch (error) {
    // probably already verified
  }

  try {
    await run('verify:verify', {
      address: collectionUtilsAddress,
      constructorArguments: [],
    });
  } catch (error) {
    // probably already verified
  }

  try {
    await run('verify:verify', {
      address: renderUtilsAddress,
      constructorArguments: [],
    });
  } catch (error) {
    // probably already verified
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
