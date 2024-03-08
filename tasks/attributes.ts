import { boolean, int } from 'hardhat/internal/core/params/argumentTypes';
import { getAttributesRepository } from './utils';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { task } from 'hardhat/config';
import { ContractTransactionResponse } from 'ethers';

task('attributes:configure', 'Registers access and configures attribute for the collection')
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('attributesKey', 'Attribute Keys')
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

task('attributes:set', 'Sets an attribute for a token in the collection')
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenId', 'TokenId', undefined, int)
  .addPositionalParam(
    'type',
    "Type of the attribute, options are: 'boolean', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKey', 'Attribute Keys')
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

task(
  'attributes:set-multiple-tokens',
  'Sets the same attribute for multiple tokens in the collection',
)
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenIds', 'Comma separated TokenIds. e.g: "1,2,3"')
  .addPositionalParam(
    'type',
    "Type of the attribute, options are: 'boolean', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKey', 'Attribute Keys')
  .addPositionalParam('value', 'Value of the attribute, must be of the type specified.')
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await setAttributeForMultipleTokens(
      hre,
      params.collection,
      params.tokenIds.split(',').map((id: string) => parseInt(id.trim())),
      params.attributesKey,
      params.type,
      params.value,
    );
  });

task(
  'attributes:set-multiple-attributes-multiple-tokens',
  'Sets multiple attributes for multiple tokens in the same collection',
)
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenIds', 'Comma separated TokenIds. e.g: "1,2,3"')
  .addPositionalParam(
    'type',
    "Type of the attribute, options are: 'boolean', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKeys', 'Comma separated Attribute Keys. e.g: "key1,key2,key3"')
  .addPositionalParam('values', 'Comma separated values. e.g: "value1,value2,value3"')
  .addParam(
    'expand',
    'If you setting the same attributes for the same tokens, set this to true and you do not need to set both values multiple times. e.g: tokenids: "1,1,1,2,2,2" and attributes: "key1,key2,key3,key1,key2,key3", becomes tokenids: "1,2" and attributes: "key1,key2,key3". Tokens are expanded first, so values must be "valueToken1Key1,valueToken1Key2,valueToken1Key3,valueToken2Key1,valueToken2Key2,valueToken2Key3"',
    false,
    boolean,
    true,
  )
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await setMultipleAttributesForMultipleTokens(
      hre,
      params.collection,
      params.tokenIds.split(',').map((id: string) => parseInt(id.trim())),
      params.attributesKeys.split(',').map((key: string) => key.trim()),
      params.type,
      params.values.split(',').map((value: string) => value.trim()),
      params.expand,
    );
  });

task('attributes:get', 'Gets attribute for a token in the collection')
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenId', 'TokenId', undefined, int)
  .addPositionalParam(
    'type',
    "Type of the attribute, options are: 'boolean', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKey', 'Attribute Keys')
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await getAttribute(hre, params.collection, params.tokenId, params.type, params.attributesKey);
  });

task('attributes:get-multiple-tokens', 'Gets attribute for multiple tokens in the same collection')
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenIds', 'Comma separated TokenIds. e.g: "1,2,3"')
  .addPositionalParam(
    'type',
    "Type of the attribute, options are: 'boolean', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKey', 'Attribute Keys')
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await getAttributeForMultipleTokens(
      hre,
      params.collection,
      params.tokenIds.split(',').map((id: string) => parseInt(id.trim())),
      params.type,
      params.attributesKey,
    );
  });

task('attributes:get-multiple-attributes', 'Gets multiple attribute for a token in the collection')
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenId', 'TokenId', undefined, int)
  .addPositionalParam(
    'type',
    "Type of the attribute, options are: 'boolean', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKeys', 'Comma separated Attribute Keys. e.g: "key1,key2,key3"')
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await getMultipleAttributesForToken(
      hre,
      params.collection,
      params.tokenId,
      params.type,
      params.attributesKeys.split(',').map((key: string) => key.trim()),
    );
  });

task(
  'attributes:get-multiple-attributes-multiple-tokens',
  'Gets multiple attribute for multiple tokens in the collection',
)
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenIds', 'Comma separated TokenIds. e.g: "1,2,3"')
  .addPositionalParam(
    'type',
    "Type of the attributes, must apply to all. Options are: 'boolean', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKeys', 'Comma separated Attribute Keys. e.g: "key1,key2,key3"')
  .addParam(
    'expand',
    'If you getting the same attributes for the same tokens, set this to true and you do not need to set both values multiple times. e.g: tokenids: "1,1,1,2,2,2" and attributes: "key1,key2,key3,key1,key2,key3", becomes tokenids: "1,2" and attributes: "key1,key2,key3". Tokens are expanded first, so values must be "valueToken1Key1,valueToken1Key2,valueToken1Key3,valueToken2Key1,valueToken2Key2,valueToken2Key3"',
    false,
    boolean,
    true,
  )
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await getMultipleAttributesForMultipleTokens(
      hre,
      params.collection,
      params.tokenIds.split(',').map((id: string) => parseInt(id.trim())),
      params.attributesKeys.split(',').map((key: string) => key.trim()),
      params.type,
      params.expand,
    );
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

async function setAttributeForMultipleTokens(
  hre: HardhatRuntimeEnvironment,
  collection: string,
  tokenIds: number[],
  attributesKey: string,
  type: string,
  value: string,
): Promise<void> {
  const tokenAttributes = await getAttributesRepository(hre);
  let tx: ContractTransactionResponse;
  switch (type) {
    case 'boolean':
      tx = await tokenAttributes.setBoolAttributes([collection], tokenIds, [
        { key: attributesKey, value: Boolean(value) },
      ]);
      break;
    case 'int':
      tx = await tokenAttributes.setUintAttributes([collection], tokenIds, [
        { key: attributesKey, value: parseInt(value) },
      ]);
      break;
    case 'string':
      tx = await tokenAttributes.setStringAttributes([collection], tokenIds, [
        { key: attributesKey, value: value },
      ]);
      break;
    case 'address':
      tx = await tokenAttributes.setAddressAttributes([collection], tokenIds, [
        { key: attributesKey, value: value },
      ]);
      break;
    case 'bytes':
      tx = await tokenAttributes.setBytesAttributes([collection], tokenIds, [
        { key: attributesKey, value: value },
      ]);
      break;
    default:
      throw new Error('Invalid attribute type');
  }
  await tx.wait();
  console.log(`Set attribute ${attributesKey} for multiple tokens in ${collection}`);
}

async function setMultipleAttributesForMultipleTokens(
  hre: HardhatRuntimeEnvironment,
  collection: string,
  tokenIds: number[],
  attributesKeys: string[],
  type: string,
  values: string[],
  expand: boolean,
): Promise<void> {
  ({ tokenIds, attributesKeys } = getExpandedTokenIdsAndAttributes(
    expand,
    tokenIds,
    attributesKeys,
  ));
  if (attributesKeys.length !== values.length || attributesKeys.length !== tokenIds.length)
    throw new Error(
      `Attributes (${attributesKeys.length}), values (${values.length}) and tokenIds (${tokenIds.length}) length must be the same`,
    );

  const tokenAttributes = await getAttributesRepository(hre);
  let tx: ContractTransactionResponse;
  switch (type) {
    case 'boolean':
      tx = await tokenAttributes.setBoolAttributes(
        [collection],
        tokenIds,
        attributesKeys.map((key, index) => {
          return { key, value: Boolean(values[index]) };
        }),
      );
      break;
    case 'int':
      tx = await tokenAttributes.setUintAttributes(
        [collection],
        tokenIds,
        attributesKeys.map((key, index) => {
          return { key, value: parseInt(values[index]) };
        }),
      );
      break;
    case 'string':
      tx = await tokenAttributes.setStringAttributes(
        [collection],
        tokenIds,
        attributesKeys.map((key, index) => {
          return { key, value: values[index] };
        }),
      );
      break;
    case 'address':
      tx = await tokenAttributes.setAddressAttributes(
        [collection],
        tokenIds,
        attributesKeys.map((key, index) => {
          return { key, value: values[index] };
        }),
      );
      break;
    case 'bytes':
      tx = await tokenAttributes.setBytesAttributes(
        [collection],
        tokenIds,
        attributesKeys.map((key, index) => {
          return { key, value: values[index] };
        }),
      );
      break;
    default:
      throw new Error('Invalid attribute type');
  }
  await tx.wait();
  console.log(`Set multiple attributes for multiple tokens in ${collection}`);
}

function getExpandedTokenIdsAndAttributes(
  expand: boolean,
  tokenIds: number[],
  attributesKeys: string[],
) {
  if (expand) {
    const expandedTokenIds: number[] = [];
    const expandedAttributesKeys: string[] = [];
    for (let i = 0; i < tokenIds.length; i++) {
      for (let j = 0; j < attributesKeys.length; j++) {
        expandedTokenIds.push(tokenIds[i]);
        expandedAttributesKeys.push(attributesKeys[j]);
      }
    }
    tokenIds = expandedTokenIds;
    attributesKeys = expandedAttributesKeys;
  }
  return { tokenIds, attributesKeys };
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

async function getAttributeForMultipleTokens(
  hre: HardhatRuntimeEnvironment,
  collection: string,
  tokenIds: number[],
  type: string,
  attributesKey: string,
): Promise<void> {
  const tokenAttributes = await getAttributesRepository(hre);
  console.log(`Getting attribute ${attributesKey} for multiple tokenIds in ${collection}`);
  switch (type) {
    case 'boolean':
      const boolValues = await tokenAttributes.getBoolAttributes([collection], tokenIds, [
        attributesKey,
      ]);
      const mappedBools = tokenIds.map((id, index) => {
        return {
          tokenId: id,
          value: boolValues[index],
        };
      });
      console.log(JSON.stringify(mappedBools, null, 2));
      break;
    case 'int':
      const intValues = await tokenAttributes.getUintAttributes([collection], tokenIds, [
        attributesKey,
      ]);
      const mappedInts = tokenIds.map((id, index) => {
        return {
          tokenId: id,
          value: Number(intValues[index]), // If too big, we should parse to string
        };
      });
      console.log(JSON.stringify(mappedInts, null, 2));
      break;
    case 'string':
      const stringValues = await tokenAttributes.getStringAttributes([collection], tokenIds, [
        attributesKey,
      ]);
      const mappedStrings = tokenIds.map((id, index) => {
        return {
          tokenId: id,
          value: stringValues[index],
        };
      });
      console.log(JSON.stringify(mappedStrings, null, 2));
      break;
    case 'address':
      const addressValues = await tokenAttributes.getAddressAttributes([collection], tokenIds, [
        attributesKey,
      ]);
      const mappedAddresses = tokenIds.map((id, index) => {
        return {
          tokenId: id,
          value: addressValues[index],
        };
      });
      console.log(JSON.stringify(mappedAddresses, null, 2));
      break;
    case 'bytes':
      const bytesValues = await tokenAttributes.getBytesAttributes([collection], tokenIds, [
        attributesKey,
      ]);
      const mappedBytes = tokenIds.map((id, index) => {
        return {
          tokenId: id,
          value: bytesValues[index],
        };
      });
      console.log(JSON.stringify(mappedBytes, null, 2));
      break;
    default:
      throw new Error('Invalid attribute type');
  }
}

async function getMultipleAttributesForToken(
  hre: HardhatRuntimeEnvironment,
  collection: string,
  tokenId: number,
  type: string,
  attributesKeys: string[],
): Promise<void> {
  const tokenAttributes = await getAttributesRepository(hre);
  console.log(`Getting multiple attributes for token ${tokenId} in ${collection}`);
  switch (type) {
    case 'boolean':
      const boolValues = await tokenAttributes.getBoolAttributes(
        [collection],
        [tokenId],
        attributesKeys,
      );
      const mappedBools = attributesKeys.map((key, index) => {
        return {
          key: key,
          value: boolValues[index],
        };
      });
      console.log(JSON.stringify(mappedBools, null, 2));
      break;
    case 'int':
      const intValues = await tokenAttributes.getUintAttributes(
        [collection],
        [tokenId],
        attributesKeys,
      );
      const mappedInts = attributesKeys.map((key, index) => {
        return {
          key: key,
          value: Number(intValues[index]), // If too big, we should parse to string
        };
      });
      console.log(JSON.stringify(mappedInts, null, 2));
      break;
    case 'string':
      const stringValues = await tokenAttributes.getStringAttributes(
        [collection],
        [tokenId],
        attributesKeys,
      );
      const mappedStrings = attributesKeys.map((key, index) => {
        return {
          key: key,
          value: stringValues[index],
        };
      });
      console.log(JSON.stringify(mappedStrings, null, 2));
      break;
    case 'address':
      const addressValues = await tokenAttributes.getAddressAttributes(
        [collection],
        [tokenId],
        attributesKeys,
      );
      const mappedAddresses = attributesKeys.map((key, index) => {
        return {
          key: key,
          value: addressValues[index],
        };
      });
      console.log(JSON.stringify(mappedAddresses, null, 2));
      break;
    case 'bytes':
      const bytesValues = await tokenAttributes.getBytesAttributes(
        [collection],
        [tokenId],
        attributesKeys,
      );
      const mappedBytes = attributesKeys.map((key, index) => {
        return {
          key: key,
          value: bytesValues[index],
        };
      });
      console.log(JSON.stringify(mappedBytes, null, 2));
      break;
    default:
      throw new Error('Invalid attribute type');
  }
}

async function getMultipleAttributesForMultipleTokens(
  hre: HardhatRuntimeEnvironment,
  collection: string,
  tokenIds: number[],
  attributesKeys: string[],
  type: string,
  expand: boolean,
): Promise<void> {
  console.log('Getting multiple attributes for multiple tokens in the same collection');
  ({ tokenIds, attributesKeys } = getExpandedTokenIdsAndAttributes(
    expand,
    tokenIds,
    attributesKeys,
  ));
  if (attributesKeys.length !== tokenIds.length)
    throw new Error(
      `Attributes (${attributesKeys.length}) and tokenIds (${tokenIds.length}) length must be the same`,
    );
  const tokenAttributes = await getAttributesRepository(hre);
  console.log(`Getting multiple attributes for multiple tokens in ${collection}`);
  switch (type) {
    case 'boolean':
      const boolValues = await tokenAttributes.getBoolAttributes(
        [collection],
        tokenIds,
        attributesKeys,
      );
      const mappedBools = attributesKeys.map((key, index) => {
        return {
          tokenId: tokenIds[index],
          key: key,
          value: boolValues[index],
        };
      });
      console.log(JSON.stringify(mappedBools, null, 2));
      break;
    case 'int':
      const intValues = await tokenAttributes.getUintAttributes(
        [collection],
        tokenIds,
        attributesKeys,
      );
      const mappedInts = attributesKeys.map((key, index) => {
        return {
          tokenId: tokenIds[index],
          key: key,
          value: Number(intValues[index]), // If too big, we should parse to string
        };
      });
      console.log(JSON.stringify(mappedInts, null, 2));
      break;
    case 'string':
      const stringValues = await tokenAttributes.getStringAttributes(
        [collection],
        tokenIds,
        attributesKeys,
      );
      const mappedStrings = attributesKeys.map((key, index) => {
        return {
          tokenId: tokenIds[index],
          key: key,
          value: stringValues[index],
        };
      });
      console.log(JSON.stringify(mappedStrings, null, 2));
      break;
    case 'address':
      const addressValues = await tokenAttributes.getAddressAttributes(
        [collection],
        tokenIds,
        attributesKeys,
      );
      const mappedAddresses = attributesKeys.map((key, index) => {
        return {
          tokenId: tokenIds[index],
          key: key,
          value: addressValues[index],
        };
      });
      console.log(JSON.stringify(mappedAddresses, null, 2));
      break;
    case 'bytes':
      const bytesValues = await tokenAttributes.getBytesAttributes(
        [collection],
        tokenIds,
        attributesKeys,
      );
      const mappedBytes = attributesKeys.map((key, index) => {
        return {
          tokenId: tokenIds[index],
          key: key,
          value: bytesValues[index],
        };
      });
      console.log(JSON.stringify(mappedBytes, null, 2));
      break;
    default:
      throw new Error('Invalid attribute type');
  }
}
