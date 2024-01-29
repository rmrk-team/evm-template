import { ethers, run, network } from 'hardhat';
import { delay } from './utils';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address: ' + (await deployer.getAddress()));

  const catalogMetadataUri = undefined; // TODO: Replace with IPFS with metadata for collection, e.g. 'ipfs://collectionMeta.json' See https://evm.rmrk.app/metadata#catalog for more info on expected content
  const catalogType = undefined; // TODO: Replace with catalog mime type, e.g. 'image/png'

  if (catalogMetadataUri === undefined || catalogType === undefined) {
    console.log('Please set catalogMetadataUri and catalogType in scripts/run-deploy-catalog.ts');
    return;
  }

  const catalogFactory = await ethers.getContractFactory('RMRKCatalogImpl');
  const catalog = await catalogFactory.deploy(catalogMetadataUri, catalogType);
  await catalog.waitForDeployment();
  const catalogAddress = await catalog.getAddress();
  console.log('Catalog deployed to:', catalogAddress);

  if (network.config.chainId === 31337) {
    // Hardhat
    return;
  }

  // sleep 10s
  delay(10000);

  console.log('Etherscan contract verification starting now.');
  try {
    await run('verify:verify', {
      address: catalogAddress,
      constructorArguments: [catalogMetadataUri, catalogType],
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
