import { RenNetwork } from "@renproject/interfaces";
import { GatewaySession } from "@renproject/ren-tx";
import {
  BridgeCurrency,
  getChainConfig,
  getChainConfigByRentxName,
  getChainRentxName,
  getCurrencyConfig,
  getCurrencyConfigByRentxName,
  getNetworkConfigByRentxName,
  RenChain,
  toMintedCurrency,
  toReleasedCurrency,
} from "../../utils/assetConfigs";
import {
  getAddressExplorerLink,
  getChainExplorerLink,
  getTxCreationTimestamp,
  TxEntryStatus,
  TxMeta,
  TxPhase,
} from "../transactions/transactionsUtils";

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
  sourceChain: RenChain;
  network: RenNetwork;
};

export const createReleaseTransaction = ({
  amount,
  currency,
  userAddress,
  destAddress,
  sourceChain,
  network,
}: CreateReleaseTransactionParams) => {
  const sourceCurrency = toReleasedCurrency(currency);
  const sourceCurrencyConfig = getCurrencyConfig(sourceCurrency);
  const tx: GatewaySession = {
    id: "tx-" + Math.floor(Math.random() * 10 ** 16),
    type: "burn",
    network,
    sourceAsset: sourceCurrencyConfig.rentxName,
    sourceChain: sourceChain, // TODO: pass sourceChain explicitly
    destAddress,
    destChain: getChainRentxName(sourceCurrencyConfig.sourceChain),
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
  const burnChainConfig = getChainConfigByRentxName(tx.sourceChain);
  const releaseChainConfig = getChainConfig(releaseCurrencyConfig.sourceChain);

  const transaction = Object.values(tx.transactions)[0];
  let burnTxHash: string = "";
  let burnTxLink: string = "";
  if (transaction && transaction.sourceTxHash) {
    burnTxHash = transaction.sourceTxHash;
    burnTxLink =
      getChainExplorerLink(
        burnChainConfig.symbol,
        tx.network,
        transaction.sourceTxHash
      ) || "";
  }
  let releaseTxHash: string = "";
  let releaseTxLink: string = "";
  if (transaction && transaction.destTxHash) {
    releaseTxLink =
      getChainExplorerLink(
        releaseChainConfig.symbol,
        tx.network,
        transaction.destTxHash
      ) || "";
  }
  const releaseAddressLink = getAddressExplorerLink(
    releaseChainConfig.symbol,
    tx.network,
    tx.destAddress
  );

  const meta: TxMeta = {
    status: TxEntryStatus.PENDING,
    phase: TxPhase.NONE,
    createdTimestamp: getTxCreationTimestamp(tx),
  };
  if (burnTxHash) {
    if (transaction.renVMHash || transaction.destTxHash) {
      // burn and releaseTxHash present
      meta.status = TxEntryStatus.COMPLETED;
    }
  } else {
    // no burnTxHash - action required on burningChain
    meta.status = TxEntryStatus.ACTION_REQUIRED;
    meta.phase = TxPhase.BURN;
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
    releaseAddressLink,
    meta,
  };
};

export const isReleaseTransactionCompleted = (tx: GatewaySession) => {
  const transaction = Object.values(tx.transactions)[0];
  return !!(transaction?.renVMHash || transaction?.destTxHash);
};
