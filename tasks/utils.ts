import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { RMRKEmotesRepository, RMRKTokenAttributesRepository } from '../typechain-types';

const EMOTES_REPOSITORY_ADDRESS = '0x3110735f0b8e71455bae1356a33e428843bcb9a1';
const TOKEN_ATTRIBUTES_REPOSITORY_ADDRESS_DRAFT = '0x7E57110C7Ca7Ed1acf0be6220d8945fe09f461A4';
const TOKEN_ATTRIBUTES_REPOSITORY_ADDRESS_DRAFT_MOONBASE =
  '0xE5CF7218253535E019bb4B38Fb9d0167BB6D049e';
const TOKEN_ATTRIBUTES_AVAILABLE_NETWORKS = [
  'baseSepolia',
  'modularium',
  'moonbaseAlpha',
  'polygonMumbai',
  'sepolia',
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
    hre.network.name === 'moonbaseAlpha'
      ? TOKEN_ATTRIBUTES_REPOSITORY_ADDRESS_DRAFT_MOONBASE
      : TOKEN_ATTRIBUTES_REPOSITORY_ADDRESS_DRAFT,
  ) as RMRKTokenAttributesRepository;
}
