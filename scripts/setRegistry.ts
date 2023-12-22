import { deployments } from 'hardhat';
import { getRegistry } from './getRegistry';

async function main() {
  const { address } = await deployments.get('Kanaria');

  const registry = await getRegistry();
  await registry.addExternalCollection(address, 'ipfs://collectionMeta');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
