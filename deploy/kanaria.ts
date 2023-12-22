import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'hardhat';
import { InitDataNativePay } from '../typechain-types/contracts/SimpleEquippable';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // if using named accounts on hardhat.config.ts then use getNamedAccounts instead
  //const { deployer } = await hre.getNamedAccounts();
  const [deployer] = await hre.getUnnamedAccounts();
  const { deploy } = hre.deployments;

  const initData: InitDataNativePay.InitDataStruct = {
    royaltyRecipient: ethers.constants.AddressZero,
    royaltyPercentageBps: 1000,
    maxSupply: ethers.BigNumber.from(1000),
    pricePerMint: ethers.utils.parseEther('1.0'),
  };

  const kanaria = await deploy('Kanaria', {
    from: deployer,
    contract: 'SimpleEquippable',
    args: ['Kanaria', 'KAN', 'ipfs://collectionMeta', 'ipfs://tokenMeta', initData],
    log: true,
  });

  // Only do on testing, or if whitelisted for production
  // const registry = await getRegistry();
  // await registry.addExternalCollection(kanaria.address, 'ipfs://collectionMeta');
};
export default func;
func.id = 'kanaria'; // id required to prevent reexecution
func.tags = ['kanaria'];
