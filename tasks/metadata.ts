import { string, int } from 'hardhat/internal/core/params/argumentTypes';
import { task } from 'hardhat/config';
import fs from 'fs';
import { parse } from 'csv-parse';

const METADATA_DIR_FOR_COLLECTIONS = './metadata/:collection-slug';
const METADATA_DIR_FOR_TOKEN_URIS = './metadata/:collection-slug/tokenURIs';
const METADATA_DIR_FOR_ASSETS = './metadata/:collection-slug/assets';
const METADATA_DIR_FOR_CATALOG = './metadata/catalog';
const METADATA_DIR_FOR_FIXED_PARTS = `${METADATA_DIR_FOR_CATALOG}/fixed`;
const METADATA_DIR_FOR_SLOT_PARTS = `${METADATA_DIR_FOR_CATALOG}/slot`;
const VALID_TYPES = ['number', 'float', 'integer', 'string', 'date', 'percentage', 'boolean'];

interface CollectionMetadata {
  name: string;
  description: string;
  image: string;
  externalUri?: string;
  thumbnailUri?: string;
  license?: string;
  licenseUri?: string;
  tags?: string[];
}

interface Attribute {
  label: string;
  trait_type: string;
  type: string;
  value: string;
}

interface TokenOrAssetMetadata {
  name: string;
  description: string;
  mediaUri: string;
  image: string;
  externalUri?: string;
  external_url?: string;
  thumbnailUri?: string;
  animation_url?: string;
  license?: string;
  licenseUri?: string;
  attributes?: Attribute[];
}

interface PartMetadata {
  name: string;
  description?: string;
  mediaUri?: string;
}

task(
  'metadata:collection',
  'Creates the metadata for a collection under the metadata/collections directory.',
)
  .addPositionalParam(
    'collectionSlug',
    'Used to group the metadata for a specific collection in a unique way. e.g. "dot-leap-badges".',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'name',
    'Name of the collection, e.g. "Dot Leap badges".',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'description',
    'Description of the collection as a whole. Markdown is supported.',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'mediaUri',
    "HTTP or IPFS URL to project's main image, in the vein of og:image. If IPFS, MUST be in the format of ipfs://HASH",
    undefined,
    string,
    false,
  )
  .addParam(
    'externalUri',
    'HTTP or IPFS URL for finding out more about this project. If IPFS, MUST be in the format of ipfs://HASH',
    undefined,
    string,
    true,
  )
  .addParam(
    'thumbnailUri',
    'A URI to an image of the collection for wallets and client applications to have a scaled down image to present to end-users. Recommend maximum size of 350x350px.',
    undefined,
    string,
    true,
  )
  .addParam(
    'animationUri',
    'For backwards compatibility with ERC721Metadata. A URL to a multi-media attachment for the asset. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA.',
    undefined,
    string,
    true,
  )
  .addParam('license', 'A statement about the NFT license.', undefined, string, true)
  .addParam('licenseUri', 'A URI to a statement of license.', undefined, string, true)
  .addParam(
    'tags',
    'Comma separated values, They are converted into an array of string values, used to help marketplaces to categorize your NFT.',
    undefined,
    string,
    true,
  )
  .setAction(async (params) => {
    generateCollectionMetadata(
      params.collectionSlug,
      params.name,
      params.description,
      params.mediaUri,
      params.externalUri,
      params.thumbnailUri,
      params.license,
      params.licenseUri,
      params.tags,
    );
  });

task('metadata:catalog', 'Creates the metadata for a catalog under the metadata/catalog directory.')
  .addPositionalParam(
    'name',
    'Name of the collection, e.g. "Dot Leap badges".',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'description',
    'Description of the collection as a whole. Markdown is supported.',
    undefined,
    string,
    false,
  )
  .setAction(async (params) => {
    generateCatalogMetadata(params.name, params.description);
  });

task('metadata:token', 'Creates the metadata for a token under the metadata/tokensUris directory.')
  .addPositionalParam(
    'collectionSlug',
    'Used to group the metadata for a specific collection in a unique way. e.g. "dot-leap-badges".',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'filename',
    'Used to name the metadata file, ".json" extension is automatically appended. It should the tokenId if tokenURI is enumerated.',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'name',
    'Identifies the asset to which this NFT represents.',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'description',
    'Describes the asset to which this NFT represents.',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'mediaUri',
    'A URI pointing to a resource with mime type image/* representing the asset to which this NFT represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive.',
    undefined,
    string,
    false,
  )
  .addParam(
    'externalUri',
    'HTTP or IPFS URL for finding out more about this project. If IPFS, MUST be in the format of ipfs://HASH',
    undefined,
    string,
    true,
  )
  .addParam(
    'thumbnailUri',
    'A URI to an image of the NFT for wallets and client applications to have a scaled down image to present to end-users. Recommend maximum size of 350x350px.',
    undefined,
    string,
    true,
  )
  .addParam(
    'animationUri',
    'For backwards compatibility with ERC721Metadata. A URL to a multi-media attachment for the asset. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA.',
    undefined,
    string,
    true,
  )
  .addParam('license', 'A statement about the NFT license.', undefined, string, true)
  .addParam('licenseUri', 'A URI to a statement of license.', undefined, string, true)
  .addParam(
    'attributes',
    'Comma separated values in the form of "LABEL:TYPE:VALUE", e.g: "color:string:green". They are converted into an array of custom attributes about the subject or content of the asset.',
    undefined,
    string,
    true,
  )
  .setAction(async (params) => {
    generateTokenMetadata(
      params.collectionSlug,
      params.filename,
      params.name,
      params.description,
      params.mediaUri,
      params.externalUri,
      params.thumbnailUri,
      params.animationUri,
      params.license,
      params.licenseUri,
      params.attributes,
    );
  });

task('metadata:asset', 'Creates the metadata for an asset under the metadata/assets directory.')
  .addPositionalParam(
    'collectionSlug',
    'Used to group the metadata for a specific collection in a unique way. e.g. "dot-leap-badges".',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'filename',
    'Used to name the metadata file, ".json" extension is automatically appended.',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'name',
    'Identifies the asset to which this NFT represents.',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'description',
    'Describes the asset to which this NFT represents.',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'mediaUri',
    'A URI pointing to a resource with mime type image/* representing the asset to which this NFT represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive.',
    undefined,
    string,
    false,
  )
  .addParam(
    'externalUri',
    'HTTP or IPFS URL for finding out more about this project. If IPFS, MUST be in the format of ipfs://HASH',
    undefined,
    string,
    true,
  )
  .addParam(
    'thumbnailUri',
    'A URI to an image of the NFT for wallets and client applications to have a scaled down image to present to end-users. Recommend maximum size of 350x350px.',
    undefined,
    string,
    true,
  )
  .addParam('license', 'A statement about the NFT license.', undefined, string, true)
  .addParam('licenseUri', 'A URI to a statement of license.', undefined, string, true)
  .addParam(
    'attributes',
    'Comma separated values in the form of "LABEL:TYPE:VALUE", e.g: "color:string:green". They are converted into an array of custom attributes about the subject or content of the asset.',
    undefined,
    string,
    true,
  )
  .setAction(async (params) => {
    generateAssetMetadata(
      params.collectionSlug,
      params.filename,
      params.name,
      params.description,
      params.mediaUri,
      params.externalUri,
      params.thumbnailUri,
      params.animationUri,
      params.license,
      params.licenseUri,
      params.attributes,
    );
  });

task(
  'metadata:slot-part',
  'Creates the metadata for a slot part under the metadata/catalog/slots directory.',
)
  .addPositionalParam(
    'name',
    'Identifies the asset to which this Slot represents.',
    undefined,
    string,
    false,
  )
  .addParam(
    'fallbackMediaUri',
    'Optional, will be used as fallback if the slot is not equipped by any asset.',
    undefined,
    string,
    true,
  )
  .addParam(
    'description',
    'Describes the asset to which this NFT represents.',
    undefined,
    string,
    true,
  )
  .setAction(async (params) => {
    generateslotPartMetadata(params.name, params.description, params.fallbackMediaUri);
  });

task(
  'metadata:fixed-part',
  'Creates the metadata for a fixed part under the metadata/catalog/fixed directory.',
)
  .addPositionalParam(
    'name',
    'Identifies the asset to which this part represents.',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'mediaUri',
    'Image to display. MUST be in the format of ipfs://HASH"',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'description',
    'Describes the asset to which this part represents.',
    undefined,
    string,
    true,
  )
  .setAction(async (params) => {
    generateFixedPartMetadata(params.name, params.description, params.mediaUri);
  });

task(
  'metadata:collections-csv',
  'Creates the metadata for a collection under the metadata/collections directory. The passed externalUri and license data will be used for all collections in the CSV. The CSV must have the EXACT following headers: collectionSlug, name, description, mediaUri, thumbnailUri, tags.',
)
  .addPositionalParam(
    'path',
    'Path to csv with collection metadata, See metadata/collections.csv for reference. Do not remove the headers.',
    './metadata/collections.csv',
    string,
    true,
  )
  .addParam(
    'externalUri',
    'HTTP or IPFS URL for finding out more about this project. If IPFS, MUST be in the format of ipfs://HASH',
    undefined,
    string,
    true,
  )
  .addParam('license', 'A statement about the NFT license.', undefined, string, true)
  .addParam('licenseUri', 'A URI to a statement of license.', undefined, string, true)
  .addParam(
    'baseUri',
    'A URI to prepend to mediaUri and thumbnailUri for every collection.',
    undefined,
    string,
    true,
  )
  .setAction(async (params) => {
    await generateMultipleCollectionsMetadata(
      params.path,
      params.externalUri,
      params.license,
      params.licenseUri,
      params.baseUri || '',
    );
  });

task(
  'metadata:tokens-csv',
  'Creates the metadata for tokens of a collection under the metadata/collections directory. The passed externalUri and license data will be used for all collections in the CSV. The CSV must have the EXACT following headers: filename, name, description, mediaUri, thumbnailUri, animationUri, attributes.',
)
  .addPositionalParam(
    'collectionSlug',
    'Used to group the metadata for a specific collection in a unique way. e.g. "dot-leap-badges".',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'path',
    'Path to csv with collection metadata, See metadata/tokens.csv for reference. Do not remove the headers.',
    './metadata/tokens.csv',
    string,
    true,
  )
  .addParam(
    'externalUri',
    'HTTP or IPFS URL for finding out more about this project. If IPFS, MUST be in the format of ipfs://HASH',
    undefined,
    string,
    true,
  )
  .addParam('license', 'A statement about the NFT license.', undefined, string, true)
  .addParam('licenseUri', 'A URI to a statement of license.', undefined, string, true)
  .addParam(
    'baseUri',
    'A URI to prepend to mediaUri, thumbnailUri and animationUri for every token.',
    undefined,
    string,
    true,
  )
  .setAction(async (params) => {
    await generateMultipleTokenMetadata(
      params.path,
      params.collectionSlug,
      params.externalUri,
      params.license,
      params.licenseUri,
      params.baseUri || '',
    );
  });

task(
  'metadata:assets-csv',
  'Creates the metadata for assets of a collection under the metadata/collections directory. The passed externalUri and license data will be used for all collections in the CSV. The CSV must have the EXACT following headers: filename, name, description, mediaUri, thumbnailUri, animationUri, attributes.',
)
  .addPositionalParam(
    'collectionSlug',
    'Used to group the metadata for a specific collection in a unique way. e.g. "dot-leap-badges".',
    undefined,
    string,
    false,
  )
  .addPositionalParam(
    'path',
    'Path to csv with collection metadata, See metadata/assets.csv for reference. Do not remove the headers.',
    './metadata/assets.csv',
    string,
    true,
  )
  .addParam(
    'externalUri',
    'HTTP or IPFS URL for finding out more about this project. If IPFS, MUST be in the format of ipfs://HASH',
    undefined,
    string,
    true,
  )
  .addParam('license', 'A statement about the NFT license.', undefined, string, true)
  .addParam('licenseUri', 'A URI to a statement of license.', undefined, string, true)
  .addParam(
    'baseUri',
    'A URI to prepend to mediaUri, thumbnailUri and animationUri for every asset.',
    undefined,
    string,
    true,
  )
  .setAction(async (params) => {
    await generateMultipleAssetMetadata(
      params.path,
      params.collectionSlug,
      params.externalUri,
      params.license,
      params.licenseUri,
      params.baseUri || '',
    );
  });

task(
  'metadata:slot-parts-csv',
  'Creates the metadata for slot parts under the metadata/catalog/slots directory. The CSV must have the EXACT following headers: name, description, fallbackMediaUri.',
)
  .addPositionalParam(
    'path',
    'Path to csv with slot part metadata, See metadata/slot-parts.csv for reference. Do not remove the headers.',
    './metadata/slot-parts.csv',
    string,
    true,
  )
  .addParam('baseUri', 'A URI to prepend to mediaUri for every token.', undefined, string, true)
  .setAction(async (params) => {
    await generateMultipleSlotPartsMetadata(params.path, params.baseUri || '');
  });

task(
  'metadata:fixed-parts-csv',
  'Creates the metadata for fixed parts under the metadata/catalog/fixed directory. The CSV must have the EXACT following headers: name, description, mediaUri.',
)
  .addPositionalParam(
    'path',
    'Path to csv with fixed part metadata, See metadata/fixed-parts.csv for reference. Do not remove the headers.',
    './metadata/fixed-parts.csv',
    string,
    true,
  )
  .addParam(
    'baseUri',
    'A URI to prepend to fallbackMediaUri for every token.',
    undefined,
    string,
    true,
  )
  .setAction(async (params) => {
    await generateMultipleFixedPartsMetadata(params.path, params.baseUri || '');
  });

export async function generateMultipleCollectionsMetadata(
  path: string,
  externalUri: string,
  license: string,
  licenseUri: string,
  baseUri: string,
): Promise<void> {
  console.log('Reading collection metadata from', path);
  const parser = parse(fs.readFileSync(path, 'utf8'), { columns: true });
  let total = 0;
  for await (const record of parser) {
    generateCollectionMetadata(
      record.collectionSlug,
      record.name,
      record.description,
      record.mediaUri === '' ? '' : baseUri + record.mediaUri,
      externalUri,
      record.thumbnailUri === '' ? '' : baseUri + record.thumbnailUri,
      license,
      licenseUri,
      record.tags,
    );
    total++;
  }
  console.log(`Processed ${total} collections.`);
}

export async function generateMultipleTokenMetadata(
  path: string,
  collectionSlug: string,
  externalUri: string,
  license: string,
  licenseUri: string,
  baseUri: string,
): Promise<void> {
  console.log('Reading token metadata from', path);
  const parser = parse(fs.readFileSync(path, 'utf8'), { columns: true });
  let total = 0;
  for await (const record of parser) {
    generateTokenMetadata(
      collectionSlug,
      record.filename,
      record.name,
      record.description,
      record.mediaUri === '' ? '' : baseUri + record.mediaUri,
      externalUri,
      record.thumbnailUri === '' ? '' : baseUri + record.thumbnailUri,
      record.animationUri === '' ? '' : baseUri + record.animationUri,
      license,
      licenseUri,
      record.attributes,
    );
    total++;
  }
  console.log(`Processed ${total} tokens.`);
}

export async function generateMultipleAssetMetadata(
  path: string,
  collectionSlug: string,
  externalUri: string,
  license: string,
  licenseUri: string,
  baseUri: string,
): Promise<void> {
  console.log('Reading asset metadata from', path);
  const parser = parse(fs.readFileSync(path, 'utf8'), { columns: true });
  let total = 0;
  for await (const record of parser) {
    generateAssetMetadata(
      collectionSlug,
      record.filename,
      record.name,
      record.description,
      record.mediaUri === '' ? '' : baseUri + record.mediaUri,
      externalUri,
      record.thumbnailUri === '' ? '' : baseUri + record.thumbnailUri,
      record.animationUri === '' ? '' : baseUri + record.animationUri,
      license,
      licenseUri,
      record.attributes,
    );
    total++;
  }
  console.log(`Processed ${total} assets.`);
}

export async function generateMultipleSlotPartsMetadata(
  path: string,
  baseUri: string,
): Promise<void> {
  console.log('Reading slot metadata from', path);
  const parser = parse(fs.readFileSync(path, 'utf8'), { columns: true });
  let total = 0;
  for await (const record of parser) {
    generateslotPartMetadata(
      record.name,
      record.description,
      record.fallbackMediaUri === '' ? '' : baseUri + record.fallbackMediaUri,
    );
    total++;
  }
  console.log(`Processed ${total} slots.`);
}

export async function generateMultipleFixedPartsMetadata(
  path: string,
  baseUri: string,
): Promise<void> {
  console.log('Reading fixed part metadata from', path);
  const parser = parse(fs.readFileSync(path, 'utf8'), { columns: true });
  let total = 0;
  for await (const record of parser) {
    generateFixedPartMetadata(
      record.name,
      record.description,
      record.mediaUri === '' ? '' : baseUri + record.mediaUri,
    );
    total++;
  }
}

function generateCollectionMetadata(
  collectionSlug: string,
  name: string,
  description: string,
  mediaUri: string,
  externalUri: string,
  thumbnailUri: string,
  license: string,
  licenseUri: string,
  tags: string,
): void {
  const dir = METADATA_DIR_FOR_COLLECTIONS.replace(':collection-slug', collectionSlug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const metadata: CollectionMetadata = {
    name,
    description,
    image: mediaUri,
  };
  if (externalUri) metadata.externalUri = externalUri;
  if (thumbnailUri) metadata.thumbnailUri = thumbnailUri;
  if (license) metadata.license = license;
  if (licenseUri) metadata.licenseUri = licenseUri;
  if (tags) metadata.tags = tags.split(',').map((tag) => tag.trim());

  fs.writeFileSync(`${dir}/collection.json`, JSON.stringify(metadata, null, 2));
}

function generateCatalogMetadata(name: string, description: string): void {
  if (!fs.existsSync(METADATA_DIR_FOR_CATALOG)) {
    fs.mkdirSync(METADATA_DIR_FOR_CATALOG, { recursive: true });
  }
  const metadata = {
    name,
    description,
  };

  fs.writeFileSync(`${METADATA_DIR_FOR_CATALOG}/catalog.json`, JSON.stringify(metadata, null, 2));
}

function generateTokenMetadata(
  collectionSlug: string,
  filename: string,
  name: string,
  description: string,
  mediaUri: string,
  externalUri: string,
  thumbnailUri: string,
  animationUri: string,
  license: string,
  licenseUri: string,
  attributes: string,
): void {
  const dir = METADATA_DIR_FOR_TOKEN_URIS.replace(':collection-slug', collectionSlug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const metadata: TokenOrAssetMetadata = {
    name,
    description,
    mediaUri,
    image: mediaUri,
  };
  if (externalUri) {
    metadata.externalUri = externalUri;
    metadata.external_url = externalUri;
  }
  if (thumbnailUri) metadata.thumbnailUri = thumbnailUri;
  if (animationUri) metadata.animation_url = animationUri;
  if (license) metadata.license = license;
  if (licenseUri) metadata.licenseUri = licenseUri;
  if (attributes) {
    metadata.attributes = attributes.split(',').map((attribute) => {
      let [label, type, value] = attribute.split(':');
      label = label.trim();
      type = type.trim();
      value = value.trim();
      if (!VALID_TYPES.includes(type)) {
        throw new Error(
          `Invalid type "${type}" for attribute "${label}. Options are: ${VALID_TYPES.join(', ')}"`,
        );
      }
      return { label, trait_type: label, type, value };
    });
  }

  fs.writeFileSync(`${dir}/${filename}.json`, JSON.stringify(metadata, null, 2));
}

function generateAssetMetadata(
  collectionSlug: string,
  filename: string,
  name: string,
  description: string,
  mediaUri: string,
  externalUri: string,
  thumbnailUri: string,
  animationUri: string,
  license: string,
  licenseUri: string,
  attributes: string,
): void {
  const dir = METADATA_DIR_FOR_ASSETS.replace(':collection-slug', collectionSlug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const metadata: TokenOrAssetMetadata = {
    name,
    description,
    mediaUri,
    image: mediaUri,
  };
  if (externalUri) {
    metadata.externalUri = externalUri;
    metadata.external_url = externalUri;
  }
  if (thumbnailUri) metadata.thumbnailUri = thumbnailUri;
  if (animationUri) metadata.animation_url = animationUri;
  if (license) metadata.license = license;
  if (licenseUri) metadata.licenseUri = licenseUri;
  if (attributes) {
    metadata.attributes = attributes.split(',').map((attribute) => {
      const [label, type, value] = attribute.split(':');
      return { label, trait_type: label, type, value };
    });
  }

  fs.writeFileSync(`${dir}/${filename}.json`, JSON.stringify(metadata, null, 2));
}

function generateslotPartMetadata(
  name: string,
  description: string,
  fallbackMediaUri: string,
): void {
  if (!fs.existsSync(METADATA_DIR_FOR_SLOT_PARTS)) {
    fs.mkdirSync(METADATA_DIR_FOR_SLOT_PARTS, { recursive: true });
  }

  const slugName = name.toLowerCase().replace(/\s/g, '-') + '.json';
  const metadata: PartMetadata = {
    name,
  };
  if (description) metadata.description = description;
  if (fallbackMediaUri) metadata.mediaUri = fallbackMediaUri;

  fs.writeFileSync(`${METADATA_DIR_FOR_SLOT_PARTS}/${slugName}`, JSON.stringify(metadata, null, 2));
}

function generateFixedPartMetadata(name: string, description: string, mediaUri: string): void {
  if (!fs.existsSync(METADATA_DIR_FOR_FIXED_PARTS)) {
    fs.mkdirSync(METADATA_DIR_FOR_FIXED_PARTS, { recursive: true });
  }

  const slugName = name.toLowerCase().replace(/\s/g, '-') + '.json';
  const metadata: PartMetadata = {
    name,
    mediaUri,
  };
  if (description) metadata.description = description;

  fs.writeFileSync(
    `${METADATA_DIR_FOR_FIXED_PARTS}/${slugName}`,
    JSON.stringify(metadata, null, 2),
  );
}
