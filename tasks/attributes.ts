import { boolean, int } from 'hardhat/internal/core/params/argumentTypes';
import { getAttributesRepository } from './utils';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { task } from 'hardhat/config';
import { ContractTransactionResponse } from 'ethers';
import { RMRKTokenAttributesRepository } from '../typechain-types';

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
    const tokenAttributes = await getAttributesRepository(hre);
    const [deployer] = await hre.ethers.getSigners();
    await configureAttribute(
      tokenAttributes,
      deployer.address,
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
    "Type of the attribute, options are: 'boolean', 'uint', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKey', 'Attribute Keys')
  .addPositionalParam('value', 'Value of the attribute, must be of the type specified.')
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    const tokenAttributes = await getAttributesRepository(hre);
    await setAttribute(
      tokenAttributes,
      params.collection,
      BigInt(params.tokenId),
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
    "Type of the attribute, options are: 'boolean', 'uint', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKey', 'Attribute Keys')
  .addPositionalParam('value', 'Value of the attribute, must be of the type specified.')
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    const tokenAttributes = await getAttributesRepository(hre);
    await setAttributeForMultipleTokens(
      tokenAttributes,
      params.collection,
      params.tokenIds.split(',').map((id: string) => BigInt(id.trim())),
      params.attributesKey,
      params.type,
      params.value,
    );
  });

task(
  'attributes:set-multiple-attributes',
  'Sets multiple attributes for the same token in the collection',
)
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenId', 'TokenId', undefined, int)
  .addPositionalParam(
    'type',
    "Type of the attribute, options are: 'boolean', 'uint', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKeys', 'Comma separated Attribute Keys. e.g: "key1,key2,key3"')
  .addPositionalParam('values', 'Comma separated values. e.g: "value1,value2,value3"')
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    const tokenAttributes = await getAttributesRepository(hre);
    await setMultipleAttributeForToken(
      tokenAttributes,
      params.collection,
      BigInt(params.tokenId),
      params.attributesKeys.split(',').map((key: string) => key.trim()),
      params.type,
      params.values.split(',').map((value: string) => value.trim()),
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
    "Type of the attribute, options are: 'boolean', 'uint', 'int', 'string', 'address', 'bytes'.",
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
    const tokenAttributes = await getAttributesRepository(hre);
    await setMultipleAttributesForMultipleTokens(
      tokenAttributes,
      params.collection,
      params.tokenIds.split(',').map((id: string) => BigInt(id.trim())),
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
    "Type of the attribute, options are: 'boolean', 'uint', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKey', 'Attribute Keys')
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    const tokenAttributes = await getAttributesRepository(hre);
    const result = await getAttribute(
      tokenAttributes,
      params.collection,
      BigInt(params.tokenId),
      params.type,
      params.attributesKey,
    );
    console.log(result);
  });

task('attributes:get-multiple-tokens', 'Gets attribute for multiple tokens in the same collection')
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenIds', 'Comma separated TokenIds. e.g: "1,2,3"')
  .addPositionalParam(
    'type',
    "Type of the attribute, options are: 'boolean', 'uint', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKey', 'Attribute Keys')
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    const tokenAttributes = await getAttributesRepository(hre);
    const result = await getAttributeForMultipleTokens(
      tokenAttributes,
      params.collection,
      params.tokenIds.split(',').map((id: string) => BigInt(id.trim())),
      params.type,
      params.attributesKey,
    );
    // Replace bigint values for string, so json can format it
    const parsedResults = result.map((item) => {
      return {
        tokenId: item.tokenId.toString(),
        value: typeof item.value === 'bigint' ? item.value.toString() : item.value,
      };
    });
    console.log(JSON.stringify(parsedResults, null, 2));
  });

task('attributes:get-multiple-attributes', 'Gets multiple attribute for a token in the collection')
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenId', 'TokenId', undefined, int)
  .addPositionalParam(
    'type',
    "Type of the attribute, options are: 'boolean', 'uint', 'int', 'string', 'address', 'bytes'.",
  )
  .addPositionalParam('attributesKeys', 'Comma separated Attribute Keys. e.g: "key1,key2,key3"')
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    const tokenAttributes = await getAttributesRepository(hre);
    const result = await getMultipleAttributesForToken(
      tokenAttributes,
      params.collection,
      BigInt(params.tokenId),
      params.type,
      params.attributesKeys.split(',').map((key: string) => key.trim()),
    );
    // Replace bigint values for string, so json can format it
    const parsedResults = result.map((item) => {
      return {
        key: item.key,
        value: typeof item.value === 'bigint' ? item.value.toString() : item.value,
      };
    });
    console.log(JSON.stringify(parsedResults, null, 2));
  });

task(
  'attributes:get-multiple-attributes-multiple-tokens',
  'Gets multiple attribute for multiple tokens in the collection',
)
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenIds', 'Comma separated TokenIds. e.g: "1,2,3"')
  .addPositionalParam(
    'type',
    "Type of the attributes, must apply to all. Options are: 'boolean', 'uint', 'int', 'string', 'address', 'bytes'.",
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
    const tokenAttributes = await getAttributesRepository(hre);
    const result = await getMultipleAttributesForMultipleTokens(
      tokenAttributes,
      params.collection,
      params.tokenIds.split(',').map((id: string) => BigInt(id.trim())),
      params.attributesKeys.split(',').map((key: string) => key.trim()),
      params.type,
      params.expand,
    );
    // Replace bigint values for string, so json can format it
    const parsedResults = result.map((item) => {
      return {
        tokenId: item.tokenId.toString(),
        key: item.key,
        value: typeof item.value === 'bigint' ? item.value.toString() : item.value,
      };
    });
    console.log(JSON.stringify(parsedResults, null, 2));
  });

export async function configureAttribute(
  tokenAttributes: RMRKTokenAttributesRepository,
  ownerAddress: string,
  collection: string,
  attributesKey: string,
  accessType: number,
  specificAddress: string,
  firstTime: boolean,
): Promise<void> {
  if (accessType === 4 && !specificAddress)
    throw new Error('Specific address is required for access type 4');
  if (accessType < 0 || accessType > 4) throw new Error('Invalid access type');

  if (firstTime) {
    const tx = await tokenAttributes.registerAccessControl(collection, ownerAddress, true);
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
    `Configured attribute ${attributesKey} for ${collection}. Access type: ${accessType}`,
  );
}

export async function setAttribute(
  tokenAttributes: RMRKTokenAttributesRepository,
  collection: string,
  tokenId: bigint,
  attributesKey: string,
  type: string,
  value: string,
): Promise<void> {
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
    case 'uint':
      tx = await tokenAttributes.setUintAttribute(
        collection,
        tokenId,
        attributesKey,
        parseInt(value),
      );
      break;
    case 'int':
      tx = await tokenAttributes.setIntAttribute(
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

export async function setAttributeForMultipleTokens(
  tokenAttributes: RMRKTokenAttributesRepository,
  collection: string,
  tokenIds: bigint[],
  attributesKey: string,
  type: string,
  value: string,
): Promise<void> {
  let tx: ContractTransactionResponse;
  switch (type) {
    case 'boolean':
      tx = await tokenAttributes.setBoolAttributes([collection], tokenIds, [
        { key: attributesKey, value: Boolean(value) },
      ]);
      break;
    case 'uint':
      tx = await tokenAttributes.setUintAttributes([collection], tokenIds, [
        { key: attributesKey, value: parseInt(value) },
      ]);
      break;
    case 'int':
      tx = await tokenAttributes.setIntAttributes([collection], tokenIds, [
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

export async function setMultipleAttributeForToken(
  tokenAttributes: RMRKTokenAttributesRepository,
  collection: string,
  tokenId: bigint,
  attributesKeys: string[],
  type: string,
  values: string[],
): Promise<void> {
  if (attributesKeys.length !== values.length)
    throw new Error(
      `Attributes (${attributesKeys.length}) and values (${values.length}) length must be the same`,
    );
  let tx: ContractTransactionResponse;
  switch (type) {
    case 'boolean':
      tx = await tokenAttributes.setBoolAttributes(
        [collection],
        [tokenId],
        attributesKeys.map((key, index) => {
          return { key, value: Boolean(values[index]) };
        }),
      );
      break;
    case 'uint':
      tx = await tokenAttributes.setUintAttributes(
        [collection],
        [tokenId],
        attributesKeys.map((key, index) => {
          return { key, value: parseInt(values[index]) };
        }),
      );
      break;
    case 'int':
      tx = await tokenAttributes.setIntAttributes(
        [collection],
        [tokenId],
        attributesKeys.map((key, index) => {
          return { key, value: parseInt(values[index]) };
        }),
      );
      break;
    case 'string':
      tx = await tokenAttributes.setStringAttributes(
        [collection],
        [tokenId],
        attributesKeys.map((key, index) => {
          return { key, value: values[index] };
        }),
      );
      break;
    case 'address':
      tx = await tokenAttributes.setAddressAttributes(
        [collection],
        [tokenId],
        attributesKeys.map((key, index) => {
          return { key, value: values[index] };
        }),
      );
      break;
    case 'bytes':
      tx = await tokenAttributes.setBytesAttributes(
        [collection],
        [tokenId],
        attributesKeys.map((key, index) => {
          return { key, value: values[index] };
        }),
      );
      break;
    default:
      throw new Error('Invalid attribute type');
  }
  await tx.wait();
  console.log(`Set multiple attributes for token ${tokenId} in ${collection}`);
}

export async function setMultipleAttributesForMultipleTokens(
  tokenAttributes: RMRKTokenAttributesRepository,
  collection: string,
  tokenIds: bigint[],
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
    case 'uint':
      tx = await tokenAttributes.setUintAttributes(
        [collection],
        tokenIds,
        attributesKeys.map((key, index) => {
          return { key, value: parseInt(values[index]) };
        }),
      );
      break;
    case 'int':
      tx = await tokenAttributes.setIntAttributes(
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
  tokenIds: bigint[],
  attributesKeys: string[],
) {
  if (expand) {
    const expandedTokenIds: bigint[] = [];
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

export async function getAttribute(
  tokenAttributes: RMRKTokenAttributesRepository,
  collection: string,
  tokenId: bigint,
  type: string,
  attributesKey: string,
): Promise<boolean | bigint | string> {
  console.log(`Getting attribute ${attributesKey} for token ${tokenId} in ${collection}`);
  switch (type) {
    case 'boolean':
      const boolValue = await tokenAttributes.getBoolAttribute(collection, tokenId, attributesKey);
      return boolValue;
    case 'uint':
      const uintValue = await tokenAttributes.getUintAttribute(collection, tokenId, attributesKey);
      return uintValue;
    case 'int':
      const intValue = await tokenAttributes.getIntAttribute(collection, tokenId, attributesKey);
      return intValue;
    case 'string':
      const stringValue = await tokenAttributes.getStringAttribute(
        collection,
        tokenId,
        attributesKey,
      );
      return stringValue;
    case 'address':
      const addressValue = await tokenAttributes.getAddressAttribute(
        collection,
        tokenId,
        attributesKey,
      );
      return addressValue;
    case 'bytes':
      const bytesValue = await tokenAttributes.getBytesAttribute(
        collection,
        tokenId,
        attributesKey,
      );
      return bytesValue;
    default:
      throw new Error('Invalid attribute type');
  }
}

export async function getAttributeForMultipleTokens(
  tokenAttributes: RMRKTokenAttributesRepository,
  collection: string,
  tokenIds: bigint[],
  type: string,
  attributesKey: string,
): Promise<{ tokenId: bigint; value: boolean | bigint | string }[]> {
  console.log(`Getting attribute ${attributesKey} for multiple tokenIds in ${collection}`);
  switch (type) {
    case 'boolean':
      const boolValues = await tokenAttributes.getBoolAttributes([collection], tokenIds, [
        attributesKey,
      ]);
      return tokenIds.map((id, index) => {
        return {
          tokenId: id,
          value: boolValues[index],
        };
      });
    case 'uint':
      const uintValues = await tokenAttributes.getUintAttributes([collection], tokenIds, [
        attributesKey,
      ]);
      return tokenIds.map((id, index) => {
        return {
          tokenId: id,
          value: uintValues[index],
        };
      });
    case 'int':
      const intValues = await tokenAttributes.getIntAttributes([collection], tokenIds, [
        attributesKey,
      ]);
      return tokenIds.map((id, index) => {
        return {
          tokenId: id,
          value: intValues[index],
        };
      });
    case 'string':
      const stringValues = await tokenAttributes.getStringAttributes([collection], tokenIds, [
        attributesKey,
      ]);
      return tokenIds.map((id, index) => {
        return {
          tokenId: id,
          value: stringValues[index],
        };
      });
    case 'address':
      const addressValues = await tokenAttributes.getAddressAttributes([collection], tokenIds, [
        attributesKey,
      ]);
      return tokenIds.map((id, index) => {
        return {
          tokenId: id,
          value: addressValues[index],
        };
      });
    case 'bytes':
      const bytesValues = await tokenAttributes.getBytesAttributes([collection], tokenIds, [
        attributesKey,
      ]);
      return tokenIds.map((id, index) => {
        return {
          tokenId: id,
          value: bytesValues[index],
        };
      });
    default:
      throw new Error('Invalid attribute type');
  }
}

export async function getMultipleAttributesForToken(
  tokenAttributes: RMRKTokenAttributesRepository,
  collection: string,
  tokenId: bigint,
  type: string,
  attributesKeys: string[],
): Promise<{ key: string; value: boolean | bigint | string }[]> {
  console.log(`Getting multiple attributes for token ${tokenId} in ${collection}`);
  switch (type) {
    case 'boolean':
      const boolValues = await tokenAttributes.getBoolAttributes(
        [collection],
        [tokenId],
        attributesKeys,
      );
      return attributesKeys.map((key, index) => {
        return {
          key: key,
          value: boolValues[index],
        };
      });
    case 'uint':
      const uintValues = await tokenAttributes.getUintAttributes(
        [collection],
        [tokenId],
        attributesKeys,
      );
      return attributesKeys.map((key, index) => {
        return {
          key: key,
          value: uintValues[index],
        };
      });
    case 'int':
      const intValues = await tokenAttributes.getIntAttributes(
        [collection],
        [tokenId],
        attributesKeys,
      );
      return attributesKeys.map((key, index) => {
        return {
          key: key,
          value: intValues[index],
        };
      });
    case 'string':
      const stringValues = await tokenAttributes.getStringAttributes(
        [collection],
        [tokenId],
        attributesKeys,
      );
      return attributesKeys.map((key, index) => {
        return {
          key: key,
          value: stringValues[index],
        };
      });
    case 'address':
      const addressValues = await tokenAttributes.getAddressAttributes(
        [collection],
        [tokenId],
        attributesKeys,
      );
      return attributesKeys.map((key, index) => {
        return {
          key: key,
          value: addressValues[index],
        };
      });
    case 'bytes':
      const bytesValues = await tokenAttributes.getBytesAttributes(
        [collection],
        [tokenId],
        attributesKeys,
      );
      return attributesKeys.map((key, index) => {
        return {
          key: key,
          value: bytesValues[index],
        };
      });
    default:
      throw new Error('Invalid attribute type');
  }
}

export async function getMultipleAttributesForMultipleTokens(
  tokenAttributes: RMRKTokenAttributesRepository,
  collection: string,
  tokenIds: bigint[],
  attributesKeys: string[],
  type: string,
  expand: boolean,
): Promise<{ tokenId: bigint; key: string; value: boolean | bigint | string }[]> {
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
  console.log(`Getting multiple attributes for multiple tokens in ${collection}`);
  switch (type) {
    case 'boolean':
      const boolValues = await tokenAttributes.getBoolAttributes(
        [collection],
        tokenIds,
        attributesKeys,
      );
      return attributesKeys.map((key, index) => {
        return {
          tokenId: tokenIds[index],
          key: key,
          value: boolValues[index],
        };
      });
    case 'uint':
      const uintValues = await tokenAttributes.getUintAttributes(
        [collection],
        tokenIds,
        attributesKeys,
      );
      return attributesKeys.map((key, index) => {
        return {
          tokenId: tokenIds[index],
          key: key,
          value: uintValues[index],
        };
      });
    case 'int':
      const intValues = await tokenAttributes.getIntAttributes(
        [collection],
        tokenIds,
        attributesKeys,
      );
      return attributesKeys.map((key, index) => {
        return {
          tokenId: tokenIds[index],
          key: key,
          value: intValues[index],
        };
      });
    case 'string':
      const stringValues = await tokenAttributes.getStringAttributes(
        [collection],
        tokenIds,
        attributesKeys,
      );
      return attributesKeys.map((key, index) => {
        return {
          tokenId: tokenIds[index],
          key: key,
          value: stringValues[index],
        };
      });
    case 'address':
      const addressValues = await tokenAttributes.getAddressAttributes(
        [collection],
        tokenIds,
        attributesKeys,
      );
      return attributesKeys.map((key, index) => {
        return {
          tokenId: tokenIds[index],
          key: key,
          value: addressValues[index],
        };
      });
    case 'bytes':
      const bytesValues = await tokenAttributes.getBytesAttributes(
        [collection],
        tokenIds,
        attributesKeys,
      );
      return attributesKeys.map((key, index) => {
        return {
          tokenId: tokenIds[index],
          key: key,
          value: bytesValues[index],
        };
      });
    default:
      throw new Error('Invalid attribute type');
  }
}
