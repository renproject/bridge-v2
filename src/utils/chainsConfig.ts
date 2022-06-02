import { Asset, Chain, chains } from "@renproject/chains";
import {
  Arbitrum,
  Avalanche,
  Bch,
  BinanceSmartChain,
  Btc,
  chainsColors,
  Dgb,
  Doge,
  Ethereum,
  Fantom,
  Fil,
  Luna,
  Polygon,
  Solana,
  Zec,
} from "@renproject/icons";

import { RenNetwork } from "@renproject/utils";
import { chainIcon, chainIconFromToken } from "../components/icons/IconHelpers";
import { CustomSvgIconComponent } from "../components/icons/RenIcons";
import { AssetChainsConfig } from "./assetsConfig";
import {
  createNetworkConfig,
  createNetworksConfig,
  NetworkConfig,
  NetworksConfig,
} from "./networksConfig";

export type ChainIconsConfig = {
  Icon: CustomSvgIconComponent;
};

export type ChainLabelsConfig = {
  fullName: string;
  shortName: string;
};

export type ChainNetworksConfig = {
  networks?: NetworksConfig;
};

type ChainBaseConfig = ChainIconsConfig &
  ChainLabelsConfig &
  ChainNetworksConfig & {};

export type ChainColorConfig = {
  color: string;
};

export type ChainConfig = ChainBaseConfig & ChainColorConfig & {};

const chainsBaseConfig: Record<Chain, ChainBaseConfig> = {
  Arbitrum: {
    Icon: chainIcon(Arbitrum),
    fullName: "Arbitrum",
    shortName: "Arbitrum",
    networks: createNetworksConfig(42161, 421611),
  },
  Avalanche: {
    Icon: chainIcon(Avalanche),
    fullName: "Avalanche",
    shortName: "Avalanche",
    networks: createNetworksConfig(43114, 43113),
  },
  BinanceSmartChain: {
    Icon: chainIcon(BinanceSmartChain),
    fullName: "Binance Smart Chain",
    shortName: "BSC",
    networks: createNetworksConfig(56, 97),
  },
  Bitcoin: {
    Icon: chainIconFromToken(Btc),
    fullName: "Bitcoin",
    shortName: "Bitcoin",
  },
  BitcoinCash: {
    Icon: chainIconFromToken(Bch),
    fullName: "Bitcoin Cash",
    shortName: "Bitcoin Cash",
  },
  Dogecoin: {
    Icon: chainIconFromToken(Doge),
    fullName: "Dogecoin",
    shortName: "Dogecoin",
  },
  Ethereum: {
    Icon: chainIcon(Ethereum),
    fullName: "Ethereum",
    shortName: "Eth",
    networks: {
      ...createNetworkConfig(RenNetwork.Mainnet, 1),
      ...createNetworkConfig(RenNetwork.Testnet, 42, "Kovan Test Network"),
    },
  },
  Fantom: {
    Icon: chainIcon(Fantom),
    fullName: "Fantom",
    shortName: "Fantom",
    networks: createNetworksConfig(250, 4002),
  },
  Polygon: {
    Icon: chainIcon(Polygon),
    fullName: "Polygon",
    shortName: "Polygon",
    networks: createNetworksConfig(137, 80001),
  },
  Zcash: {
    Icon: chainIconFromToken(Zec),
    fullName: "Zcash",
    shortName: "Zcash",
  },
  DigiByte: {
    Icon: chainIconFromToken(Dgb),
    fullName: "DigiByte",
    shortName: "DigiByte",
  },
  Filecoin: {
    Icon: chainIconFromToken(Fil),
    fullName: "Filecoin",
    shortName: "Filecoin",
  },
  Terra: {
    Icon: chainIcon(Luna),
    fullName: "Terra",
    shortName: "Terra",
  },
  Solana: {
    Icon: chainIcon(Solana),
    fullName: "Solana",
    shortName: "Solana",
    networks: createNetworksConfig(1, 2, RenNetwork.Mainnet, RenNetwork.Devnet),
  },
  Goerli: {
    Icon: chainIcon(Ethereum),
    fullName: "Goerli Testnet",
    shortName: "Goerli",
    networks: createNetworksConfig(1, 5),
  },
};

const getChainColorConfig = (chain: Chain) => {
  const color = chainsColors[chain];
  return color.primary;
};

export const chainsConfig = Object.fromEntries(
  Object.entries(chainsBaseConfig).map(([chain, config]) => [
    chain,
    {
      ...config,
      color: getChainColorConfig(chain as Chain),
    },
  ])
) as Record<Chain, ChainConfig>;

export const getChainConfig = (chain: Chain | string) => {
  const config = chainsConfig[chain as Chain];
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

export const supportedDepositChains: Array<Chain> = [
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Dogecoin,
  Chain.Zcash,
  Chain.DigiByte,
  Chain.Terra,
  Chain.Filecoin,
];

export const isDepositBaseChain = (chain: Chain) =>
  supportedDepositChains.includes(chain);

export const supportedEthereumChains: Array<Chain> = [
  Chain.Ethereum,
  Chain.BinanceSmartChain,
  Chain.Fantom,
  // Chain.Goerli,
  Chain.Polygon,
  Chain.Avalanche,
  Chain.Arbitrum,
];

export const isEthereumBaseChain = (chain: Chain) =>
  supportedEthereumChains.includes(chain);

export const supportedSolanaChains: Array<Chain> = [Chain.Solana];

export const isSolanaBaseChain = (chain: Chain) =>
  supportedSolanaChains.includes(chain);

export const isContractBaseChain = (chain: Chain) => {
  return isEthereumBaseChain(chain) || isSolanaBaseChain(chain);
};

export const contractChains = [
  ...supportedEthereumChains,
  ...supportedSolanaChains,
];

const mintChains = [...supportedEthereumChains, ...supportedSolanaChains];

export const isChainConnectionRequired = (chain: Chain) =>
  contractChains.includes(chain);

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

export const getAssetChainsConfig = (asset: Asset, nullForNotFound = false) => {
  const info = assetChainsArray.find((entry) => entry.asset === asset);
  if (!info) {
    if (nullForNotFound) {
      return null;
    } else {
      throw new Error(`Chain mapping for ${asset} not found.`);
    }
  }
  return {
    lockChain: info.lockChain,
    mintChains: info.mintChains,
    lockChainConnectionRequired: info.lockChainConnectionRequired,
  } as AssetChainsConfig;
};

export const supportedContractChains = contractChains;

export const supportedAllChains = [
  ...supportedContractChains,
  ...supportedDepositChains,
];
