import { RenNetwork } from "@renproject/interfaces";
import { GatewaySession, mintMachine } from "@renproject/rentx";
import { useMachine } from "@xstate/react";
import { BridgeCurrency } from '../../components/utils/types'
import { env } from "../../constants/environmentVariables";
import { getRenJs } from "../../services/renJs";
import { fromChainMap, toChainMap } from "../../services/rentx";

export const getMintTx: GatewaySession = {
  id: "tx-" + Math.floor(Math.random() * 10 ** 16),
  type: "mint",
  sourceAsset: "btc",
  sourceNetwork: "bitcoin",
  network: "testnet",
  destAddress: "",
  destNetwork: "ethereum",
  destAsset: "renBTC",
  targetAmount: 1,
  destConfsTarget: 6,
  userAddress: "",
  expiryTime: new Date().getTime() + 1000 * 60 * 60 * 24,
  transactions: {},
};

type CreateMintTransactionParams = {
  amount: number,
  currency: BridgeCurrency,
  mintedCurrency: BridgeCurrency,
  address: string
};

export const createMintTransaction = ({
}: CreateMintTransactionParams) => {
  const tx: GatewaySession = {
    id: "tx-" + Math.floor(Math.random() * 10 ** 16),
    type: "mint",
    network: env.TARGET_NETWORK as RenNetwork,
    sourceAsset: "btc",
    sourceNetwork: "bitcoin",
    destAddress: "",
    destNetwork: "ethereum",
    destAsset: "renBTC",
    targetAmount: 1,
    destConfsTarget: 6,
    userAddress: "",
    expiryTime: new Date().getTime() + 1000 * 60 * 60 * 24,
    transactions: {},
  };

  return tx;
};
export const useMintMachine = (mintTransaction: GatewaySession) => {
  return useMachine(mintMachine, {
    context: {
      tx: mintTransaction,
      sdk: getRenJs(),
      fromChainMap,
      toChainMap,
    },
  });
};
