import { SvgIconComponent } from "@material-ui/icons";
import {
  BchFullIcon,
  BinanceChainFullIcon,
  BtcFullIcon,
  CustomSvgIconComponent,
  DgbFullIcon,
  DogeFullIcon,
  DotsFullIcon,
  EthereumChainFullIcon,
  EthereumIcon,
  TooltipIcon as NotSetIcon,
  ZecFullIcon,
} from "../components/icons/RenIcons";
import {
  BridgeChain,
  BridgeCurrency,
  BridgeNetwork,
} from "../components/utils/types";
import { orangeLight } from "../theme/colors";

const unknownLabel = "unknown";

export type LabelsConfig = {
  short: string;
  full: string;
};

export type RentxAssetConfig = {
  rentxName: string;
  sourceConfirmationTime?: number;
};

export type ColorsConfig = {
  color?: string;
};

export type IconsConfig = {
  FullIcon: CustomSvgIconComponent | SvgIconComponent;
  Icon?: CustomSvgIconComponent | SvgIconComponent;
};

export type CurrencyConfig = LabelsConfig &
  ColorsConfig &
  IconsConfig &
  RentxAssetConfig & {
    symbol: BridgeCurrency;
    sourceChain?: BridgeChain;
  };

export const currenciesConfig: Record<BridgeCurrency, CurrencyConfig> = {
  [BridgeCurrency.BTC]: {
    symbol: BridgeCurrency.BTC,
    short: "BTC",
    full: "Bitcoin",
    color: orangeLight,
    FullIcon: BtcFullIcon,
    rentxName: "btc",
    sourceChain: BridgeChain.BTCC,
    sourceConfirmationTime: 15,
  },
  [BridgeCurrency.RENBTC]: {
    symbol: BridgeCurrency.RENBTC,
    short: "renBTC",
    full: "renBTC",
    FullIcon: BtcFullIcon,
    rentxName: "renBTC",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.BCH]: {
    symbol: BridgeCurrency.BCH,
    short: "BCH",
    full: "Bitcoin Cash",
    FullIcon: BchFullIcon,
    rentxName: "bch",
  },
  [BridgeCurrency.RENBCH]: {
    symbol: BridgeCurrency.RENBCH,
    short: "renBCH",
    full: "renBCH",
    FullIcon: BchFullIcon,
    rentxName: "renBCH",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.DOTS]: {
    symbol: BridgeCurrency.DOTS,
    short: "DOTS",
    full: "Polkadot",
    FullIcon: DotsFullIcon,
    rentxName: "dots",
  },
  [BridgeCurrency.DOGE]: {
    symbol: BridgeCurrency.DOGE,
    short: "DOGE",
    full: "Dogecoin",
    FullIcon: DogeFullIcon,
    rentxName: "doge",
  },
  [BridgeCurrency.RENDOGE]: {
    symbol: BridgeCurrency.RENDOGE,
    short: "renDOGE",
    full: "renDOGE",
    FullIcon: DogeFullIcon,
    rentxName: "renDOGE",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.ZEC]: {
    symbol: BridgeCurrency.ZEC,
    short: "ZEC",
    full: "Zcash",
    FullIcon: ZecFullIcon,
    rentxName: "zec",
    sourceChain: BridgeChain.ZECC,
    sourceConfirmationTime: 15,
  },
  [BridgeCurrency.RENZEC]: {
    symbol: BridgeCurrency.RENZEC,
    short: "renZEC",
    full: "renZEC",
    FullIcon: ZecFullIcon,
    rentxName: "renZEC",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.RENDGB]: {
    symbol: BridgeCurrency.RENDGB,
    short: "renDGB",
    full: "renDGB",
    FullIcon: DgbFullIcon,
    rentxName: "renDGB",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.ETH]: {
    symbol: BridgeCurrency.ETH,
    short: "ETH",
    full: "Ether",
    FullIcon: EthereumIcon,
    rentxName: "eth",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.UNKNOWN]: {
    symbol: BridgeCurrency.UNKNOWN,
    short: "UNKNOWN",
    full: "Unknown",
    FullIcon: NotSetIcon,
    rentxName: "unknown",
  },
};

const unknownCurrencyConfig = currenciesConfig[BridgeCurrency.UNKNOWN];

export const getCurrencyConfig = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol] || unknownCurrencyConfig;

export const getCurrencyShortLabel = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].short || unknownLabel;

export const getCurrencyFullLabel = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].full || unknownLabel;

export const getCurrencyConfigByRentxName = (name: string) =>
  Object.values(currenciesConfig).find(
    (currency) => currency.rentxName === name
  ) || unknownCurrencyConfig;

export const getCurrencyRentxName = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].rentxName || unknownLabel;

export const getCurrencySourceChain = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].sourceChain || BridgeChain.UNKNOWNC;

export const getCurrencyRentxSourceChain = (symbol: BridgeCurrency) => {
  const bridgeChain = getCurrencySourceChain(symbol);
  if (bridgeChain) {
    return getChainRentxName(bridgeChain);
  }
  return BridgeChain.UNKNOWNC;
};

type ChainConfig = LabelsConfig &
  IconsConfig &
  RentxAssetConfig & {
    symbol: BridgeChain;
  };

// TODO: add confirmations from https://support.kraken.com/hc/en-us/articles/203325283-Cryptocurrency-deposit-processing-times
export const chainsConfig: Record<BridgeChain, ChainConfig> = {
  [BridgeChain.BTCC]: {
    symbol: BridgeChain.BTCC,
    short: "BTC",
    full: "Bitcoin",
    FullIcon: NotSetIcon,
    rentxName: "bitcoin",
  },
  [BridgeChain.ZECC]: {
    symbol: BridgeChain.ZECC,
    short: "ZEC",
    full: "Zcash",
    FullIcon: NotSetIcon,
    rentxName: "zcash",
  },
  [BridgeChain.BNCC]: {
    symbol: BridgeChain.BNCC,
    short: "BNC",
    full: "Binance SmartChain",
    FullIcon: BinanceChainFullIcon,
    rentxName: "binanceSmartChain",
  },
  [BridgeChain.ETHC]: {
    symbol: BridgeChain.ETHC,
    short: "ETH",
    full: "Ethereum",
    FullIcon: EthereumChainFullIcon,
    rentxName: "ethereum",
  },
  [BridgeChain.UNKNOWNC]: {
    symbol: BridgeChain.UNKNOWNC,
    short: "UNKNOWNC",
    full: "Unknown",
    FullIcon: NotSetIcon,
    rentxName: "unknown",
  },
};

const unknownChainConfig = chainsConfig[BridgeChain.UNKNOWNC];

export const getChainConfig = (symbol: BridgeChain) =>
  chainsConfig[symbol] || unknownChainConfig;

export const getChainShortLabel = (symbol: BridgeChain) =>
  chainsConfig[symbol].full || unknownLabel;

export const getChainFullLabel = (symbol: BridgeChain) =>
  chainsConfig[symbol].full || unknownLabel;

export const getChainRentxName = (symbol: BridgeChain) =>
  chainsConfig[symbol].rentxName || unknownLabel;

export const getChainConfigByRentxName = (name: string) =>
  Object.values(chainsConfig).find((chain) => chain.rentxName === name) ||
  unknownChainConfig;

type NetworkConfig = LabelsConfig &
  RentxAssetConfig & {
    symbol: BridgeNetwork;
  };

export const networksConfig: Record<BridgeNetwork, NetworkConfig> = {
  [BridgeNetwork.MAINNET]: {
    symbol: BridgeNetwork.MAINNET,
    short: "MAINNET",
    full: "Mainnet",
    rentxName: "mainnet",
  },
  [BridgeNetwork.TESTNET]: {
    symbol: BridgeNetwork.TESTNET,
    short: "TESTNET",
    full: "Testnet",
    rentxName: "testnet",
  },
  [BridgeNetwork.UNKNOWN]: {
    symbol: BridgeNetwork.UNKNOWN,
    short: "UNKNOWN",
    full: "Unknown",
    rentxName: "unknown",
  },
};

const unknownNetworkConfig = networksConfig[BridgeNetwork.UNKNOWN];

export const getNetworkConfigByRentxName = (name: string) =>
  Object.values(networksConfig).find((network) => network.rentxName === name) ||
  unknownNetworkConfig;

export const supportedMintCurrencies = [
  BridgeCurrency.BTC,
  // BridgeCurrency.BCH,
  // BridgeCurrency.DOGE,
  BridgeCurrency.ZEC,
];

export const supportedMintDestinationChains = [
  BridgeChain.ETHC,
  // BridgeChain.BNCC,
];

export const supportedReleaseSourceChains = [
  BridgeChain.ETHC, // BridgeChain.BNCC,
];

export const supportedReleaseCurrencies = [
  BridgeCurrency.RENBTC,
  // BridgeCurrency.RENBCH,
  // BridgeCurrency.RENDOGE,
  BridgeCurrency.RENZEC,
];

export const getMintedDestinationCurrencySymbol = (
  sourceCurrency: BridgeCurrency
) => {
  switch (sourceCurrency) {
    case BridgeCurrency.BTC:
      return BridgeCurrency.RENBTC;
    case BridgeCurrency.BCH:
      return BridgeCurrency.RENBCH;
    case BridgeCurrency.DOGE:
      return BridgeCurrency.RENDOGE;
    case BridgeCurrency.ZEC:
      return BridgeCurrency.RENZEC;
    default:
      return BridgeCurrency.UNKNOWN;
  }
};

export const getReleasedDestinationCurrencySymbol = (
  sourceCurrency: BridgeCurrency
) => {
  switch (sourceCurrency) {
    case BridgeCurrency.RENBTC:
      return BridgeCurrency.BTC;
    case BridgeCurrency.RENBCH:
      return BridgeCurrency.BCH;
    case BridgeCurrency.RENDOGE:
      return BridgeCurrency.DOGE;
    case BridgeCurrency.RENZEC:
      return BridgeCurrency.ZEC;
    default:
      return BridgeCurrency.UNKNOWN;
  }
};
