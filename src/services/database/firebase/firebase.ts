import firebase from "firebase/app";
import { env } from "../../../constants/environmentVariables";

import { Database } from "../database";
import { getFirebaseUser } from "./firebaseUtils";

if (!env.FIREBASE_KEY) {
  console.warn(`No database key set.`);
}

firebase.initializeApp({
  apiKey: env.FIREBASE_KEY,
  authDomain: window.location.hostname,
  projectId: env.FIREBASE_PROJECT_ID,
});

require("firebase/firestore");

export class FireBase<Transaction extends { id: string }>
  implements Database<Transaction> {
  private db: firebase.firestore.Firestore;

  constructor() {
    this.db = firebase.firestore();
  }

  public addTx = async (
    tx: Transaction,
    localWeb3Address: string,
    fsSignature: string | null
  ) => {
    // add timestamps
    const timestamp = firebase.firestore.Timestamp.fromDate(
      new Date(Date.now())
    );

    await this.db
      .collection("transactions")
      .doc(tx.id)
      .set({
        user: localWeb3Address.toLowerCase(),
        walletSignature: fsSignature,
        id: tx.id,
        updated: timestamp,
        data: JSON.stringify({ ...tx, created: timestamp, updated: timestamp }),
      })
      .catch(console.error);
  };

  public updateTx = async (tx: Transaction) => {
    const timestamp = firebase.firestore.Timestamp.fromDate(
      new Date(Date.now())
    );
    await this.db
      .collection("transactions")
      .doc(tx.id)
      .update({
        data: JSON.stringify({ ...tx, updated: timestamp }),
        updated: timestamp,
      });
  };

  public deleteTx = async (tx: Transaction) => {
    await this.db
      .collection("transactions")
      .doc(tx.id)
      .update({ deleted: true });
  };

  public getTxs = async (signature: string): Promise<Transaction[]> => {
    const fsDataSnapshot = await this.db
      .collection("transactions")
      .where("walletSignature", "==", signature)
      .get();

    const fsTransactions: Transaction[] = [];
    if (!fsDataSnapshot.empty) {
      fsDataSnapshot.forEach((doc: any) => {
        const data = doc.data();
        if (data.deleted) return;
        const tx: Transaction = JSON.parse(data.data);
        fsTransactions.push(tx);
      });
    }

    return fsTransactions;
  };

  public getUser = async (
    address: string,
    signatures: { signature: string; rawSignature: string }
  ) => {
    const user = await getFirebaseUser(address, "wbtc.cafe", signatures);
    return (
      user && {
        uid: user.uid,
      }
    );
  };
}
