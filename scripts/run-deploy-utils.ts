import { ethers } from 'hardhat';
import {
  deployBulkWriter,
  deployCatalogUtils,
  deployCollectionUtils,
  deployRenderUtils,
} from './deploy-methods';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  await deployBulkWriter();
  await deployCatalogUtils();
  await deployCollectionUtils();
  await deployRenderUtils();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
