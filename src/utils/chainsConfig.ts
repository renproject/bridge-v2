import { Asset, Chain, chains } from "@renproject/chains";
import {
  ArbitrumCircleIcon,
  AvalancheChainCircleIcon,
  BchFullIcon,
  BinanceChainFullIcon,
  BitcoinIcon,
  CustomSvgIconComponent,
  EmptyCircleIcon,
  EthereumChainFullIcon,
  FantomCircleIcon,
  PolygonFullIcon,
  ZecIcon,
} from "../components/icons/RenIcons";
import { AssetChainsConfig } from "./tokensConfig";

export type ChainIconsConfig = {
  Icon: CustomSvgIconComponent;
};

export type ChainLabelsConfig = {
  fullName: string;
};

type ChainBaseConfig = ChainIconsConfig & ChainLabelsConfig & {};

const unsetChainConfig: ChainBaseConfig = {
  Icon: EmptyCircleIcon,
  fullName: "Unset full name",
};

const chainsBaseConfig: Record<Chain, ChainBaseConfig> = {
  Arbitrum: {
    Icon: ArbitrumCircleIcon,
    fullName: "Arbitrum",
  },
  Avalanche: {
    Icon: AvalancheChainCircleIcon,
    fullName: "Avalanche",
  },
  BinanceSmartChain: {
    Icon: BinanceChainFullIcon,
    fullName: "Binance Smarct Chain",
  },
  Bitcoin: {
    Icon: BitcoinIcon,
    fullName: "Bitcoin",
  },
  BitcoinCash: {
    Icon: BchFullIcon,
    fullName: "Bitcoin Cash",
  },
  Dogecoin: unsetChainConfig,
  Ethereum: {
    Icon: EthereumChainFullIcon,
    fullName: "Ethereum",
  },
  Fantom: {
    Icon: FantomCircleIcon,
    fullName: "Fantom",
  },
  Polygon: {
    Icon: PolygonFullIcon,
    fullName: "Polygon",
  },
  Zcash: { Icon: ZecIcon, fullName: "Zcash" },
  DigiByte: unsetChainConfig,
  Filecoin: unsetChainConfig,
  Goerli: unsetChainConfig,
  Terra: unsetChainConfig,
};

export const chainsConfig = chainsBaseConfig;

export const getChainConfig = (chain: Chain) => {
  const config = chainsConfig[chain];
  if (!config) {
    throw new Error(`Chain config not found for ${chain}`);
  }
  return config;
};

type AssetChainsData = AssetChainsConfig & {
  asset: Asset;
};

const mintChains: Array<Chain> = [
  Chain.Ethereum,
  Chain.BinanceSmartChain,
  Chain.Polygon,
  Chain.Fantom,
  Chain.Avalanche,
  Chain.Arbitrum,
];

export const assetChainsArray = Object.values(chains).reduce(
  (acc, chain) => [
    ...acc,
    ...Object.values(chain.assets).map((asset) => ({
      asset: asset as Asset,
      lockChain: chain.chain as Chain,
      mintChains: mintChains.filter((mintChain) => mintChain !== chain.chain),
    })),
  ],
  [] as Array<AssetChainsData>
);

export const getAssetChainsConfig = (asset: Asset) => {
  const info = assetChainsArray.find((entry) => entry.asset === asset);
  if (!info) {
    throw new Error(`Chain mapping for ${asset} not found.`);
  }
  return {
    lockChain: info.lockChain,
    mintChains: info.mintChains,
  } as AssetChainsConfig;
};

export const supportedBitcoinChains: Array<Chain> = [
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Dogecoin,
  Chain.Zcash,
];

export const supportedEthereumChains: Array<Chain> = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.BinanceSmartChain,
  Chain.Ethereum,
  Chain.Fantom,
  Chain.Polygon,
];
