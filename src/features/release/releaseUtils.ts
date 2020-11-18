import { RenNetwork } from "@renproject/interfaces";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { burnMachine, GatewaySession } from "@renproject/ren-tx";
import { useMachine } from "@xstate/react";
import { useSelector } from 'react-redux'
import { env } from "../../constants/environmentVariables";
import { getRenJs } from "../../services/renJs";
import { burnChainMap, releaseChainMap } from "../../services/rentx";
import {
  BridgeCurrency,
  getChainConfig,
  getChainRentxName,
  getCurrencyConfig,
  getCurrencyConfigByRentxName,
  getCurrencyRentxSourceChain,
  toMintedCurrency,
  getNetworkConfigByRentxName,
  toReleasedCurrency,
} from "../../utils/assetConfigs";
import { $network } from '../network/networkSlice'
import { getChainExplorerLink } from "../transactions/transactionsUtils";

export const preValidateReleaseTransaction = (tx: GatewaySession) => {
  // TODO: create advancedValidation
  return (
    tx.type === "burn" &&
    tx.sourceAsset &&
    tx.destAddress &&
    tx.userAddress &&
    tx.targetAmount > 0
  );
};

type CreateReleaseTransactionParams = {
  amount: number;
  currency: BridgeCurrency;
  userAddress: string;
  destAddress: string;
};

export const createReleaseTransaction = ({
  amount,
  currency,
  userAddress,
  destAddress,
}: CreateReleaseTransactionParams) => {
  const sourceCurrency = toReleasedCurrency(currency);
  const sourceCurrencyConfig = getCurrencyConfig(sourceCurrency);
  const tx: GatewaySession = {
    id: "tx-" + Math.floor(Math.random() * 10 ** 16),
    type: "burn",
    network: env.NETWORK as RenNetwork,
    sourceAsset: sourceCurrencyConfig.rentxName,
    sourceChain: getCurrencyRentxSourceChain(currency),
    destAddress,
    destChain: getChainRentxName(sourceCurrencyConfig.chain),
    targetAmount: Number(amount),
    userAddress,
    expiryTime: new Date().getTime() + 1000 * 60 * 60 * 24,
    transactions: {},
    customParams: {},
  };

  return tx;
};

export const getBurnAndReleaseParams = (tx: GatewaySession) => {
  const networkConfig = getNetworkConfigByRentxName(tx.network);
  const releaseCurrencyConfig = getCurrencyConfigByRentxName(tx.sourceAsset);
  const burnCurrencyConfig = getCurrencyConfig(
    toMintedCurrency(releaseCurrencyConfig.symbol)
  );
  const burnChainConfig = getChainConfig(burnCurrencyConfig.chain);
  const releaseChainConfig = getChainConfig(releaseCurrencyConfig.chain);

  const transaction = Object.values(tx.transactions)[0];
  let burnTxHash: string = "";
  let burnTxLink: string = "";
  if (transaction && transaction.sourceTxHash) {
    burnTxHash = transaction.sourceTxHash;
    burnTxLink =
      getChainExplorerLink(
        burnChainConfig.symbol,
        networkConfig.symbol,
        transaction.sourceTxHash
      ) || "";
  }
  let releaseTxHash: string = "";
  let releaseTxLink: string = "";
  if (transaction && transaction.destTxHash) {
    releaseTxHash = transaction.destTxHash;
    releaseTxLink =
      getChainExplorerLink(
        releaseChainConfig.symbol,
        networkConfig.symbol,
        releaseTxHash
      ) || "";
  }

  return {
    networkConfig,
    burnCurrencyConfig,
    releaseCurrencyConfig,
    burnChainConfig,
    releaseChainConfig,
    burnTxHash,
    burnTxLink,
    releaseTxHash,
    releaseTxLink,
  };
};

export const useBurnMachine = (burnTransaction: GatewaySession) => {
  const { enabledChains } = useMultiwallet();
  const network = useSelector($network);
  const providers = Object.entries(enabledChains).reduce(
    (c, n) => ({
      ...c,
      [n[0]]: n[1].provider,
    }),
    {}
  );
  return useMachine(burnMachine, {
    context: {
      tx: burnTransaction,
      providers,
      sdk: getRenJs(network),
      fromChainMap: burnChainMap,
      toChainMap: releaseChainMap,
      // If we already have a transaction, we need to autoSubmit
      // to check the tx status
      autoSubmit: !!Object.values(burnTransaction.transactions)[0],
    },
    devTools: env.XSTATE_DEVTOOLS,
  });
};
