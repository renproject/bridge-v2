import { DigiByte } from "@renproject/chains-bitcoin";
import {
  BitcoinAPI,
  UTXO,
} from "@renproject/chains-bitcoin/build/main/APIs/API";
import { Insight } from "@renproject/chains-bitcoin/build/main/APIs/insight";

const nowNodesApiKey = "5GKhcZUJDaus0qb1Wn4I9S7wEYXgmRxz";
const nowNodesMainnet = "https://dgb.nownodes.io/api/v2";
const nowNodesParams = {
  headers: {
    "api-key": nowNodesApiKey,
    "Content-Type": "application/json",
  },
  method: "GET",
};

type NowNodeUXTO = {
  txid: string;
  vout: number;
  value: string;
  height: number;
  confirmations: number;
  scriptPubKey: string;
};

type NowNodeVin = {
  txid: string;
  sequence: number;
  n: number;
  addresses: string[];
  isAddress: boolean;
  value: string;
  hex: string;
};

type NowNodeVout = {
  value: string;
  n: number;
  spent: boolean;
  hex: string;
  addresses: string[];
  isAddress: boolean;
};

type NowNodeTX = {
  txid: string;
  version: number;
  lockTime: number;
  vin: NowNodeVin[];
  vout: NowNodeVout[];
  blockHash: string;
  blockHeight: number;
  confirmations: number;
  blockTime: number;
  value: string;
  valueIn: string;
  fees: string;
  hex: string;
};

type NowNodeAddressResponse = {
  transactions: NowNodeTX[];
};

class NowNodesDigibyteApi implements BitcoinAPI {
  public url: string;

  constructor(url?: string) {
    this.url = url || nowNodesMainnet;
  }

  async fetchUTXO(txHash: string, vOut: number) {
    const tx: NowNodeTX = await fetch(
      `${nowNodesMainnet}/tx/${txHash}`,
      nowNodesParams
    ).then((response) => response.json());
    const uxto: UTXO = {
      amount: tx.vout[vOut].value,
      confirmations: tx.confirmations,
      txHash,
      vOut,
    };
    return uxto;
  }

  async fetchTXs(address: string) {
    console.log("fetchTXs", address, nowNodesMainnet);
    const data: NowNodeAddressResponse = await fetch(
      `${nowNodesMainnet}/address/${address}?details=txs`,
      nowNodesParams
    ).then((response) => response.json());
    console.log("fetchTXs result", data);

    const uxtos: UTXO[] = [];

    for (const tx of data.transactions) {
      for (let i = 0; i < tx.vout.length; i++) {
        const vout = tx.vout[i];
        if (vout.addresses.indexOf(address) >= 0) {
          uxtos.push({
            txHash: tx.txid,
            amount: vout.value,
            vOut: vout.n,
            confirmations: tx.confirmations || 0,
          });
        }
      }
    }

    console.log("fetchTXs final", uxtos);
    return uxtos;
  }

  async fetchUTXOs(address: string, confirmations?: number) {
    console.log("fetchUTXOs", address);
    const txs: NowNodeUXTO[] = await fetch(
      `${nowNodesMainnet}/utxo/${address}`,
      nowNodesParams
    ).then((response) => response.json());
    console.log("fetchUTXOs result", txs);

    const uxtos: UTXO[] = (txs || []).map((tx) => {
      const uxto: UTXO = {
        amount: tx.value,
        confirmations: tx.confirmations,
        txHash: tx.txid,
        vOut: tx.vout,
      };
      return uxto;
    });
    console.log("fetchUTXOs final", uxtos);
    return uxtos;
  }

  async broadcastTransaction(hex: string) {
    console.log("broadcastTransaction", hex);
    await fetch(
      `${nowNodesMainnet}/sendtx/${hex}`,
      nowNodesParams
    ).then((response) => response.json());
    return hex;
  }
}

const nowNodeApiMainnet = new NowNodesDigibyteApi();

export const DigiByteInstance = DigiByte();
DigiByteInstance.withDefaultAPIs = (network) => {
  switch (network) {
    case "mainnet":
      return DigiByteInstance.withAPI(
        Insight("https://multichain-web-proxy.herokuapp.com/digibyte-mainnet")
      )
        .withAPI(Insight("https://digiexplorer.info/api"))
        .withAPI(nowNodeApiMainnet)
        .withAPI(Insight("https://insight.digibyte.host/api"));
    case "testnet":
      return DigiByteInstance.withAPI(
        Insight("https://testnetexplorer.digibyteservers.io/api")
      );
    case "regtest":
      throw new Error(`Regtest is currently not supported.`);
  }
};
