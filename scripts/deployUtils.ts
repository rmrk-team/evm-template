import { ethers, run } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address: ' + (await deployer.getAddress()));

  const bulkwriterFactory = await ethers.getContractFactory('RMRKBulkWriter');
  const bulkwriter = await bulkwriterFactory.deploy();
  await bulkwriter.waitForDeployment();
  console.log('Bulk Writer deployed to:', await bulkwriter.getAddress());

  const catalogUtilsFactory = await ethers.getContractFactory('RMRKCatalogUtils');
  const catalogUtils = await catalogUtilsFactory.deploy();
  await catalogUtils.waitForDeployment();
  console.log('Catalog Utils deployed to:', await catalogUtils.getAddress());

  const collectionUtilsFactory = await ethers.getContractFactory('RMRKCollectionUtils');
  const collectionUtils = await collectionUtilsFactory.deploy();
  await collectionUtils.waitForDeployment();
  console.log('Collection Utils deployed to:', await collectionUtils.getAddress());

  const renderUtilsFactory = await ethers.getContractFactory('RMRKEquipRenderUtils');
  const renderUtils = await renderUtilsFactory.deploy();
  await renderUtils.waitForDeployment();
  console.log('Equip Render Utils deployed to:', await renderUtils.getAddress());

  // Get chain id
  const chainId = await ethers.provider.getNetwork().then((network) => network.chainId);
  if (chainId === 31337n) {
    // Hardhat
    return;
  }

  // sleep 10s
  await new Promise((r) => setTimeout(r, 10000));

  console.log('Etherscan contract verification starting now.');
  try {
    await run('verify:verify', {
      address: await bulkwriter.getAddress(),
      constructorArguments: [],
    });
  } catch (error) {
    // probably already verified
  }

  try {
    await run('verify:verify', {
      address: await catalogUtils.getAddress(),
      constructorArguments: [],
    });
  } catch (error) {
    // probably already verified
  }

  try {
    await run('verify:verify', {
      address: await collectionUtils.getAddress(),
      constructorArguments: [],
    });
  } catch (error) {
    // probably already verified
  }

  try {
    await run('verify:verify', {
      address: await renderUtils.getAddress(),
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
