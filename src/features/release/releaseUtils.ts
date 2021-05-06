import { RenNetwork } from "@renproject/interfaces";
import {
  BurnSession,
  GatewaySession,
  ReleasedBurnTransaction,
} from "@renproject/ren-tx";
import { ConfirmedBurnTransaction } from "@renproject/ren-tx/src/types/burn";
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

export const preValidateReleaseTransaction = (tx: BurnSession<any, any>) => {
  // TODO: create advancedValidation
  return (
    tx.sourceAsset &&
    tx.destAddress &&
    tx.userAddress &&
    Number(tx.targetAmount) > 0
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
  const tx: BurnSession<any, any> = {
    id: "tx-" + Math.floor(Math.random() * 10 ** 16),
    network,
    sourceAsset: sourceCurrencyConfig.rentxName,
    sourceChain: sourceChain, // TODO: pass sourceChain explicitly
    destAddress,
    destChain: getChainRentxName(sourceCurrencyConfig.sourceChain),
    targetAmount: amount.toString(),
    userAddress,
    customParams: {},
  };

  return tx;
};

export const getBurnAndReleaseParams = (tx: BurnSession<any, any>) => {
  const networkConfig = getNetworkConfigByRentxName(tx.network);
  const releaseCurrencyConfig = getCurrencyConfigByRentxName(tx.sourceAsset);
  const burnCurrencyConfig = getCurrencyConfig(
    toMintedCurrency(releaseCurrencyConfig.symbol)
  );
  const burnChainConfig = getChainConfigByRentxName(tx.sourceChain);
  const releaseChainConfig = getChainConfig(releaseCurrencyConfig.sourceChain);

  const transaction = tx.transaction;
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
  if (transaction && (transaction as ReleasedBurnTransaction<any>).destTxHash) {
    releaseTxLink =
      getChainExplorerLink(
        releaseChainConfig.symbol,
        tx.network,
        (transaction as ReleasedBurnTransaction<any>).destTxHash || ""
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
    transactionsCount: 1,
  };
  if (burnTxHash) {
    if (
      (transaction as ConfirmedBurnTransaction<any>).renVMHash ||
      (transaction as ReleasedBurnTransaction<any>).destTxHash
    ) {
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
