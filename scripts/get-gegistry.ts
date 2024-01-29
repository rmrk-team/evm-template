import { ethers, network } from 'hardhat';
import { MockRMRKRegistry } from '../typechain-types';

export async function getRegistry(): Promise<MockRMRKRegistry> {
  const registryAddress = await getRegistryAddress();
  const contractFactory = await ethers.getContractFactory('MockRMRKRegistry');
  return <MockRMRKRegistry>contractFactory.attach(registryAddress);
}

async function getRegistryAddress(): Promise<string> {
  switch (network.config.chainId) {
    // Moonbase Alpha or Hardhat
    case 1287:
      return '0xCEd0e87a29A2570A5866f4a4F3e45fA1dd82FD53';
    // Moonbeam
    case 1284:
      return '0x439b93AB25c95d97ccdd1F3c36317f7FC52aE55b';
    // Sepolia
    case 11155111:
      return '0x46d4646f62B8FF9dF717DF40e98A08A0F3b270A5';
    // Mumbai
    case 80001:
      return '0x96f18a5F8C1657C6567bE498E41d2760552e3189';
    // Ethereum
    case 1:
      return '0xa9c01de4f9c1E550E869E550d3B08498bA1D38F3';
    // Polygon
    case 137:
      return '0x6FF2297d733896cB3bF0432D8Cb829570233bD04';
    // Base Sepolia
    case 84532:
      return '0xAB79599164Df5E354eeDDf8B07eC215D3aBf3FAc';
    // Base
    case 8453:
      return '0xcb79fF273170863B74eB126303Cf1E4a61f68fAE';
    // Astar
    case 592:
      return '0x96FB7Eb4419FccF7fD97Fc6E39Ee1f0541c12508';
    // BSC
    case 56:
      return '0x415aEcB40E26Cda3D3Db8b475F56198A994501ea';
    default:
      throw new Error('Unexpected network!');
  }
}
