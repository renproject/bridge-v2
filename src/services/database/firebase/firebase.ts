import { GatewaySession } from "@renproject/ren-tx";
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

const FIREBASE_AUTH_DOMAIN = `renproject.io`;

type DbTimestamps = {
  seconds: number;
  nanoseconds: number;
};

export type DbMeta = {
  state: string;
};

export type DbGatewaySession = GatewaySession & {
  updated: DbTimestamps;
  created: DbTimestamps;
  meta: DbMeta;
};

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
    const timestamps = firebase.firestore.Timestamp.fromDate(
      new Date(Date.now())
    ) as DbTimestamps;

    const dbTx = {
      ...tx,
      created: timestamps,
      updated: timestamps,
    };

    await this.db
      .collection("transactions")
      .doc(tx.id)
      .set({
        user: localWeb3Address.toLowerCase(),
        walletSignature: fsSignature,
        id: tx.id,
        updated: timestamps,
        data: JSON.stringify(dbTx),
      })
      .catch(console.error);
  };

  public updateTx = async (tx: Transaction) => {
    const timestamps = firebase.firestore.Timestamp.fromDate(
      new Date(Date.now())
    );
    const dbTx = { ...tx, updated: timestamps };
    await this.db
      .collection("transactions")
      .doc(tx.id)
      .update({
        data: JSON.stringify(dbTx),
        updated: timestamps,
      });
  };

  public deleteTx = async (tx: Transaction) => {
    await this.db
      .collection("transactions")
      .doc(tx.id)
      .update({ deleted: true });
  };

  public getTx = async (tx: Transaction) => {
    return this.db
      .collection("transactions")
      .doc(tx.id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data && !data.deleted) {
            return JSON.parse(data.data);
          }
        }
        throw new Error(`Tx: ${tx.id} not found`);
      });
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
    const user = await getFirebaseUser(
      address,
      FIREBASE_AUTH_DOMAIN,
      signatures
    );
    return (
      user && {
        uid: user.uid,
      }
    );
  };
}
