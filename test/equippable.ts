import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SimpleEquippable } from '../typechain-types';
import { InitDataNativePay } from '../typechain-types/contracts/SimpleEquippable';

async function fixture(): Promise<SimpleEquippable> {
  const equipFactory = await ethers.getContractFactory('SimpleEquippable');

  const initData: InitDataNativePay.InitDataStruct = {
    royaltyRecipient: ethers.ZeroAddress,
    royaltyPercentageBps: 1000,
    maxSupply: 1000n,
    pricePerMint: ethers.parseEther('1.0'),
  };

  const equip: SimpleEquippable = await equipFactory.deploy(
    'ipfs://collectionMeta',
    'ipfs://tokenMeta',
    initData,
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
