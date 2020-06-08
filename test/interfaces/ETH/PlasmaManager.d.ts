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

export class PlasmaManager extends Contract {
  functions: {
    bunches(
      arg0: BigNumberish
    ): Promise<{
      startBlockNumber: BigNumber;
      bunchDepth: BigNumber;
      transactionsMegaRoot: string;
      receiptsMegaRoot: string;
      0: BigNumber;
      1: BigNumber;
      2: string;
      3: string;
    }>;

    claimWithdrawal(
      _rawTransactionProof: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    esnDepositAddress(): Promise<{
      0: string;
    }>;

    getAllSigners(): Promise<{
      0: string[];
    }>;

    getAllValidators(): Promise<{
      0: string[];
    }>;

    getNextStartBlockNumber(): Promise<{
      0: BigNumber;
    }>;

    isValidator(
      arg0: string
    ): Promise<{
      0: boolean;
    }>;

    lastBunchIndex(): Promise<{
      0: BigNumber;
    }>;

    numberOfValidators(): Promise<{
      0: BigNumber;
    }>;

    processedWithdrawals(
      arg0: BytesLike
    ): Promise<{
      0: boolean;
    }>;

    setESNDepositAddress(
      _esnDepositAddress: string,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    signers(
      arg0: BigNumberish
    ): Promise<{
      0: string;
    }>;

    submitBunchHeader(
      _signedHeader: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    token(): Promise<{
      0: string;
    }>;

    validators(
      arg0: BigNumberish
    ): Promise<{
      0: string;
    }>;
  };

  bunches(
    arg0: BigNumberish
  ): Promise<{
    startBlockNumber: BigNumber;
    bunchDepth: BigNumber;
    transactionsMegaRoot: string;
    receiptsMegaRoot: string;
    0: BigNumber;
    1: BigNumber;
    2: string;
    3: string;
  }>;

  claimWithdrawal(
    _rawTransactionProof: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  esnDepositAddress(): Promise<string>;

  getAllSigners(): Promise<string[]>;

  getAllValidators(): Promise<string[]>;

  getNextStartBlockNumber(): Promise<BigNumber>;

  isValidator(arg0: string): Promise<boolean>;

  lastBunchIndex(): Promise<BigNumber>;

  numberOfValidators(): Promise<BigNumber>;

  processedWithdrawals(arg0: BytesLike): Promise<boolean>;

  setESNDepositAddress(
    _esnDepositAddress: string,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  signers(arg0: BigNumberish): Promise<string>;

  submitBunchHeader(_signedHeader: BytesLike, overrides?: Overrides): Promise<ContractTransaction>;

  token(): Promise<string>;

  validators(arg0: BigNumberish): Promise<string>;

  filters: {
    NewBunchHeader(_startBlockNumber: null, _bunchDepth: null, _bunchIndex: null): EventFilter;
  };

  estimateGas: {
    bunches(arg0: BigNumberish): Promise<BigNumber>;

    claimWithdrawal(_rawTransactionProof: BytesLike): Promise<BigNumber>;

    esnDepositAddress(): Promise<BigNumber>;

    getAllSigners(): Promise<BigNumber>;

    getAllValidators(): Promise<BigNumber>;

    getNextStartBlockNumber(): Promise<BigNumber>;

    isValidator(arg0: string): Promise<BigNumber>;

    lastBunchIndex(): Promise<BigNumber>;

    numberOfValidators(): Promise<BigNumber>;

    processedWithdrawals(arg0: BytesLike): Promise<BigNumber>;

    setESNDepositAddress(_esnDepositAddress: string): Promise<BigNumber>;

    signers(arg0: BigNumberish): Promise<BigNumber>;

    submitBunchHeader(_signedHeader: BytesLike): Promise<BigNumber>;

    token(): Promise<BigNumber>;

    validators(arg0: BigNumberish): Promise<BigNumber>;
  };

  populateTransaction: {
    bunches(arg0: BigNumberish): Promise<PopulatedTransaction>;

    claimWithdrawal(_rawTransactionProof: BytesLike): Promise<PopulatedTransaction>;

    esnDepositAddress(): Promise<PopulatedTransaction>;

    getAllSigners(): Promise<PopulatedTransaction>;

    getAllValidators(): Promise<PopulatedTransaction>;

    getNextStartBlockNumber(): Promise<PopulatedTransaction>;

    isValidator(arg0: string): Promise<PopulatedTransaction>;

    lastBunchIndex(): Promise<PopulatedTransaction>;

    numberOfValidators(): Promise<PopulatedTransaction>;

    processedWithdrawals(arg0: BytesLike): Promise<PopulatedTransaction>;

    setESNDepositAddress(_esnDepositAddress: string): Promise<PopulatedTransaction>;

    signers(arg0: BigNumberish): Promise<PopulatedTransaction>;

    submitBunchHeader(_signedHeader: BytesLike): Promise<PopulatedTransaction>;

    token(): Promise<PopulatedTransaction>;

    validators(arg0: BigNumberish): Promise<PopulatedTransaction>;
  };
}
