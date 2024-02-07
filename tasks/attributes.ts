import { boolean, int } from 'hardhat/internal/core/params/argumentTypes';
import { getAttributesRepository } from './utils';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { task } from 'hardhat/config';
import { ContractTransactionResponse } from 'ethers';

task('attributes:configure', 'Registers access and configures attribute for the collection')
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('attributesKey', 'Address of the collection')
  .addPositionalParam(
    'accessType',
    'Access Type. 0: Issuer, 1: Collaborator, 2: IssuerOrCollaborator, 3: TokenOwner, 4: SpecificAddress.',
    undefined,
    int,
  )
  .addPositionalParam(
    'specificAddress',
    'Specific Address, only if access type is 4.',
    '0x0000000000000000000000000000000000000000',
  )
  .addParam(
    'firstTime',
    'Whether to register access control, only needed for the first time',
    false,
    boolean,
    true,
  )
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await configureAttribute(
      hre,
      params.collection,
      params.attributesKey,
      params.accessType,
      params.specificAddress,
      params.firstTime,
    );
  });

task('attributes:set', 'Sets attribute for a token in the collection')
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenId', 'TokenId', undefined, int)
  .addPositionalParam(
    'type',
    "Type of the attribute, options are: 'boolean', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKey', 'Address of the collection')
  .addPositionalParam('value', 'Value of the attribute, must be of the type specified.')
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await setAttribute(
      hre,
      params.collection,
      params.tokenId,
      params.attributesKey,
      params.type,
      params.value,
    );
  });

task('attributes:get', 'Gets attribute for a token in the collection')
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenId', 'TokenId', undefined, int)
  .addPositionalParam(
    'type',
    "Type of the attribute, options are: 'boolean', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKey', 'Address of the collection')
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await getAttribute(hre, params.collection, params.tokenId, params.type, params.attributesKey);
  });

async function configureAttribute(
  hre: HardhatRuntimeEnvironment,
  collection: string,
  attributesKey: string,
  accessType: number,
  specificAddress: string,
  firstTime: boolean,
): Promise<void> {
  if (accessType === 4 && !specificAddress)
    throw new Error('Specific address is required for access type 4');
  if (accessType < 0 || accessType > 4) throw new Error('Invalid access type');
  const [deployer] = await hre.ethers.getSigners();

  const tokenAttributes = await getAttributesRepository(hre);

  if (firstTime) {
    const tx = await tokenAttributes.registerAccessControl(collection, deployer.address, true);
    await tx.wait();
  }

  let tx = await tokenAttributes.manageAccessControl(
    collection,
    attributesKey,
    accessType,
    specificAddress,
  );
  await tx.wait();

  console.log(
    `Configured attribute ${attributesKey} for ${collection} on ${hre.network.name} blockchain...`,
  );
}

async function setAttribute(
  hre: HardhatRuntimeEnvironment,
  collection: string,
  tokenId: number,
  attributesKey: string,
  type: string,
  value: string,
): Promise<void> {
  const tokenAttributes = await getAttributesRepository(hre);
  let tx: ContractTransactionResponse;
  switch (type) {
    case 'boolean':
      tx = await tokenAttributes.setBoolAttribute(
        collection,
        tokenId,
        attributesKey,
        Boolean(value),
      );
      break;
    case 'int':
      tx = await tokenAttributes.setUintAttribute(
        collection,
        tokenId,
        attributesKey,
        parseInt(value),
      );
      break;
    case 'string':
      tx = await tokenAttributes.setStringAttribute(collection, tokenId, attributesKey, value);
      break;
    case 'address':
      tx = await tokenAttributes.setAddressAttribute(collection, tokenId, attributesKey, value);
      break;
    case 'bytes':
      tx = await tokenAttributes.setBytesAttribute(collection, tokenId, attributesKey, value);
      break;
    default:
      throw new Error('Invalid attribute type');
  }
  await tx.wait();
  console.log(`Set attribute ${attributesKey} for token ${tokenId} in ${collection}`);
}

async function getAttribute(
  hre: HardhatRuntimeEnvironment,
  collection: string,
  tokenId: number,
  type: string,
  attributesKey: string,
): Promise<void> {
  const tokenAttributes = await getAttributesRepository(hre);
  console.log(`Getting attribute ${attributesKey} for token ${tokenId} in ${collection}`);
  switch (type) {
    case 'boolean':
      const boolValue = await tokenAttributes.getBoolAttribute(collection, tokenId, attributesKey);
      console.log(boolValue);
      break;
    case 'int':
      const intValue = await tokenAttributes.getUintAttribute(collection, tokenId, attributesKey);
      console.log(intValue);
      break;
    case 'string':
      const stringValue = await tokenAttributes.getStringAttribute(
        collection,
        tokenId,
        attributesKey,
      );
      console.log(stringValue);
      break;
    case 'address':
      const addressValue = await tokenAttributes.getAddressAttribute(
        collection,
        tokenId,
        attributesKey,
      );
      console.log(addressValue);
      break;
    case 'bytes':
      const bytesValue = await tokenAttributes.getBytesAttribute(
        collection,
        tokenId,
        attributesKey,
      );
      console.log(bytesValue);
      break;
    default:
      throw new Error('Invalid attribute type');
  }
}
