import { delay } from '@nomiclabs/hardhat-etherscan/dist/src/etherscan/EtherscanService';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { IRMRKInitData } from '../typechain-types/contracts/SimpleEquippable';
import { run } from 'hardhat';
import { SimpleEquippable } from '../typechain-types';
import { Wallet, utils } from 'zksync-web3';
import * as ethers from 'ethers';

export default async function (hre: HardhatRuntimeEnvironment) {
  console.log('Deploying smart simple equippable contract');

  const wallet = new Wallet(process.env.PRIVATE_KEY || '');

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact('SimpleEquippable');

  const initData: IRMRKInitData.InitDataStruct = {
    erc20TokenAddress: ethers.constants.AddressZero,
    tokenUriIsEnumerable: false,
    royaltyRecipient: ethers.constants.AddressZero,
    royaltyPercentageBps: 1000,
    maxSupply: ethers.BigNumber.from(1000),
    pricePerMint: ethers.utils.parseEther('1.0'),
  };

  const args = ['Kanaria', 'KAN', 'ipfs://collectionMeta', 'ipfs://tokenMeta', initData];

  // Estimate contract deployment fee
  const deploymentFee = await deployer.estimateDeployFee(artifact, args);

  // OPTIONAL: Deposit funds to L2
  // Comment this block if you already have funds on zkSync.
  // const depositHandle = await deployer.zkWallet.deposit({
  //   to: deployer.zkWallet.address,
  //   token: utils.ETH_ADDRESS,
  //   amount: deploymentFee,
  // });
  // // Wait until the deposit is processed on zkSync
  // await depositHandle.wait();

  // Deploy this contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  const kanaria = <SimpleEquippable>await deployer.deploy(artifact, args);

  await kanaria.deployed();
  console.log(`Sample contracts deployed to ${kanaria.address}.`);

  await delay(20000);
  console.log('Will verify now');

  await run(`verify:verify`, {
    address: kanaria.address,
    constructorArguments: args,
    contract: 'contracts/SimpleEquippable.sol:SimpleEquippable',
  });
}
