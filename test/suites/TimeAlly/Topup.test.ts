import assert from 'assert';
import { ethers } from 'ethers';
import { getTimeAllyStakings } from '../../utils';

export const TopupStaking = () =>
  describe('Topup Staking', () => {
    it('topups an existing staking by 200', async () => {
      const stakeInstances = await getTimeAllyStakings(global.accountsESN[0]);
      const stakeInstance = stakeInstances[0];

      const signer = global.providerESN.getSigner(global.accountsESN[0]);
      await signer.sendTransaction({
        to: stakeInstance.address,
        value: ethers.utils.parseEther('200'),
      });

      assert.deepEqual(
        await stakeInstance.unboundedBasicAmount(),
        ethers.utils.parseEther('300').mul(2).div(100),
        'unbounded basic amount should be set correctly'
      );

      const principalAmounts: ethers.BigNumber[] = [];
      const totalActiveStakings: ethers.BigNumber[] = [];
      const stakingStartMonth = await stakeInstance.stakingStartMonth();
      const stakingEndMonth = await stakeInstance.stakingEndMonth();

      for (let i = stakingStartMonth.toNumber(); i <= stakingEndMonth.toNumber(); i++) {
        principalAmounts.push(await stakeInstance.getPrincipalAmount(i));
        totalActiveStakings.push(await global.timeallyInstanceESN.getTotalActiveStaking(i));
      }

      principalAmounts.map((principalAmount) => {
        assert.deepEqual(
          principalAmount,
          ethers.utils.parseEther('300'),
          'principal amount should be updated correctly'
        );
      });

      totalActiveStakings.map((totalActive) => {
        assert.deepEqual(
          totalActive,
          ethers.utils.parseEther('300'),
          'total active stakings should be updated correctly'
        );
      });
    });
  });
