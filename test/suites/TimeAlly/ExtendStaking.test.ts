import assert from 'assert';
import { ethers } from 'ethers';
import { getTimeAllyStakings, parseReceipt } from '../../utils';
import { TimeAllyStaking } from '../../../build/typechain/ESN/TimeAllyStaking';

let stakingInstance: TimeAllyStaking;

export const ExtendStaking = () =>
  describe('Extend Staking', () => {
    it('extends the staking increases endMonth and total active stakings', async () => {
      const stakingInstances = await getTimeAllyStakings(global.accountsESN[0]);
      stakingInstance = stakingInstances[0];
      const principal = await stakingInstance.nextMonthPrincipalAmount();

      const startMonthBefore = (await stakingInstance.startMonth()).toNumber();
      const endMonthBefore = (await stakingInstance.endMonth()).toNumber();

      const currentMonth = (await global.nrtInstanceESN.currentNrtMonth()).toNumber();
      const expectedEndMonth = currentMonth + 12;

      // last value is zero
      const totalActiveStakingsBefore: ethers.BigNumber[] = [];
      for (let i = startMonthBefore; i <= expectedEndMonth + 1; i++) {
        totalActiveStakingsBefore.push(await global.timeallyInstanceESN.getTotalActiveStaking(i));
      }

      assert.deepEqual(
        totalActiveStakingsBefore[totalActiveStakingsBefore.length - 1],
        ethers.constants.Zero,
        'last month should be zero'
      );

      await parseReceipt(stakingInstance.extend());

      const startMonthAfter = (await stakingInstance.startMonth()).toNumber();
      const endMonthAfter = (await stakingInstance.endMonth()).toNumber();

      // last value is zero
      const totalActiveStakingsAfter: ethers.BigNumber[] = [];
      for (let i = startMonthBefore; i <= endMonthAfter + 1; i++) {
        totalActiveStakingsAfter.push(await global.timeallyInstanceESN.getTotalActiveStaking(i));
      }

      assert.strictEqual(
        endMonthAfter,
        expectedEndMonth,
        'end month should have extended by 12 months'
      );

      for (const [i, _] of totalActiveStakingsBefore.entries()) {
        const month = startMonthBefore + i;
        if (month > endMonthBefore && month <= expectedEndMonth) {
          assert.deepEqual(
            totalActiveStakingsAfter[i].sub(totalActiveStakingsBefore[i]),
            principal,
            `total active staking should be increased by principal for ${month}`
          );
          // console.log(
          //   1,
          //   month,
          //   ethers.utils.formatEther(totalActiveStakingsBefore[i]),
          //   ethers.utils.formatEther(totalActiveStakingsAfter[i])
          // );
        } else {
          // console.log(
          //   2,
          //   month,
          //   ethers.utils.formatEther(totalActiveStakingsBefore[i]),
          //   ethers.utils.formatEther(totalActiveStakingsAfter[i])
          // );

          assert.deepEqual(
            totalActiveStakingsAfter[i],
            totalActiveStakingsBefore[i],
            `total active staking should remain the same for ${i}`
          );
        }
      }
    });

    it('tries to extend in same month expecting revert', async () => {
      try {
        await parseReceipt(stakingInstance.extend());

        assert(false, 'should have thrown error');
      } catch (error) {
        const msg = error.error?.message || error.message;

        assert.ok(msg.includes('TAStaking: Already extended'), `Invalid error message: ${msg}`);
      }
    });
  });
