export interface Database<Transaction extends { id: string }> {
  addTx: (
    tx: Transaction,
    localWeb3Address: string,
    fsSignature: string | null
  ) => Promise<void>;

  updateTx: (tx: Transaction) => Promise<void>;

  deleteTx: (tx: Transaction) => Promise<void>;

  getTxs: (signature: string) => Promise<Transaction[]>;

  getUser: (
    address: string,
    signatures: { rawSignature: string; signature: string }
  ) => Promise<{ uid: string } | null>;
}

import { FireBase } from "./firebase/firebase";

export const newDefaultDatabase = <Transaction extends { id: string }>() =>
  new FireBase<Transaction>();
