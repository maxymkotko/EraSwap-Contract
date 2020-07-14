import assert from 'assert';
import { ethers } from 'ethers';

export const SetInitialValuesNext = () =>
  describe('Setting initial values to next deployed contracts', () => {
    it('sets initial values in NRT Manager Contract ESN', async () => {
      const platforms = [
        global.timeallyInstanceESN.address,
        global.validatorManagerESN.address,
        ethers.utils.getAddress(ethers.utils.hexlify(ethers.utils.randomBytes(20))),
      ];
      const perThousands = [150, 120, 730];
      await global.nrtInstanceESN.setInitialValues(platforms, perThousands);

      const { 0: _platforms, 1: _perThousands } = await global.nrtInstanceESN.getPlatformDetails();

      assert.deepEqual(platforms, _platforms, 'platforms should be set correctly');
      assert.deepEqual(
        perThousands,
        _perThousands.map((pT) => pT.toNumber()),
        'per thousands should be set correctly'
      );
    });

    it('sets initial values in TimeAlly Manager Contract ESN', async () => {
      await global.timeallyInstanceESN.setInitialValues(
        global.nrtInstanceESN.address,
        global.validatorManagerESN.address
      );

      const nrtAddress = await global.timeallyInstanceESN.nrtManager();
      assert.equal(
        nrtAddress,
        global.nrtInstanceESN.address,
        'nrt address should be set correctly'
      );

      const validatorManagerAddress = await global.timeallyInstanceESN.validatorManager();
      assert.equal(
        validatorManagerAddress,
        global.validatorManagerESN.address,
        'validator manager address should be set correctly'
      );
    });

    it('sets initial values in Validator Set Contract ESN', async () => {
      await global.validatorSetESN.setInitialValues(global.validatorManagerESN.address, 1);

      const validatorManager = await global.validatorSetESN.validatorManager();
      assert.equal(
        validatorManager,
        global.validatorManagerESN.address,
        'validator manager address should be set correctly'
      );

      const BLOCKS_INTERVAL = await global.validatorSetESN.BLOCKS_INTERVAL();
      assert.strictEqual(BLOCKS_INTERVAL.toNumber(), 1, 'BLOCKS_INTERVAL should be 1 as set');
    });

    it('sets initial values in Validator Manager Contract ESN', async () => {
      await global.validatorManagerESN.setInitialValues(
        global.validatorSetESN.address,
        global.nrtInstanceESN.address,
        global.timeallyInstanceESN.address,
        global.randomnessMangerESN.address
      );

      const timeallyAddress = await global.validatorManagerESN.timeally();
      assert.equal(
        timeallyAddress,
        global.timeallyInstanceESN.address,
        'timeally manager address should be set correctly'
      );
    });

    it('adds staking plans in TimeAlly Manager Contract ESN', async () => {
      {
        await global.timeallyInstanceESN.addStakingPlan(12, 13, false);

        const { months, fractionFrom15, estMode } = await global.timeallyInstanceESN.getStakingPlan(
          0
        );
        assert.deepEqual(months, ethers.BigNumber.from(12), 'months should be set properly');
        assert.deepEqual(
          fractionFrom15,
          ethers.BigNumber.from(13),
          'estMode should be set properly'
        );
        assert.strictEqual(estMode, false, 'estMode should be set properly');
      }
      {
        await global.timeallyInstanceESN.addStakingPlan(24, 15, false);

        const { months, fractionFrom15, estMode } = await global.timeallyInstanceESN.getStakingPlan(
          1
        );
        assert.deepEqual(months, ethers.BigNumber.from(24), 'months should be set properly');
        assert.deepEqual(
          fractionFrom15,
          ethers.BigNumber.from(15),
          'estMode should be set properly'
        );
        assert.strictEqual(estMode, false, 'estMode should be set properly');
      }
      {
        await global.timeallyInstanceESN.addStakingPlan(24, 15, false);

        const { months, fractionFrom15, estMode } = await global.timeallyInstanceESN.getStakingPlan(
          2
        );
        assert.deepEqual(months, ethers.BigNumber.from(24), 'months should be set properly');
        assert.deepEqual(
          fractionFrom15,
          ethers.BigNumber.from(15),
          'estMode should be set properly'
        );
        assert.strictEqual(estMode, false, 'estMode should be set properly');
      }
    });
  });
