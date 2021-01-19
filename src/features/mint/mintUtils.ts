import { RenNetwork } from "@renproject/interfaces";
import { GatewaySession } from "@renproject/ren-tx";
import {
  BridgeChain,
  BridgeCurrency,
  getChainConfig,
  getChainConfigByRentxName,
  getChainRentxName,
  getCurrencyConfig,
  getCurrencyConfigByRentxName,
  getCurrencyRentxName,
  getCurrencyRentxSourceChain,
  getNetworkConfigByRentxName,
  toMintedCurrency,
} from "../../utils/assetConfigs";
import {
  getAddressExplorerLink,
  getChainExplorerLink,
  getTxCreationTimestamp,
  isTxExpired,
  TxEntryStatus,
  TxMeta,
  TxPhase,
} from "../transactions/transactionsUtils";

type CreateMintTransactionParams = {
  amount: number;
  currency: BridgeCurrency;
  mintedCurrency: BridgeCurrency; // TODO: Can be probably derived from mintedCurrencyChain
  mintedCurrencyChain: BridgeChain;
  userAddress: string;
  destAddress: string;
  network: RenNetwork;
};

export const createMintTransaction = ({
  amount,
  currency,
  mintedCurrencyChain,
  userAddress,
  destAddress,
  network,
}: CreateMintTransactionParams) => {
  const tx: GatewaySession = {
    id: "tx-" + Math.floor(Math.random() * 10 ** 16),
    type: "mint",
    network,
    sourceAsset: getCurrencyRentxName(currency),
    sourceChain: getCurrencyRentxSourceChain(currency), // TODO: it can be derived for minting
    destAddress,
    destChain: getChainRentxName(mintedCurrencyChain),
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

export const getLockAndMintParams = (tx: GatewaySession, txIndex = 0) => {
  const networkConfig = getNetworkConfigByRentxName(tx.network);
  const lockCurrencyConfig = getCurrencyConfigByRentxName(tx.sourceAsset);
  const mintCurrencyConfig = getCurrencyConfig(
    toMintedCurrency(lockCurrencyConfig.symbol)
  );
  const lockChainConfig = getChainConfig(lockCurrencyConfig.sourceChain);
  const mintChainConfig = getChainConfigByRentxName(tx.destChain);
  const mintAddressLink = getAddressExplorerLink(
    mintChainConfig.symbol,
    tx.network,
    tx.userAddress
  );

  const transactions = Object.values(tx.transactions);
  const transaction = transactions[txIndex];
  let mintTxHash: string = "";
  let mintTxLink: string = "";
  if (transaction && transaction.destTxHash) {
    mintTxHash = transaction.destTxHash;
    mintTxLink =
      getChainExplorerLink(
        mintChainConfig.symbol,
        tx.network,
        transaction.destTxHash || ""
      ) || "";
  }
  let lockTxHash: string = "";
  let lockTxLink: string = "";
  let lockTxAmount = 0;
  let lockProcessingTime = null;
  let lockConfirmations = 0;
  let lockTargetConfirmations = 0;
  if (transaction) {
    lockTxAmount = transaction.sourceTxAmount / 1e8;
    if (transaction.rawSourceTx) {
      lockTxHash = transaction.rawSourceTx.transaction.txHash;
      lockTxLink =
        getChainExplorerLink(lockChainConfig.symbol, tx.network, lockTxHash) ||
        "";
    }
    lockConfirmations = transaction.sourceTxConfs;
    if (transaction.sourceTxConfTarget) {
      lockTargetConfirmations = transaction.sourceTxConfTarget;
      lockProcessingTime =
        Math.max(lockTargetConfirmations - lockConfirmations, 0) *
        lockChainConfig.blockTime;
    }
  }
  const meta: TxMeta = {
    status: TxEntryStatus.PENDING,
    phase: TxPhase.NONE,
    createdTimestamp: getTxCreationTimestamp(tx),
    transactionsCount: transactions.length,
  };
  if (lockTxHash) {
    // it has lockTxHash - there is deposit
    if (mintTxHash) {
      // mint tx hash present - completed
      meta.status = TxEntryStatus.COMPLETED;
    } else if (lockConfirmations >= lockTargetConfirmations) {
      // no mint tx hash, but confirmations fulfilled
      meta.status = TxEntryStatus.ACTION_REQUIRED;
      meta.phase = TxPhase.MINT;
      // expired in mint phase - no submission
      if (isTxExpired(tx)) {
        meta.status = TxEntryStatus.EXPIRED;
      }
    } else if (lockConfirmations < lockTargetConfirmations) {
      // no mint tx hash, but awaiting confirmations
      meta.status = TxEntryStatus.PENDING;
      meta.phase = TxPhase.LOCK;
    }
  } else {
    // no deposit
    meta.status = TxEntryStatus.ACTION_REQUIRED;
    meta.phase = TxPhase.LOCK;
    // expired in lock phase - no deposit
    if (isTxExpired(tx)) {
      meta.status = TxEntryStatus.EXPIRED;
    }
  }

  return {
    networkConfig,
    mintCurrencyConfig,
    lockCurrencyConfig,
    mintChainConfig,
    lockChainConfig,
    mintAddressLink,
    mintTxHash,
    mintTxLink,
    lockTxHash,
    lockTxLink,
    lockConfirmations,
    lockTargetConfirmations,
    lockProcessingTime,
    lockTxAmount,
    suggestedAmount: Number(tx.suggestedAmount) / 1e8,
    meta,
  };
};

export const isMintTransactionCompleted = (tx: GatewaySession) => {
  const { meta } = getLockAndMintParams(tx);
  return (
    meta.status === TxEntryStatus.COMPLETED ||
    tx.expiryTime < new Date().getTime()
  );
};
