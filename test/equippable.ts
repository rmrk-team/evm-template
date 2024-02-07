import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SimpleEquippable } from '../typechain-types';

async function fixture(): Promise<SimpleEquippable> {
  const equipFactory = await ethers.getContractFactory('SimpleEquippable');
  const equip: SimpleEquippable = await equipFactory.deploy(
    'ipfs://collectionMeta',
    1000n, // max supply
    ethers.ZeroAddress, // royaltyRecipient
    300, // royaltyPercentageBps
  );
  await equip.waitForDeployment();

  return equip;
}

describe('SimpleEquippable Assets', async () => {
  let equip: SimpleEquippable;
  beforeEach(async function () {
    equip = await loadFixture(fixture);
  });

  describe('Init', async function () {
    it('can get names and symbols', async function () {
      expect(await equip.name()).to.equal('SimpleEquippable');
      expect(await equip.symbol()).to.equal('SE');
    });
  });
});
