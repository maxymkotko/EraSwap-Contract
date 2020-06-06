import { ethers } from 'ethers';

import { fetchBlocks } from './../../../kami/src/utils/provider';
import { computeMerkleRoot } from './../../../kami/src/utils/merkle';
import { BunchProposal } from './../../../kami/src/utils/bunch-proposal';

import { signBunchData } from './../../../kami/src/utils/sign';
import { Bytes } from './../../../kami/src/utils/bytes';

async function generateBunchProposal(
  startBlockNumber: number,
  bunchDepth: number
): Promise<BunchProposal> {
  const blocks = await fetchBlocks(
    startBlockNumber,
    bunchDepth,
    global.providerESN
  );

  const bunchProposal: BunchProposal = {
    startBlockNumber,
    bunchDepth,
    transactionsMegaRoot: computeMerkleRoot(
      blocks.map((block) => block.transactionsRoot)
    ),
    receiptsMegaRoot: computeMerkleRoot(
      blocks.map((block) => block.receiptsRoot)
    ),
    signatures: [],
  };

  return bunchProposal;
}

export async function generateSignedBunchProposal(
  startBlockNumber: number,
  bunchDepth: number,
  wallets: ethers.Wallet[]
): Promise<string> {
  const bunchProposal = await generateBunchProposal(
    startBlockNumber,
    bunchDepth
  );

  const arrayfiedBunchProposal = [
    new Bytes(bunchProposal.startBlockNumber).hex(),
    new Bytes(bunchProposal.bunchDepth).hex(),
    bunchProposal.transactionsMegaRoot.hex(),
    bunchProposal.receiptsMegaRoot.hex(),
  ];

  const encoded = ethers.utils.RLP.encode(arrayfiedBunchProposal);

  const rlpArray: any[] = [arrayfiedBunchProposal];

  for (const wallet of wallets) {
    const sig = signBunchData(new Bytes(encoded), wallet);
    rlpArray.push(sig.hex());
  }

  return ethers.utils.RLP.encode(rlpArray);
}