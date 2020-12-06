import { GatewaySession } from "@renproject/ren-tx";
import queryString from "query-string";
import { useLocation } from "react-router-dom";
import {
  BridgeChain,
  BridgeCurrency,
  BridgeNetwork,
  getChainConfig,
  getCurrencyConfig,
  getCurrencyConfigByRentxName,
} from "../../utils/assetConfigs";
import { toPercent } from "../../utils/converters";
import { getFormattedDateTime } from "../../utils/dates";

export const mintUpdateableEvents = ["requestingSignature"];

export enum TxEntryStatus {
  PENDING = "pending",
  ACTION_REQUIRED = "action_required",
  COMPLETED = "completed",
  EXPIRED = "expired",
}

export enum TxPhase {
  LOCK = "lock",
  MINT = "mint",
  BURN = "burn",
  RELEASE = "release",
  NONE = "",
}

export type TxMeta = {
  status: TxEntryStatus;
  phase: TxPhase;
  createdTimestamp: number;
};

export enum TxType {
  MINT = "mint",
  BURN = "burn",
}

export enum TxConfigurationStep {
  INITIAL = "initial",
  FEES = "fees",
}

export type TxConfigurationStepProps = {
  onPrev?: () => void;
  onNext?: () => void;
};

export type LocationTxState = {
  txState?: {
    newTx?: boolean;
    reloadTx?: boolean;
  };
};

export const useTxParam = () => {
  const location = useLocation();
  const tx = parseTxQueryString(location.search);
  const locationState = location.state as LocationTxState;

  return { tx, txState: locationState?.txState };
};

export const createTxQueryString = (tx: GatewaySession) => {
  const { customParams, transactions, ...sanitized } = tx;

  return queryString.stringify({
    ...sanitized,
    customParams: JSON.stringify(customParams),
    transactions: JSON.stringify(transactions),
  } as any);
};

const parseNumber = (value: any) => {
  if (typeof value === "undefined") {
    return undefined;
  }
  return Number(value);
};

export const isTxExpired = (tx: GatewaySession) => {
  if (tx.expiryTime) {
    const difference = Date.now() - tx.expiryTime;
    if (difference >= 24 * 3600) {
      return true;
    }
  }
  return false;
};

export const txSorter = (
  a: Partial<GatewaySession>,
  b: Partial<GatewaySession>
) => {
  if (a.expiryTime && b.expiryTime) {
    return b.expiryTime - a.expiryTime;
  }
  return 0;
};

export const cloneTx = (tx: GatewaySession) =>
  JSON.parse(JSON.stringify(tx)) as GatewaySession;

export const parseTxQueryString: (
  query: string
) => Partial<GatewaySession> | null = (query: string) => {
  const parsed = queryString.parse(query);
  if (!parsed) {
    return null;
  }
  const {
    expiryTime,
    suggestedAmount,
    targetAmount,
    transactions,
    customParams,
    ...rest
  } = parsed;

  return {
    ...rest,
    transactions: JSON.parse((transactions as string) || "{}"),
    customParams: JSON.parse((customParams as string) || "{}"),
    expiryTime: parseNumber(expiryTime),
    suggestedAmount: parseNumber(suggestedAmount),
    targetAmount: parseNumber(targetAmount),
  };
};

const sochainTestnet = "https://sochain.com/tx/";
const sochain = "https://sochain.com/tx/";
const etherscanTestnet = "https://kovan.etherscan.io/tx/";
const etherscan = "https://etherscan.io/tx/";
const binanceTestnet = "https://testnet.bscscan.com/tx/";
const binance = "https://bscscan.com/tx/";

export const getChainExplorerLink = (
  chain: BridgeChain,
  network: BridgeNetwork,
  txId: string
) => {
  if (!txId) {
    return "";
  }
  if (network === BridgeNetwork.TESTNET) {
    switch (chain) {
      case BridgeChain.ETHC:
        return etherscanTestnet + txId;
      case BridgeChain.BSCC:
        return binanceTestnet + txId;
      case BridgeChain.BTCC:
        return sochainTestnet + "BTCTEST/" + txId;
      case BridgeChain.ZECC:
        return sochainTestnet + "ZECTEST/" + txId;
    }
  } else if (network === BridgeNetwork.MAINNET) {
    switch (chain) {
      case BridgeChain.ETHC:
        return etherscan + txId;
      case BridgeChain.BSCC:
        return binance + txId;
      case BridgeChain.BTCC:
        return sochain + "BTC/" + txId;
      case BridgeChain.ZECC:
        return sochain + "ZEC/" + txId;
    }
  }
};

type GetFeeTooltipsArgs = {
  mintFee: number;
  releaseFee: number;
  sourceCurrency: BridgeCurrency;
  chain: BridgeChain;
};

export const getFeeTooltips = ({
  mintFee,
  releaseFee,
  sourceCurrency,
  chain,
}: GetFeeTooltipsArgs) => {
  const sourceCurrencyConfig = getCurrencyConfig(sourceCurrency);
  const sourceCurrencyChainConfig = getChainConfig(
    sourceCurrencyConfig.sourceChain
  );
  const renCurrencyChainConfig = getChainConfig(chain);
  const renNativeChainCurrencyConfig = getCurrencyConfig(
    renCurrencyChainConfig.nativeCurrency
  );
  // const destinationCurrencyConfig = getCurrencyConfig(renCurrencyChainConfig.s)
  return {
    renVmFee: `RenVM takes a ${toPercent(
      mintFee
    )}% fee per mint transaction and ${toPercent(
      releaseFee
    )}% per burn transaction. This is shared evenly between all active nodes in the decentralized network.`,
    sourceChainMinerFee: `The fee required by ${sourceCurrencyChainConfig.full} miners, to move ${sourceCurrencyConfig.short}. This does not go RenVM or the Ren team.`,
    renCurrencyChainFee: `The estimated cost to perform a transaction on the ${renCurrencyChainConfig.full} network. This fee goes to ${renCurrencyChainConfig.short} miners and is paid in ${renNativeChainCurrencyConfig.short}.`,
  };
};

export const getTxPageTitle = (tx: GatewaySession) => {
  const amount = tx.targetAmount;
  const asset = getCurrencyConfigByRentxName(tx.sourceAsset).short;
  const type = tx.type === TxType.MINT ? "Mint" : "Release";
  const date = new Date(tx.expiryTime - 24 * 3600 * 1000).toISOString();

  return `${type} - ${amount} ${asset} - ${date}`;
};

export const getCreationTimestamp = (tx: GatewaySession) =>
  tx.expiryTime - 24 * 60 * 3600;
