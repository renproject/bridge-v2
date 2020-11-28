import { SvgIconComponent } from "@material-ui/icons";
import { RenNetwork } from "@renproject/interfaces";
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
  MetamaskFullIcon,
  TooltipIcon as NotSetIcon,
  WalletConnectFullIcon,
  ZecFullIcon,
  ZecGreyIcon,
} from "../components/icons/RenIcons";
import { bitcoinOrange, orangeLight } from '../theme/colors'

// TODO: replace everywhere
export enum RenChain {
  binanceSmartChain = "binanceSmartChain",
  ethereum = "ethereum",
  bitcoin = "bitcoin",
  zcash = "zcash",
  bitcoinCash = "bitcoinCash",
  dogecoin = "dogecoin",
  unknown = "unknown",
}

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
  BNB = "BNB",
  UNKNOWN = "UNKNOWN",
}

export enum BridgeChain {
  BTCC = "BTCC",
  BCHC = "BCHC",
  ZECC = "ZECC",
  DOGC = "DOGC",
  BSCC = "BSCC",
  ETHC = "ETHC",
  UNKNOWNC = "UNKNOWNC",
}

export enum BridgeNetwork {
  MAINNET = "MAINNET",
  TESTNET = "TESTNET",
  UNKNOWN = "UNKNOWN",
}

export enum BridgeWallet {
  METAMASKW = "METAMASKW",
  WALLETCONNECTW = "WALLETCONNECTW",
  BINANCESMARTCHAINW = "BINANCESMARTCHAINW",
  UNKNOWNW = "UNKNOWNW",
}

const unknownLabel = "unknown";

export type LabelsConfig = {
  short: string;
  full: string;
};

export type ColorsConfig = {
  color?: string;
};
export type MainIconConfig = {
  MainIcon: CustomSvgIconComponent | SvgIconComponent;
};

export type IconsConfig = MainIconConfig & {
  FullIcon: CustomSvgIconComponent | SvgIconComponent;
  GreyIcon: CustomSvgIconComponent | SvgIconComponent;
};

export type CurrencyConfig = LabelsConfig &
  ColorsConfig &
  IconsConfig & {
    symbol: BridgeCurrency;
    sourceChain: BridgeChain;
    rentxName: string;
    destinationChains?: Array<BridgeChain>;
    bandchainSymbol?: string;
  };

export const currenciesConfig: Record<BridgeCurrency, CurrencyConfig> = {
  [BridgeCurrency.BTC]: {
    symbol: BridgeCurrency.BTC,
    short: "BTC",
    full: "Bitcoin",
    color: bitcoinOrange,
    FullIcon: BtcFullIcon,
    GreyIcon: BtcGreyIcon,
    MainIcon: BtcFullIcon,
    rentxName: "btc",
    sourceChain: BridgeChain.BTCC,
  },
  [BridgeCurrency.RENBTC]: {
    symbol: BridgeCurrency.RENBTC,
    short: "renBTC",
    full: "Bitcoin",
    FullIcon: BtcFullIcon,
    GreyIcon: BtcGreyIcon,
    MainIcon: BtcGreyIcon,
    rentxName: "renBTC",
    sourceChain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.BTC,
  },
  [BridgeCurrency.BCH]: {
    symbol: BridgeCurrency.BCH,
    short: "BCH",
    full: "Bitcoin Cash",
    FullIcon: BchFullIcon,
    GreyIcon: BchGreyIcon,
    MainIcon: BchFullIcon,
    sourceChain: BridgeChain.BCHC,
    rentxName: "bitcoinCash",
  },
  [BridgeCurrency.RENBCH]: {
    symbol: BridgeCurrency.RENBCH,
    short: "renBCH",
    full: "Bitcoin Cash",
    FullIcon: BchFullIcon,
    GreyIcon: BchGreyIcon,
    MainIcon: BtcFullIcon,
    rentxName: "renBCH",
    sourceChain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.BCH,
  },
  [BridgeCurrency.DOTS]: {
    symbol: BridgeCurrency.DOTS,
    short: "DOTS",
    full: "Polkadot",
    FullIcon: DotsFullIcon,
    GreyIcon: DotsGreyIcon,
    MainIcon: DotsFullIcon,
    sourceChain: BridgeChain.UNKNOWNC, // TODO:
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
    sourceChain: BridgeChain.DOGC,
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
    sourceChain: BridgeChain.ETHC,
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
    sourceChain: BridgeChain.ZECC,
  },
  [BridgeCurrency.RENZEC]: {
    symbol: BridgeCurrency.RENZEC,
    short: "renZEC",
    full: "Zcash",
    FullIcon: ZecFullIcon,
    GreyIcon: ZecGreyIcon,
    MainIcon: ZecGreyIcon,
    rentxName: "renZEC",
    sourceChain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.ZEC,
  },
  [BridgeCurrency.DGB]: {
    symbol: BridgeCurrency.DGB,
    short: "DGB",
    full: "DigiByte",
    FullIcon: DgbFullIcon,
    GreyIcon: DgbGreyIcon,
    MainIcon: DgbFullIcon,
    sourceChain: BridgeChain.UNKNOWNC, // TODO:
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
    sourceChain: BridgeChain.ETHC,
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
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.BNB]: {
    symbol: BridgeCurrency.BNB,
    short: "BNB",
    full: "Binance Coin",
    FullIcon: EthereumIcon,
    GreyIcon: NotSetIcon,
    MainIcon: BtcFullIcon,
    rentxName: "eth",
    sourceChain: BridgeChain.ETHC,
  },
  [BridgeCurrency.UNKNOWN]: {
    symbol: BridgeCurrency.UNKNOWN,
    short: "UNKNOWN",
    full: "Unknown",
    FullIcon: NotSetIcon,
    GreyIcon: NotSetIcon,
    MainIcon: NotSetIcon,
    rentxName: "unknown",
    sourceChain: BridgeChain.UNKNOWNC,
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
  currenciesConfig[symbol].sourceChain || BridgeChain.UNKNOWNC;

export const getCurrencyRentxSourceChain = (symbol: BridgeCurrency) => {
  const bridgeChain = getCurrencySourceChain(symbol);
  if (bridgeChain) {
    return getChainRentxName(bridgeChain);
  }
  return BridgeChain.UNKNOWNC;
};

export type BridgeChainConfig = LabelsConfig &
  IconsConfig & {
    symbol: BridgeChain;
    rentxName: RenChain;
    blockTime: number;
    nativeCurrency: BridgeCurrency;
    targetConfirmations?: number;
  };

// TODO: add confirmations from https://support.kraken.com/hc/en-us/articles/203325283-Cryptocurrency-deposit-processing-times
export const chainsConfig: Record<BridgeChain, BridgeChainConfig> = {
  [BridgeChain.BTCC]: {
    symbol: BridgeChain.BTCC,
    short: "BTC",
    full: "Bitcoin",
    FullIcon: NotSetIcon,
    MainIcon: BitcoinIcon,
    GreyIcon: NotSetIcon,
    rentxName: RenChain.bitcoin,
    blockTime: 10,
    nativeCurrency: BridgeCurrency.BTC,
    targetConfirmations: 6,
  },
  [BridgeChain.BCHC]: {
    symbol: BridgeChain.BCHC,
    short: "BCH",
    full: "Bitcoin Cash",
    FullIcon: BchFullIcon,
    GreyIcon: BchGreyIcon,
    MainIcon: BchFullIcon,
    rentxName: RenChain.bitcoinCash,
    blockTime: 10,
    nativeCurrency: BridgeCurrency.BCH,
    targetConfirmations: 6,
  },
  [BridgeChain.ZECC]: {
    symbol: BridgeChain.ZECC,
    short: "ZEC",
    full: "Zcash",
    FullIcon: ZecFullIcon,
    GreyIcon: ZecGreyIcon,
    MainIcon: ZecFullIcon,
    rentxName: RenChain.zcash,
    blockTime: 2.5,
    nativeCurrency: BridgeCurrency.ZEC,
  },
  [BridgeChain.DOGC]: {
    symbol: BridgeChain.DOGC,
    short: "DOGE",
    full: "Dogecoin Chain",
    FullIcon: DogeFullIcon,
    GreyIcon: DogeGreyIcon,
    MainIcon: DogeFullIcon,
    rentxName: RenChain.dogecoin,
    blockTime: 1,
    nativeCurrency: BridgeCurrency.DOGE,
  },
  [BridgeChain.BSCC]: {
    symbol: BridgeChain.BSCC,
    short: "BSC",
    full: "Binance Smart Chain",
    FullIcon: BinanceChainFullIcon,
    MainIcon: BinanceChainFullIcon,
    GreyIcon: NotSetIcon,
    rentxName: RenChain.binanceSmartChain,
    blockTime: 3,
    nativeCurrency: BridgeCurrency.BNB,
  },
  [BridgeChain.ETHC]: {
    symbol: BridgeChain.ETHC,
    short: "ETH",
    full: "Ethereum",
    FullIcon: EthereumChainFullIcon,
    MainIcon: EthereumChainFullIcon,
    GreyIcon: NotSetIcon,
    rentxName: RenChain.ethereum,
    blockTime: 0.25,
    nativeCurrency: BridgeCurrency.ETH,
  },
  [BridgeChain.UNKNOWNC]: {
    symbol: BridgeChain.UNKNOWNC,
    short: "UNKNOWNC",
    full: "Unknown",
    FullIcon: NotSetIcon,
    GreyIcon: NotSetIcon,
    MainIcon: NotSetIcon,
    rentxName: RenChain.unknown,
    blockTime: 1e6,
    nativeCurrency: BridgeCurrency.UNKNOWN,
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

type NetworkConfig = LabelsConfig & {
  rentxName: string;
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

export const supportedRenNetworks = [
  RenNetwork.Mainnet,
  RenNetwork.Testnet,
  // RenNetwork.TestnetVDot3,
];

export const supportedLockCurrencies = [
  BridgeCurrency.BTC,
  BridgeCurrency.BCH,
  BridgeCurrency.DOGE,
  BridgeCurrency.ZEC,
];

export const supportedMintDestinationChains = [
  BridgeChain.ETHC,
  BridgeChain.BSCC,
];

export const supportedBurnChains = [BridgeChain.ETHC, BridgeChain.BSCC];

export const supportedReleaseCurrencies = [
  BridgeCurrency.RENBTC,
  BridgeCurrency.RENBCH,
  BridgeCurrency.RENDOGE,
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

export type BridgeWalletConfig = LabelsConfig &
  ColorsConfig &
  MainIconConfig & {
    rentxName: string;
    symbol: BridgeWallet;
    chain: BridgeChain;
  };

export const walletsConfig: Record<BridgeWallet, BridgeWalletConfig> = {
  [BridgeWallet.METAMASKW]: {
    symbol: BridgeWallet.METAMASKW,
    short: "MetaMask",
    full: "MetaMask Wallet",
    MainIcon: MetamaskFullIcon,
    chain: BridgeChain.ETHC,
    rentxName: "metamask",
  },
  [BridgeWallet.WALLETCONNECTW]: {
    symbol: BridgeWallet.METAMASKW,
    short: "MetaMask",
    full: "MetaMask Wallet",
    MainIcon: WalletConnectFullIcon,
    chain: BridgeChain.ETHC,
    rentxName: "walletconnect",
  },
  [BridgeWallet.BINANCESMARTCHAINW]: {
    symbol: BridgeWallet.METAMASKW,
    short: "Binance Chain Wallet",
    full: "Binance Chain Wallet",
    MainIcon: BinanceChainFullIcon,
    chain: BridgeChain.BSCC,
    rentxName: "binanceSmartChain",
  },
  [BridgeWallet.UNKNOWNW]: {
    symbol: BridgeWallet.UNKNOWNW,
    short: "Unknown",
    full: "Unknown Wallet",
    MainIcon: NotSetIcon,
    chain: BridgeChain.UNKNOWNC,
    rentxName: "unknown",
  },
};

const unknownWalletConfig = walletsConfig[BridgeWallet.UNKNOWNW];

export const getWalletConfig = (symbol: BridgeWallet) =>
  walletsConfig[symbol] || unknownWalletConfig;

export const getWalletConfigByRentxName = (name: string) =>
  Object.values(walletsConfig).find((wallet) => wallet.rentxName === name) ||
  unknownWalletConfig;
