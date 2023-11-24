import { ethers } from 'hardhat';
import { MockRMRKRegistry } from '../typechain-types';

export async function getRegistry(): Promise<MockRMRKRegistry> {
  const registryAddress = await getRegistryAddress();
  const contractFactory = await ethers.getContractFactory('MockRMRKRegistry');
  return <MockRMRKRegistry>await contractFactory.attach(registryAddress);
}

async function getRegistryAddress(): Promise<string> {
  const chainId = await ethers.provider.getNetwork().then((network) => network.chainId);
  if (chainId === 1287)
    // Moonbase Alpha or Hardhat
    return '0xCEd0e87a29A2570A5866f4a4F3e45fA1dd82FD53';
  else if (chainId === 1284)
    // Moonbeam
    return '0x439b93AB25c95d97ccdd1F3c36317f7FC52aE55b';
  else if (chainId === 11155111)
    // Sepolia
    return '0x46d4646f62B8FF9dF717DF40e98A08A0F3b270A5';
  else if (chainId === 80001)
    // Mumbai
    return '0x96f18a5F8C1657C6567bE498E41d2760552e3189';
  else if (chainId === 1)
    // Ethereum
    return '0xa9c01de4f9c1E550E869E550d3B08498bA1D38F3';
  else if (chainId === 137)
    // Polygon
    return '0x6FF2297d733896cB3bF0432D8Cb829570233bD04';
  else if (chainId === 84531)
    // Base Goerli
    return '0x0FB4A16AB622bd7BD9D3046d4C3c92C254f42beF';
  else if (chainId === 8453)
    // Base
    return '0xcb79fF273170863B74eB126303Cf1E4a61f68fAE';
  else if (chainId === 81)
    // Shibuya
    return '0xAEc04D22642F66109AF79E6b5ED4876193568999';
  else if (chainId === 592)
    // Astar
    return '0x96FB7Eb4419FccF7fD97Fc6E39Ee1f0541c12508';
  else if (chainId === 56)
    // BSC
    return '0x415aEcB40E26Cda3D3Db8b475F56198A994501ea';
  else throw new Error('Unexpected network!');
}
