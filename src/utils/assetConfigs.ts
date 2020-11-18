import { SvgIconComponent } from "@material-ui/icons";
import {
  BchFullIcon,
  BchGreyIcon,
  BinanceChainFullIcon,
  BitcoinIcon,
  BtcFullIcon,
  BtcGreyIcon,
  CustomSvgIconComponent,
  DgbFullIcon,
  DgbGreyIcon,
  DogeFullIcon,
  DogeGreyIcon,
  DotsFullIcon,
  DotsGreyIcon,
  EthereumChainFullIcon,
  EthereumIcon,
  TooltipIcon as NotSetIcon,
  ZecFullIcon,
  ZecGreyIcon,
} from "../components/icons/RenIcons";
import { orangeLight } from "../theme/colors";

export enum BridgeCurrency {
  BTC = "BTC",
  BCH = "BCH",
  DOTS = "DOTS",
  DOGE = "DOGE",
  ZEC = "ZEC",
  DGB = "DGB",
  RENBTC = "RENBTC",
  RENBCH = "RENBCH",
  RENDOGE = "RENDOGE",
  RENZEC = "RENZEC",
  RENDGB = "RENDGB",
  ETH = "ETH",
  UNKNOWN = "UNKNOWN",
}

export enum BridgeChain {
  BTCC = "BTCC",
  BCHC = "BCHC",
  ZECC = "ZECC",
  BNCC = "BNCC",
  ETHC = "ETHC",
  UNKNOWNC = "UNKNOWNC",
}

export enum BridgeNetwork {
  MAINNET = "MAINNET",
  TESTNET = "TESTNET",
  UNKNOWN = "UNKNOWN",
}

const unknownLabel = "unknown";

export type LabelsConfig = {
  short: string;
  full: string;
};

export type RentxAssetConfig = {
  rentxName: string;
};

export type ColorsConfig = {
  color?: string;
};

export type IconsConfig = {
  FullIcon: CustomSvgIconComponent | SvgIconComponent;
  GreyIcon: CustomSvgIconComponent | SvgIconComponent;
  MainIcon: CustomSvgIconComponent | SvgIconComponent;
};

export type CurrencyConfig = LabelsConfig &
  ColorsConfig &
  IconsConfig &
  RentxAssetConfig & {
    symbol: BridgeCurrency;
    chain: BridgeChain;
    bandchainSymbol?: string;
  };

export const currenciesConfig: Record<BridgeCurrency, CurrencyConfig> = {
  [BridgeCurrency.BTC]: {
    symbol: BridgeCurrency.BTC,
    short: "BTC",
    full: "Bitcoin",
    color: orangeLight,
    FullIcon: BtcFullIcon,
    GreyIcon: BtcGreyIcon,
    MainIcon: BtcFullIcon,
    rentxName: "btc",
    chain: BridgeChain.BTCC,
  },
  [BridgeCurrency.RENBTC]: {
    symbol: BridgeCurrency.RENBTC,
    short: "renBTC",
    full: "Bitcoin",
    FullIcon: BtcFullIcon,
    GreyIcon: BtcGreyIcon,
    MainIcon: BtcGreyIcon,
    rentxName: "renBTC",
    chain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.BTC,
  },
  [BridgeCurrency.BCH]: {
    symbol: BridgeCurrency.BCH,
    short: "BCH",
    full: "Bitcoin Cash",
    FullIcon: BchFullIcon,
    GreyIcon: BchGreyIcon,
    MainIcon: BchFullIcon,
    chain: BridgeChain.BCHC,
    rentxName: "bitcoinCash",
  },
  [BridgeCurrency.RENBCH]: {
    symbol: BridgeCurrency.RENBCH,
    short: "renBCH",
    full: "renBCH",
    FullIcon: BchFullIcon,
    GreyIcon: BchGreyIcon,
    MainIcon: BtcFullIcon,
    rentxName: "renBCH",
    chain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.BCH,
  },
  [BridgeCurrency.DOTS]: {
    symbol: BridgeCurrency.DOTS,
    short: "DOTS",
    full: "Polkadot",
    FullIcon: DotsFullIcon,
    GreyIcon: DotsGreyIcon,
    MainIcon: DotsFullIcon,
    chain: BridgeChain.UNKNOWNC, // TODO:
    rentxName: "dots",
    bandchainSymbol: "DOT",
  },
  [BridgeCurrency.DOGE]: {
    symbol: BridgeCurrency.DOGE,
    short: "DOGE",
    full: "Dogecoin",
    FullIcon: DogeFullIcon,
    GreyIcon: DogeGreyIcon,
    MainIcon: DogeFullIcon,
    chain: BridgeChain.UNKNOWNC, // TODO:
    rentxName: "doge",
  },
  [BridgeCurrency.RENDOGE]: {
    symbol: BridgeCurrency.RENDOGE,
    short: "renDOGE",
    full: "Dogecoin",
    FullIcon: DogeFullIcon,
    GreyIcon: DogeGreyIcon,
    MainIcon: DogeGreyIcon,
    rentxName: "renDOGE",
    chain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.DOGE,
  },
  [BridgeCurrency.ZEC]: {
    symbol: BridgeCurrency.ZEC,
    short: "ZEC",
    full: "Zcash",
    FullIcon: ZecFullIcon,
    GreyIcon: ZecGreyIcon,
    MainIcon: ZecFullIcon,
    rentxName: "zec",
    chain: BridgeChain.ZECC,
  },
  [BridgeCurrency.RENZEC]: {
    symbol: BridgeCurrency.RENZEC,
    short: "renZEC",
    full: "Zcash",
    FullIcon: ZecFullIcon,
    GreyIcon: ZecGreyIcon,
    MainIcon: ZecGreyIcon,
    rentxName: "renZEC",
    chain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.ZEC,
  },
  [BridgeCurrency.DGB]: {
    symbol: BridgeCurrency.DGB,
    short: "DGB",
    full: "DigiByte",
    FullIcon: DgbFullIcon,
    GreyIcon: DgbGreyIcon,
    MainIcon: DgbFullIcon,
    chain: BridgeChain.UNKNOWNC, // TODO:
    rentxName: "DGB",
  },
  [BridgeCurrency.RENDGB]: {
    symbol: BridgeCurrency.RENDGB,
    short: "renDGB",
    full: "DigiByte",
    FullIcon: DgbFullIcon,
    GreyIcon: DgbGreyIcon,
    MainIcon: DgbGreyIcon,
    rentxName: "renDGB",
    chain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.DGB,
  },
  [BridgeCurrency.ETH]: {
    symbol: BridgeCurrency.ETH,
    short: "ETH",
    full: "Ether",
    FullIcon: EthereumIcon,
    GreyIcon: NotSetIcon,
    MainIcon: BtcFullIcon,
    rentxName: "eth",
    chain: BridgeChain.ETHC,
  },
  [BridgeCurrency.UNKNOWN]: {
    symbol: BridgeCurrency.UNKNOWN,
    short: "UNKNOWN",
    full: "Unknown",
    FullIcon: NotSetIcon,
    GreyIcon: NotSetIcon,
    MainIcon: NotSetIcon,
    chain: BridgeChain.UNKNOWNC,
    rentxName: "unknown",
  },
};

const unknownCurrencyConfig = currenciesConfig[BridgeCurrency.UNKNOWN];

export const getCurrencyConfig = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol] || unknownCurrencyConfig;

export const getCurrencyShortLabel = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].short || unknownLabel;

export const getCurrencyConfigByRentxName = (name: string) =>
  Object.values(currenciesConfig).find(
    (currency) => currency.rentxName === name
  ) || unknownCurrencyConfig;

export const getCurrencyConfigByBandchainSymbol = (symbol: string) =>
  Object.values(currenciesConfig).find(
    (config) => config.bandchainSymbol === symbol || config.symbol === symbol
  ) || unknownCurrencyConfig;

export const getCurrencyRentxName = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].rentxName || unknownLabel;

export const getCurrencySourceChain = (symbol: BridgeCurrency) =>
  currenciesConfig[symbol].chain || BridgeChain.UNKNOWNC;

export const getCurrencyRentxSourceChain = (symbol: BridgeCurrency) => {
  const bridgeChain = getCurrencySourceChain(symbol);
  if (bridgeChain) {
    return getChainRentxName(bridgeChain);
  }
  return BridgeChain.UNKNOWNC;
};

export type ChainConfig = LabelsConfig &
  IconsConfig &
  RentxAssetConfig & {
    symbol: BridgeChain;
    blockTime: number;
    targetConfirmations?: number;
  };

// TODO: add confirmations from https://support.kraken.com/hc/en-us/articles/203325283-Cryptocurrency-deposit-processing-times
export const chainsConfig: Record<BridgeChain, ChainConfig> = {
  [BridgeChain.BTCC]: {
    symbol: BridgeChain.BTCC,
    short: "BTC",
    full: "Bitcoin",
    FullIcon: NotSetIcon,
    MainIcon: BitcoinIcon,
    GreyIcon: NotSetIcon,
    rentxName: "bitcoin",
    blockTime: 10,
    targetConfirmations: 6,
  },
  [BridgeChain.BCHC]: {
    symbol: BridgeChain.BCHC,
    short: "BCH",
    full: "Bitcoin Cash",
    FullIcon: BchFullIcon,
    GreyIcon: BchGreyIcon,
    MainIcon: BchFullIcon,
    rentxName: "bitcoinCash",
    blockTime: 10,
    targetConfirmations: 6,
  },
  [BridgeChain.ZECC]: {
    symbol: BridgeChain.ZECC,
    short: "ZEC",
    full: "Zcash",
    FullIcon: ZecFullIcon,
    GreyIcon: ZecGreyIcon,
    MainIcon: ZecFullIcon,
    rentxName: "zcash",
    blockTime: 2.5,
  },
  [BridgeChain.BNCC]: {
    symbol: BridgeChain.BNCC,
    short: "BNC",
    full: "Binance SmartChain",
    FullIcon: BinanceChainFullIcon,
    MainIcon: BinanceChainFullIcon,
    GreyIcon: NotSetIcon,
    rentxName: "binanceSmartChain",
    blockTime: 3,
  },
  [BridgeChain.ETHC]: {
    symbol: BridgeChain.ETHC,
    short: "ETH",
    full: "Ethereum",
    FullIcon: EthereumChainFullIcon,
    MainIcon: EthereumChainFullIcon,
    GreyIcon: NotSetIcon,
    rentxName: "ethereum",
    blockTime: 0.25,
  },
  [BridgeChain.UNKNOWNC]: {
    symbol: BridgeChain.UNKNOWNC,
    short: "UNKNOWNC",
    full: "Unknown",
    FullIcon: NotSetIcon,
    GreyIcon: NotSetIcon,
    MainIcon: NotSetIcon,
    rentxName: "unknown",
    blockTime: 1e6,
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

export const supportedLockCurrencies = [
  BridgeCurrency.BTC,
  // BridgeCurrency.BCH,
  // BridgeCurrency.DOGE,
  // BridgeCurrency.ZEC,
];

export const supportedMintDestinationChains = [
  BridgeChain.ETHC,
  // BridgeChain.BNCC,
];

export const supportedBurnChains = [
  BridgeChain.ETHC, // BridgeChain.BNCC,
];

export const supportedReleaseCurrencies = [
  BridgeCurrency.RENBTC,
  // BridgeCurrency.RENBCH,
  // BridgeCurrency.RENDOGE,
  BridgeCurrency.RENZEC,
];

export const toMintedCurrency = (lockedCurrency: BridgeCurrency) => {
  switch (lockedCurrency) {
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

export const toReleasedCurrency = (burnedCurrency: BridgeCurrency) => {
  switch (burnedCurrency) {
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
