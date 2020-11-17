import { RenNetwork } from "@renproject/interfaces";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { GatewaySession, mintMachine } from "@renproject/rentx";
import { useMachine } from "@xstate/react";
import { env } from "../../constants/environmentVariables";
import { getRenJs } from "../../services/renJs";
import { lockChainMap, mintChainMap } from "../../services/rentx";
import {
  BridgeChain,
  BridgeCurrency,
  getChainConfig,
  getChainRentxName,
  getCurrencyConfig,
  getCurrencyConfigByRentxName,
  getCurrencyRentxName,
  getCurrencyRentxSourceChain,
  toMintedCurrency,
  getNetworkConfigByRentxName,
} from "../../utils/assetConfigs";
import { getChainExplorerLink } from "../transactions/transactionsUtils";

export const getMintTx: GatewaySession = {
  id: "tx-" + Math.floor(Math.random() * 10 ** 16),
  type: "mint",
  sourceAsset: "btc",
  sourceNetwork: "bitcoin",
  network: "testnet",
  destAddress: "",
  destNetwork: "ethereum",
  targetAmount: 1,
  userAddress: "",
  expiryTime: new Date().getTime() + 1000 * 60 * 60 * 24,
  transactions: {},
  customParams: {},
};

type CreateMintTransactionParams = {
  amount: number;
  currency: BridgeCurrency;
  mintedCurrency: BridgeCurrency; // TODO: Can be probably derived from mintedCurrencyChain
  mintedCurrencyChain: BridgeChain;
  userAddress: string;
  destAddress: string;
};

export const createMintTransaction = ({
  amount,
  currency,
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
    destNetwork: getChainRentxName(mintedCurrencyChain),
    targetAmount: Number(amount),
    userAddress,
    expiryTime: new Date().getTime() + 1000 * 60 * 60 * 24,
    transactions: {},
    customParams: {},
  };

  return tx;
};

export const preValidateMintTransaction = (tx: GatewaySession) => {
  // TODO: create advancedValidation
  return (
    tx.type === "mint" &&
    tx.destAddress &&
    tx.userAddress &&
    tx.targetAmount > 0
  );
};

export const useMintMachine = (mintTransaction: GatewaySession) => {
  const { enabledChains } = useMultiwallet();
  const providers = Object.entries(enabledChains).reduce(
    (c, n) => ({
      ...c,
      [n[0]]: n[1].provider,
    }),
    {}
  );
  return useMachine(mintMachine, {
    context: {
      tx: mintTransaction,
      providers,
      sdk: getRenJs(),
      fromChainMap: lockChainMap,
      toChainMap: mintChainMap,
    },
    devTools: env.XSTATE_DEVTOOLS,
  });
};

export const getLockAndMintParams = (tx: GatewaySession) => {
  const networkConfig = getNetworkConfigByRentxName(tx.network);
  const lockCurrencyConfig = getCurrencyConfigByRentxName(tx.sourceAsset);
  const mintCurrencyConfig = getCurrencyConfig(
    toMintedCurrency(lockCurrencyConfig.symbol)
  );
  const mintChainConfig = getChainConfig(mintCurrencyConfig.chain);
  const lockChainConfig = getChainConfig(lockCurrencyConfig.chain);

  const transaction = Object.values(tx.transactions)[0];
  let mintTxHash: string = "";
  let mintTxLink: string = "";
  if (transaction && transaction.sourceTxHash) {
    mintTxHash = transaction.sourceTxHash;
    mintTxLink =
      getChainExplorerLink(
        mintChainConfig.symbol,
        networkConfig.symbol,
        transaction.sourceTxHash
      ) || "";
  }
  let lockTxHash: string = "";
  let lockTxLink: string = "";
  if (transaction && transaction.destTxHash) {
    lockTxHash = transaction.destTxHash;
    lockTxLink =
      getChainExplorerLink(
        lockChainConfig.symbol,
        networkConfig.symbol,
        lockTxHash
      ) || "";
  }

  let lockProcessingTime = null;
  if (Object.values(tx.transactions)[0]) {
    const transaction = Object.values(tx.transactions)[0];
    if (transaction.sourceTxConfTarget) {
      lockProcessingTime =
        Math.max(
          transaction.sourceTxConfTarget - transaction.sourceTxConfs,
          0
        ) * lockChainConfig.blockTime;
    }
  }

  return {
    networkConfig,
    mintCurrencyConfig,
    lockCurrencyConfig,
    mintChainConfig,
    lockChainConfig,
    mintTxHash,
    mintTxLink,
    lockTxHash,
    lockTxLink,
    lockProcessingTime,
    suggestedAmount: Number(tx.suggestedAmount) / 1e8,
  };
};
