import { boolean, string, int } from 'hardhat/internal/core/params/argumentTypes';
import { getEmotesRepository } from './utils';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { task } from 'hardhat/config';

task('emotes:emote', 'Adds or removes an emote to a token')
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenId', 'Token Id', undefined, int)
  .addPositionalParam('emote', 'Emoji to send', '😄', string)
  .addPositionalParam('enable', 'Whether to add or remove the emote', true, boolean)
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await emote(hre, params.collection, params.tokenId, params.emote, params.enable);
  });

task(
  'emotes:bulkEmote',
  'Adds or removes multiple emotes to multiple tokens. The first token Id receives the first emote, the second token Id receives the second emote, and so on.',
)
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenIds', 'Comma separated Token Ids', undefined, string)
  .addPositionalParam('emotes', 'Comma separated Emojis to send', undefined, string)
  .addPositionalParam('enable', 'Whether to add or remove the emotes', true, boolean)
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await bulkEmote(hre, params.collection, params.tokenIds, params.emotes, params.enable);
  });

async function emote(
  hre: HardhatRuntimeEnvironment,
  collection: string,
  tokenId: number,
  emoji: string,
  enable: boolean,
): Promise<void> {
  console.log(`Emoting ${emoji} to ${collection}/${tokenId} on ${hre.network.name} blockchain...`);

  const emotesRepo = await getEmotesRepository(hre);
  let tx = await emotesRepo.emote(collection, tokenId, emoji, enable);
  await tx.wait();
  console.log(`Emote ${emoji} ${enable ? 'enabled' : 'disabled'} for ${collection}/${tokenId}.`);
}

async function bulkEmote(
  hre: HardhatRuntimeEnvironment,
  collection: string,
  tokenIds: string,
  emojis: string,
  enable: boolean,
): Promise<void> {
  console.log(
    `Emoting ${emojis} to ${collection}/${tokenIds} on ${hre.network.name} blockchain...`,
  );

  const tokenIdsArray = tokenIds.split(',').map((id) => parseInt(id.trim()));
  const emojisArray = emojis.split(',').map((emoji) => emoji.trim());

  if (tokenIdsArray.length !== emojisArray.length) {
    throw new Error('Number of tokenIds and emotes must be equal.');
  }

  const collectionArray = Array(tokenIdsArray.length).fill(collection);
  const enableArray = Array(tokenIdsArray.length).fill(enable);

  const emotesRepo = await getEmotesRepository(hre);
  let tx = await emotesRepo.bulkEmote(collectionArray, tokenIdsArray, emojisArray, enableArray);
  await tx.wait();

  console.log(`Emotes ${enable ? 'enabled' : 'disabled'} for ${collection}.`);
}
