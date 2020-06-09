/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import {
  ethers,
  Contract,
  ContractTransaction,
  PopulatedTransaction,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  BytesLike,
  ContractInterface,
  Overrides,
} from 'ethers';

export class FundsManager extends Contract {
  functions: {
    claimDeposit(_rawProof: BytesLike, overrides?: Overrides): Promise<ContractTransaction>;

    fundsManagerETH(): Promise<{
      0: string;
    }>;

    reversePlasma(): Promise<{
      0: string;
    }>;

    setFundsManagerETHAddress(
      _fundsManagerETH: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    tokenOnETH(): Promise<{
      0: string;
    }>;
  };

  claimDeposit(_rawProof: BytesLike, overrides?: Overrides): Promise<ContractTransaction>;

  fundsManagerETH(): Promise<string>;

  reversePlasma(): Promise<string>;

  setFundsManagerETHAddress(
    _fundsManagerETH: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  tokenOnETH(): Promise<string>;

  filters: {};

  estimateGas: {
    claimDeposit(_rawProof: BytesLike): Promise<BigNumber>;

    fundsManagerETH(): Promise<BigNumber>;

    reversePlasma(): Promise<BigNumber>;

    setFundsManagerETHAddress(_fundsManagerETH: string): Promise<BigNumber>;

    tokenOnETH(): Promise<BigNumber>;
  };

  populateTransaction: {
    claimDeposit(_rawProof: BytesLike): Promise<PopulatedTransaction>;

    fundsManagerETH(): Promise<PopulatedTransaction>;

    reversePlasma(): Promise<PopulatedTransaction>;

    setFundsManagerETHAddress(_fundsManagerETH: string): Promise<PopulatedTransaction>;

    tokenOnETH(): Promise<PopulatedTransaction>;
  };
}
