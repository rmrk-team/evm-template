import { boolean, string, int } from 'hardhat/internal/core/params/argumentTypes';
import { getEmotesRepository } from './utils';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { task } from 'hardhat/config';

task('emote', 'Adds or removes an emote to a token')
  .addPositionalParam('collection', 'Address of the collection')
  .addPositionalParam('tokenId', 'Token Id', undefined, int)
  .addPositionalParam('emote', 'Emoji to send', '😄', string)
  .addPositionalParam('enable', 'Whether to add or remove the emote', true, boolean)
  .setAction(async (params, hre: HardhatRuntimeEnvironment) => {
    await emote(hre, params.collection, params.tokenId, params.emote, params.enable);
  });

async function emote(
  hre: HardhatRuntimeEnvironment,
  collection: string,
  tokenId: number,
  emoji: string,
  enable: boolean,
): Promise<void> {
  console.log(`Emoting ${emoji} to ${collection}/${tokenId} ${hre.network.name} blockchain...`);

  const emotesRepo = await getEmotesRepository(hre);
  let tx = await emotesRepo.emote(collection, tokenId, emoji, enable);
  await tx.wait();
  console.log(`Emote ${emoji} ${enable ? 'enabled' : 'disabled'} for ${collection}/${tokenId}.`);
}
