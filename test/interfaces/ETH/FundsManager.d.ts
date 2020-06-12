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
    claimWithdrawal(
      _rawTransactionProof: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    fundsManagerESN(): Promise<{
      0: string;
    }>;

    plasmaManager(): Promise<{
      0: string;
    }>;

    setInitialValues(
      _token: string,
      _plasmaManager: string,
      _fundsManagerESN: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    token(): Promise<{
      0: string;
    }>;

    transactionClaimed(
      arg0: BytesLike
    ): Promise<{
      0: boolean;
    }>;
  };

  claimWithdrawal(
    _rawTransactionProof: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  fundsManagerESN(): Promise<string>;

  plasmaManager(): Promise<string>;

  setInitialValues(
    _token: string,
    _plasmaManager: string,
    _fundsManagerESN: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  token(): Promise<string>;

  transactionClaimed(arg0: BytesLike): Promise<boolean>;

  filters: {};

  estimateGas: {
    claimWithdrawal(_rawTransactionProof: BytesLike): Promise<BigNumber>;

    fundsManagerESN(): Promise<BigNumber>;

    plasmaManager(): Promise<BigNumber>;

    setInitialValues(
      _token: string,
      _plasmaManager: string,
      _fundsManagerESN: string
    ): Promise<BigNumber>;

    token(): Promise<BigNumber>;

    transactionClaimed(arg0: BytesLike): Promise<BigNumber>;
  };

  populateTransaction: {
    claimWithdrawal(_rawTransactionProof: BytesLike): Promise<PopulatedTransaction>;

    fundsManagerESN(): Promise<PopulatedTransaction>;

    plasmaManager(): Promise<PopulatedTransaction>;

    setInitialValues(
      _token: string,
      _plasmaManager: string,
      _fundsManagerESN: string
    ): Promise<PopulatedTransaction>;

    token(): Promise<PopulatedTransaction>;

    transactionClaimed(arg0: BytesLike): Promise<PopulatedTransaction>;
  };
}
