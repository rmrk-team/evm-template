import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { RMRKEmotesRepository, RMRKTokenAttributesRepository } from '../typechain-types';

const EMOTES_REPOSITORY_ADDRESS = '0x3110735f0b8e71455bae1356a33e428843bcb9a1';
const TOKEN_ATTRIBUTES_REPOSITORY_ADDRESS_DRAFT = '0x4778B7e8088B258A447990e18AdB5fD14B1bD100';
const TOKEN_ATTRIBUTES_AVAILABLE_NETWORKS = [
  // Testing
  'baseSepolia',
  'moonbaseAlpha',
  'sepolia',
  // Production
  'astar',
  'astarZk',
  'base',
  'bob',
  'bsc',
  'mainnet',
  'moonbeam',
];

export async function getEmotesRepository(
  hre: HardhatRuntimeEnvironment,
): Promise<RMRKEmotesRepository> {
  return (await hre.ethers.getContractFactory('RMRKEmotesRepository')).attach(
    EMOTES_REPOSITORY_ADDRESS,
  ) as RMRKEmotesRepository;
}

export async function getAttributesRepository(
  hre: HardhatRuntimeEnvironment,
): Promise<RMRKTokenAttributesRepository> {
  if (!TOKEN_ATTRIBUTES_AVAILABLE_NETWORKS.includes(hre.network.name))
    throw new Error(
      `The network ${hre.network.name} is not supported by this task, please contact us through our telegram so we deploy the draft attributes repo on your network.`,
    );
  return (await hre.ethers.getContractFactory('RMRKTokenAttributesRepository')).attach(
    TOKEN_ATTRIBUTES_REPOSITORY_ADDRESS_DRAFT,
  ) as RMRKTokenAttributesRepository;
}
