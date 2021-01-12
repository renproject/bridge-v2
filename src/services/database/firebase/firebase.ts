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
        createdSeconds: timestamps.seconds,
        data: JSON.stringify(dbTx),
      })
      .catch((e) => console.error("failed to track tx", e));
  };

  public updateTx = async (tx: Transaction) => {
    const timestamps = firebase.firestore.Timestamp.fromDate(
      new Date(Date.now())
    );
    const dbTx = { ...tx, updated: timestamps };
    try {
      await this.db
        .collection("transactions")
        .doc(tx.id)
        .update({
          data: JSON.stringify(dbTx),
          updated: timestamps,
        });
    } catch (e) {
      console.error("failed to update", e);
      throw e;
    }
  };

  public deleteTx = async (tx: Transaction) => {
    try {
      await this.db
        .collection("transactions")
        .doc(tx.id)
        .update({ deleted: true });
    } catch (e) {
      console.error("failed to delete", e);
      throw e;
    }
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
      })
      .catch((e) => {
        console.error("Failed to get tx", e);
        throw e;
      });
  };

  public getTxs = async (uid: string): Promise<Transaction[]> => {
    try {
      const fsDataSnapshot = await this.db
        .collection("transactions")
        .where("user", "==", uid.toLowerCase())
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
    } catch (e) {
      console.error("failed to fetch txs", e);
      throw e;
    }
  };

  public getUser = async (
    address: string,
    signatures: { signature: string; rawSignature: string }
  ) => {
    const user = await getFirebaseUser(address, signatures);
    return (
      user && {
        uid: user.uid,
      }
    );
  };
}
