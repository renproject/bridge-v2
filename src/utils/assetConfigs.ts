import { SvgIconComponent } from "@material-ui/icons";
import { RenNetwork } from "@renproject/interfaces";
import {
  AvaCircleIcon,
  AvaFullIcon,
  AvaGreyIcon,
  AvaIcon,
  BchFullIcon,
  BchGreyIcon,
  BchIcon,
  BinanceChainFullIcon,
  BinanceChainIcon,
  BitcoinIcon,
  BtcFullIcon,
  BtcGreyIcon,
  BtcIcon,
  CustomSvgIconComponent,
  DgbFullIcon,
  DgbGreyIcon,
  DgbIcon,
  DogeFullIcon,
  DogeGreyIcon,
  DogeIcon,
  DotsFullIcon,
  DotsGreyIcon,
  DotsIcon,
  EthereumChainFullIcon,
  EthereumIcon,
  FantomCircleIcon,
  FantomFullIcon,
  FantomGreyIcon,
  MetamaskFullIcon,
  MewFullIcon,
  PolygonCircleIcon,
  PolygonFullIcon,
  PolygonGreyIcon,
  TooltipIcon as NotSetIcon,
  WalletConnectFullIcon,
  ZecFullIcon,
  ZecGreyIcon,
  ZecIcon,
} from "../components/icons/RenIcons";
import * as customColors from "../theme/colors";

// TODO: replace everywhere
export enum RenChain {
  avalanche = "avalanche",
  binanceSmartChain = "binanceSmartChain",
  ethereum = "ethereum",
  fantom = "fantom",
  polygon = "polygon",
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
  FTM = "FTM",
  MATIC = "MATIC",
  BNB = "BNB",
  AVAX = "AVAX",
  UNKNOWN = "UNKNOWN",
}

export enum BridgeChain {
  BTCC = "BTCC",
  BCHC = "BCHC",
  ZECC = "ZECC",
  DOGC = "DOGC",
  BSCC = "BSCC",
  ETHC = "ETHC",
  MATICC = "MATICC",
  FTMC = "FTMC",
  AVAXC = "AVAXC",
  UNKNOWNC = "UNKNOWNC",
}

export enum BridgeNetwork {
  MAINNET = "MAINNET",
  TESTNET = "TESTNET",
  UNKNOWN = "UNKNOWN",
}

export enum EthTestnet {
  KOVAN = "Kovan",
  RINKEBY = "Rinkeby",
  UNKNOWNT = "Unknown",
}

export enum BridgeWallet {
  METAMASKW = "METAMASKW",
  WALLETCONNECTW = "WALLETCONNECTW",
  MEWCONNECTW = "MEWCONNECTW",
  BINANCESMARTW = "BINANCESMARTW",
  UNKNOWNW = "UNKNOWNW",
}

export type NetworkMapping = {
  testnet: RenNetwork;
  mainnet: RenNetwork;
};

export type ChainToNetworkMappings = Record<
  RenChain.ethereum | RenChain.binanceSmartChain | string,
  NetworkMapping
>;

const unknownLabel = "unknown";

export type LabelsConfig = {
  short: string;
  full: string;
};

export type ColorsConfig = {
  color?: string;
};
export type MainIconConfig = {
  Icon: CustomSvgIconComponent | SvgIconComponent;
  MainIcon: CustomSvgIconComponent | SvgIconComponent;
};

export type IconsConfig = MainIconConfig & {
  FullIcon: CustomSvgIconComponent | SvgIconComponent;
  GreyIcon: CustomSvgIconComponent | SvgIconComponent;
};

export type BridgeCurrencyConfig = LabelsConfig &
  ColorsConfig &
  IconsConfig & {
    symbol: BridgeCurrency;
    sourceChain: BridgeChain;
    rentxName: string;
    destinationChains?: Array<BridgeChain>;
    bandchainSymbol?: string;
    networkMappings: ChainToNetworkMappings;
    ethTestnet?: EthTestnet | null;
  };

const networkMappingLegacy: NetworkMapping = {
  mainnet: RenNetwork.Mainnet,
  testnet: RenNetwork.Testnet,
};

const networkMappingVDot3: NetworkMapping = {
  mainnet: RenNetwork.MainnetVDot3,
  testnet: RenNetwork.TestnetVDot3,
};

const oldNetworkMappings: ChainToNetworkMappings = {
  [RenChain.ethereum]: networkMappingLegacy,
  // BinanceSmartChain only has 1 network for testnet/mainnet
  // so vDot3 is equavelent to "legacy" mappings
  [RenChain.binanceSmartChain]: networkMappingLegacy,
  [RenChain.fantom]: networkMappingLegacy,
  [RenChain.polygon]: networkMappingLegacy,
  [RenChain.avalanche]: networkMappingLegacy,
};

const newNetworkMappings: ChainToNetworkMappings = {
  [RenChain.ethereum]: networkMappingVDot3,
  // BinanceSmartChain only has 1 network for testnet/mainnet
  // so vDot3 is equavelent to "legacy" mappings
  [RenChain.binanceSmartChain]: networkMappingLegacy,
  [RenChain.fantom]: networkMappingLegacy,
  [RenChain.polygon]: networkMappingLegacy,
  [RenChain.avalanche]: networkMappingLegacy,
};

export const currenciesConfig: Record<BridgeCurrency, BridgeCurrencyConfig> = {
  [BridgeCurrency.BTC]: {
    symbol: BridgeCurrency.BTC,
    short: "BTC",
    full: "Bitcoin",
    color: customColors.bitcoinOrange,
    FullIcon: BtcFullIcon,
    GreyIcon: BtcGreyIcon,
    Icon: BtcIcon,
    MainIcon: BtcFullIcon,
    rentxName: "btc",
    sourceChain: BridgeChain.BTCC,
    networkMappings: oldNetworkMappings,
  },
  [BridgeCurrency.RENBTC]: {
    symbol: BridgeCurrency.RENBTC,
    short: "renBTC",
    full: "Ren Bitcoin",
    FullIcon: BtcFullIcon,
    GreyIcon: BtcGreyIcon,
    Icon: BtcIcon,
    MainIcon: BtcGreyIcon,
    rentxName: "renBTC",
    sourceChain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.BTC,
    networkMappings: oldNetworkMappings,
  },
  [BridgeCurrency.BCH]: {
    symbol: BridgeCurrency.BCH,
    short: "BCH",
    full: "Bitcoin Cash",
    color: customColors.bitcoinCashGreen,
    FullIcon: BchFullIcon,
    GreyIcon: BchGreyIcon,
    Icon: BchIcon,
    MainIcon: BchFullIcon,
    rentxName: "BCH",
    sourceChain: BridgeChain.BCHC,
    networkMappings: oldNetworkMappings,
  },
  [BridgeCurrency.RENBCH]: {
    symbol: BridgeCurrency.RENBCH,
    short: "renBCH",
    full: "Bitcoin Cash",
    FullIcon: BchFullIcon,
    GreyIcon: BchGreyIcon,
    Icon: BchIcon,
    MainIcon: BchGreyIcon,
    rentxName: "renBCH",
    sourceChain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.BCH,
    networkMappings: oldNetworkMappings,
  },
  [BridgeCurrency.DOTS]: {
    symbol: BridgeCurrency.DOTS,
    short: "DOTS",
    full: "Polkadot",
    FullIcon: DotsFullIcon,
    GreyIcon: DotsGreyIcon,
    Icon: DotsIcon,
    MainIcon: DotsFullIcon,
    sourceChain: BridgeChain.UNKNOWNC, // TODO:
    rentxName: "dots",
    bandchainSymbol: "DOT",
    networkMappings: newNetworkMappings,
  },
  [BridgeCurrency.DOGE]: {
    symbol: BridgeCurrency.DOGE,
    short: "DOGE",
    full: "Dogecoin",
    FullIcon: DogeFullIcon,
    GreyIcon: DogeGreyIcon,
    Icon: DogeIcon,
    MainIcon: DogeFullIcon,
    sourceChain: BridgeChain.DOGC,
    rentxName: "doge",
    networkMappings: newNetworkMappings,
  },
  [BridgeCurrency.RENDOGE]: {
    symbol: BridgeCurrency.RENDOGE,
    short: "renDOGE",
    full: "Dogecoin",
    FullIcon: DogeFullIcon,
    GreyIcon: DogeGreyIcon,
    Icon: DogeIcon,
    MainIcon: DogeGreyIcon,
    rentxName: "renDOGE",
    sourceChain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.DOGE,
    ethTestnet: EthTestnet.KOVAN,
    networkMappings: newNetworkMappings,
  },
  [BridgeCurrency.ZEC]: {
    symbol: BridgeCurrency.ZEC,
    short: "ZEC",
    full: "Zcash",
    FullIcon: ZecFullIcon,
    GreyIcon: ZecGreyIcon,
    Icon: ZecIcon,
    MainIcon: ZecFullIcon,
    rentxName: "zec",
    sourceChain: BridgeChain.ZECC,
    networkMappings: oldNetworkMappings,
  },
  [BridgeCurrency.RENZEC]: {
    symbol: BridgeCurrency.RENZEC,
    short: "renZEC",
    full: "Zcash",
    FullIcon: ZecFullIcon,
    GreyIcon: ZecGreyIcon,
    Icon: ZecIcon,
    MainIcon: ZecGreyIcon,
    rentxName: "renZEC",
    sourceChain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.ZEC,
    networkMappings: oldNetworkMappings,
  },
  [BridgeCurrency.DGB]: {
    symbol: BridgeCurrency.DGB,
    short: "DGB",
    full: "DigiByte",
    FullIcon: DgbFullIcon,
    GreyIcon: DgbGreyIcon,
    Icon: DgbIcon,
    MainIcon: DgbFullIcon,
    sourceChain: BridgeChain.UNKNOWNC, // TODO: add when supported
    rentxName: "DGB",
    networkMappings: newNetworkMappings,
  },
  [BridgeCurrency.RENDGB]: {
    symbol: BridgeCurrency.RENDGB,
    short: "renDGB",
    full: "DigiByte",
    FullIcon: DgbFullIcon,
    GreyIcon: DgbGreyIcon,
    Icon: DgbIcon,
    MainIcon: DgbGreyIcon,
    rentxName: "renDGB",
    sourceChain: BridgeChain.ETHC,
    bandchainSymbol: BridgeCurrency.DGB,
    networkMappings: newNetworkMappings,
  },
  [BridgeCurrency.ETH]: {
    symbol: BridgeCurrency.ETH,
    short: "ETH",
    full: "Ether",
    FullIcon: EthereumIcon,
    GreyIcon: NotSetIcon,
    Icon: EthereumIcon,
    MainIcon: BtcFullIcon,
    rentxName: "eth",
    sourceChain: BridgeChain.ETHC,
    networkMappings: newNetworkMappings,
  },
  [BridgeCurrency.AVAX]: {
    symbol: BridgeCurrency.AVAX,
    short: "AVAX",
    full: "Avaer",
    FullIcon: AvaIcon,
    GreyIcon: NotSetIcon,
    Icon: AvaIcon,
    MainIcon: AvaFullIcon,
    rentxName: "ava",
    sourceChain: BridgeChain.AVAXC,
    networkMappings: newNetworkMappings,
  },
  [BridgeCurrency.MATIC]: {
    symbol: BridgeCurrency.MATIC,
    short: "MATIC",
    full: "Matic",
    FullIcon: PolygonFullIcon,
    GreyIcon: NotSetIcon,
    Icon: PolygonFullIcon,
    MainIcon: PolygonFullIcon,
    rentxName: "matic",
    sourceChain: BridgeChain.MATICC,
    networkMappings: newNetworkMappings,
  },
  [BridgeCurrency.FTM]: {
    symbol: BridgeCurrency.FTM,
    short: "FTM",
    full: "Fantom",
    FullIcon: FantomFullIcon,
    GreyIcon: NotSetIcon,
    Icon: FantomFullIcon,
    MainIcon: BtcFullIcon,
    rentxName: "ftm",
    sourceChain: BridgeChain.FTMC,
    networkMappings: newNetworkMappings,
  },
  [BridgeCurrency.ETH]: {
    symbol: BridgeCurrency.ETH,
    short: "ETH",
    full: "Ether",
    FullIcon: EthereumIcon,
    GreyIcon: NotSetIcon,
    Icon: EthereumIcon,
    MainIcon: BtcFullIcon,
    rentxName: "eth",
    sourceChain: BridgeChain.ETHC,
    networkMappings: newNetworkMappings,
  },
  [BridgeCurrency.BNB]: {
    symbol: BridgeCurrency.BNB,
    short: "BNB",
    full: "Binance Coin",
    FullIcon: EthereumIcon,
    GreyIcon: NotSetIcon,
    Icon: EthereumIcon,
    MainIcon: BtcFullIcon,
    rentxName: "eth",
    sourceChain: BridgeChain.ETHC,
    networkMappings: newNetworkMappings,
  },
  [BridgeCurrency.UNKNOWN]: {
    symbol: BridgeCurrency.UNKNOWN,
    short: "UNKNOWN",
    full: "Unknown",
    FullIcon: NotSetIcon,
    GreyIcon: NotSetIcon,
    Icon: NotSetIcon,
    MainIcon: NotSetIcon,
    rentxName: "unknown",
    sourceChain: BridgeChain.UNKNOWNC,
    networkMappings: newNetworkMappings,
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
    targetConfirmations: number;
  };

export const chainsConfig: Record<BridgeChain, BridgeChainConfig> = {
  [BridgeChain.BTCC]: {
    symbol: BridgeChain.BTCC,
    short: "BTC",
    full: "Bitcoin",
    FullIcon: NotSetIcon,
    Icon: BitcoinIcon,
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
    Icon: BchIcon,
    MainIcon: BchFullIcon,
    rentxName: RenChain.bitcoinCash,
    blockTime: 10,
    targetConfirmations: 6,
    nativeCurrency: BridgeCurrency.BCH,
  },
  [BridgeChain.ZECC]: {
    symbol: BridgeChain.ZECC,
    short: "ZEC",
    full: "Zcash",
    FullIcon: ZecFullIcon,
    GreyIcon: ZecGreyIcon,
    Icon: ZecIcon,
    MainIcon: ZecFullIcon,
    rentxName: RenChain.zcash,
    blockTime: 2.5,
    nativeCurrency: BridgeCurrency.ZEC,
    targetConfirmations: 24,
  },
  [BridgeChain.DOGC]: {
    symbol: BridgeChain.DOGC,
    short: "DOGE",
    full: "Dogecoin",
    FullIcon: DogeFullIcon,
    GreyIcon: DogeGreyIcon,
    Icon: DogeIcon,
    MainIcon: DogeFullIcon,
    rentxName: RenChain.dogecoin,
    blockTime: 1,
    targetConfirmations: 40,
    nativeCurrency: BridgeCurrency.DOGE,
  },
  [BridgeChain.BSCC]: {
    symbol: BridgeChain.BSCC,
    short: "BSC",
    full: "Binance Smart Chain",
    FullIcon: BinanceChainFullIcon,
    Icon: BinanceChainIcon,
    MainIcon: BinanceChainFullIcon,
    GreyIcon: NotSetIcon,
    rentxName: RenChain.binanceSmartChain,
    blockTime: 3,
    targetConfirmations: 30,
    nativeCurrency: BridgeCurrency.BNB,
  },
  [BridgeChain.FTMC]: {
    symbol: BridgeChain.FTMC,
    short: "FTM",
    full: "Fantom",
    FullIcon: FantomCircleIcon,
    Icon: FantomGreyIcon,
    MainIcon: FantomCircleIcon,
    GreyIcon: NotSetIcon,
    rentxName: RenChain.fantom,
    blockTime: 3,
    targetConfirmations: 30,
    nativeCurrency: BridgeCurrency.FTM,
  },
  [BridgeChain.MATICC]: {
    symbol: BridgeChain.MATICC,
    short: "MATIC",
    full: "Polygon",
    FullIcon: PolygonCircleIcon,
    Icon: PolygonGreyIcon,
    MainIcon: PolygonCircleIcon,
    GreyIcon: NotSetIcon,
    rentxName: RenChain.polygon,
    blockTime: 3,
    targetConfirmations: 30,
    nativeCurrency: BridgeCurrency.MATIC,
  },
  [BridgeChain.AVAXC]: {
    symbol: BridgeChain.AVAXC,
    short: "AVAX",
    full: "Avalanche",
    FullIcon: AvaCircleIcon,
    Icon: AvaGreyIcon,
    MainIcon: AvaCircleIcon,
    GreyIcon: NotSetIcon,
    rentxName: RenChain.avalanche,
    blockTime: 3,
    targetConfirmations: 30,
    nativeCurrency: BridgeCurrency.AVAX,
  },
  [BridgeChain.ETHC]: {
    symbol: BridgeChain.ETHC,
    short: "ETH",
    full: "Ethereum",
    FullIcon: EthereumChainFullIcon,
    Icon: EthereumIcon,
    MainIcon: EthereumChainFullIcon,
    GreyIcon: NotSetIcon,
    rentxName: RenChain.ethereum,
    blockTime: 0.25,
    targetConfirmations: 30,
    nativeCurrency: BridgeCurrency.ETH,
  },
  [BridgeChain.UNKNOWNC]: {
    symbol: BridgeChain.UNKNOWNC,
    short: "UNKNOWNC",
    full: "Unknown",
    FullIcon: NotSetIcon,
    GreyIcon: NotSetIcon,
    Icon: NotSetIcon,
    MainIcon: NotSetIcon,
    rentxName: RenChain.unknown,
    blockTime: 1e6,
    targetConfirmations: 1e6,
    nativeCurrency: BridgeCurrency.UNKNOWN,
  },
};

const unknownChainConfig = chainsConfig[BridgeChain.UNKNOWNC];

export const getChainConfig = (symbol: BridgeChain) =>
  chainsConfig[symbol] || unknownChainConfig;

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
    rentxName: RenNetwork.Mainnet,
  },
  [BridgeNetwork.TESTNET]: {
    symbol: BridgeNetwork.TESTNET,
    short: "TESTNET",
    full: "Testnet",
    rentxName: RenNetwork.Testnet,
  },
  [BridgeNetwork.UNKNOWN]: {
    symbol: BridgeNetwork.UNKNOWN,
    short: "UNKNOWN",
    full: "Unknown",
    rentxName: "unknown",
  },
};

const unknownNetworkConfig = networksConfig[BridgeNetwork.UNKNOWN];

export const isTestnetNetwork = (name: string) => name.indexOf("testnet") > -1;

export const isMainnetNetwork = (name: string) => name.indexOf("mainnet") > -1;

export const getNetworkConfigByRentxName = (name: string) => {
  if (isTestnetNetwork(name)) {
    return networksConfig[BridgeNetwork.TESTNET];
  }
  if (isMainnetNetwork(name)) {
    return networksConfig[BridgeNetwork.MAINNET];
  }
  return (
    Object.values(networksConfig).find(
      (network) => network.rentxName === name
    ) || unknownNetworkConfig
  );
};

export const supportedLockCurrencies = [
  BridgeCurrency.BTC,
  BridgeCurrency.BCH,
  BridgeCurrency.DOGE,
  BridgeCurrency.ZEC,
];

export const supportedMintDestinationChains = [
  BridgeChain.ETHC,
  BridgeChain.BSCC,
  BridgeChain.MATICC,
  BridgeChain.FTMC,
  BridgeChain.AVAXC,
];

export const supportedBurnChains = [
  BridgeChain.ETHC,
  BridgeChain.BSCC,
  BridgeChain.MATICC,
  BridgeChain.FTMC,
  BridgeChain.AVAXC,
];

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
    Icon: NotSetIcon,
    MainIcon: MetamaskFullIcon,
    chain: BridgeChain.ETHC,
    rentxName: "Metamask",
  },
  [BridgeWallet.WALLETCONNECTW]: {
    symbol: BridgeWallet.WALLETCONNECTW,
    short: "MetaMask",
    full: "MetaMask Wallet",
    Icon: NotSetIcon,
    MainIcon: WalletConnectFullIcon,
    chain: BridgeChain.ETHC,
    rentxName: "walletconnect",
  },
  [BridgeWallet.BINANCESMARTW]: {
    symbol: BridgeWallet.BINANCESMARTW,
    short: "Binance Wallet",
    full: "Binance Chain Wallet",
    Icon: NotSetIcon,
    MainIcon: BinanceChainFullIcon,
    chain: BridgeChain.BSCC,
    rentxName: "BinanceSmartWallet",
  },
  [BridgeWallet.MEWCONNECTW]: {
    symbol: BridgeWallet.UNKNOWNW,
    short: "MEW",
    full: "MEW Wallet",
    Icon: NotSetIcon,
    MainIcon: MewFullIcon,
    chain: BridgeChain.ETHC,
    rentxName: "MEW",
  },
  [BridgeWallet.UNKNOWNW]: {
    symbol: BridgeWallet.UNKNOWNW,
    short: "Unknown",
    full: "Unknown Wallet",
    Icon: NotSetIcon,
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

// FIXME: hacky, lets not have two different enums for the same things (supported networks)
// Maybe we should raise the enum into ren-js, just like we have RenNetwork
export const bridgeChainToRenChain = (bridgeChain: BridgeChain): RenChain => {
  switch (bridgeChain) {
    case BridgeChain.ETHC:
      return RenChain.ethereum;
    case BridgeChain.BSCC:
      return RenChain.binanceSmartChain;
    case BridgeChain.FTMC:
      return RenChain.fantom;
    case BridgeChain.MATICC:
      return RenChain.polygon;
    default:
      return RenChain.unknown;
  }
};
