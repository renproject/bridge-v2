import { RenNetwork } from "@renproject/interfaces";
import { GatewaySession, mintMachine } from "@renproject/rentx";
import { useMachine } from "@xstate/react";
import { BridgeChain, BridgeCurrency } from "../../components/utils/types";
import { env } from "../../constants/environmentVariables";
import { getRenJs } from "../../services/renJs";
import { fromChainMap, toChainMap } from "../../services/rentx";
import {
  getChainRentxName,
  getCurrencyRentxName,
  getCurrencyRentxSourceChain,
} from "../../utils/assetConfigs";

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
  amount: number;
  currency: BridgeCurrency;
  mintedCurrency: BridgeCurrency;
  mintedCurrencyChain: BridgeChain;
  userAddress: string;
  destAddress: string;
};

export const createMintTransaction = ({
  amount,
  currency,
  mintedCurrency,
  mintedCurrencyChain,
  userAddress,
  destAddress,
}: CreateMintTransactionParams) => {
  const tx: GatewaySession = {
    id: "tx-" + Math.floor(Math.random() * 10 ** 16),
    type: "mint",
    network: env.NETWORK as RenNetwork,
    sourceAsset: getCurrencyRentxName(currency),
    sourceNetwork: getCurrencyRentxSourceChain(currency),
    destAddress,
    destAsset: getCurrencyRentxName(mintedCurrency),
    destNetwork: getChainRentxName(mintedCurrencyChain),
    targetAmount: Number(amount),
    userAddress,
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
