import { Asset, Chain, chains } from "@renproject/chains";
import { RenNetwork } from "@renproject/utils";
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
import {
  createNetworkConfig,
  NetworkConfig,
  NetworksConfig,
} from "./networksConfig";
import { AssetChainsConfig } from "./tokensConfig";

export type ChainIconsConfig = {
  Icon: CustomSvgIconComponent;
};

export type ChainLabelsConfig = {
  fullName: string;
  shortName?: string;
};

export type ChainNetworksConfig = {
  networks?: NetworksConfig;
};

type ChainBaseConfig = ChainIconsConfig &
  ChainLabelsConfig &
  ChainNetworksConfig & {};

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
    networks: {
      ...createNetworkConfig(RenNetwork.Mainnet, 1),
      ...createNetworkConfig(RenNetwork.Testnet, 42, "Kovan Test Network"),
    },
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

export const getChainNetworks = (chain: Chain) => {
  const chainConfig = getChainConfig(chain);
  if (!chainConfig.networks) {
    throw new Error(`Chain networks config not found for ${chain}`);
  }
  return chainConfig.networks;
};

export const getChainNetworkConfig = (chain: Chain, network: RenNetwork) => {
  const networks = getChainNetworks(chain);
  if (!networks[network]) {
    throw new Error(`Network config incomplete for ${chain} ${network}`);
  }
  return networks[network] as NetworkConfig;
};

type AssetChainsData = AssetChainsConfig & {
  asset: Asset;
};
export const supportedBitcoinChains: Array<Chain> = [
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Dogecoin,
  Chain.Zcash,
];

export const supportedEthereumChains: Array<Chain> = [
  Chain.Ethereum,
  Chain.BinanceSmartChain,
  Chain.Polygon,
  Chain.Fantom,
  Chain.Avalanche,
  Chain.Arbitrum,
];

const mintChains = supportedEthereumChains;

export const isChainConnectionRequired = (chain: Chain) =>
  supportedEthereumChains.includes(chain);

export const assetChainsArray = Object.values(chains).reduce(
  (acc, chain) => [
    ...acc,
    ...Object.values(chain.assets).map((asset) => ({
      asset: asset as Asset,
      lockChain: chain.chain as Chain,
      mintChains: mintChains.filter((mintChain) => mintChain !== chain.chain),
      lockChainConnectionRequired: isChainConnectionRequired(
        chain.chain as Chain
      ),
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
    lockChainConnectionRequired: info.lockChainConnectionRequired,
  } as AssetChainsConfig;
};
