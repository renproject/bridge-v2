import { Asset, Chain, chains } from "@renproject/chains";
import {
  Arbitrum,
  Avalanche,
  Bch,
  BinanceSmartChain,
  Btc,
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
import {
  createNetworkConfig,
  createNetworksConfig,
  NetworkConfig,
  NetworksConfig,
} from "./networksConfig";
import { AssetChainsConfig } from "./assetsConfig";

export type ChainIconsConfig = {
  Icon: CustomSvgIconComponent;
};

export type ChainLabelsConfig = {
  fullName: string;
  shortName?: string; // TODO: make obligatory
};

export type ChainNetworksConfig = {
  networks?: NetworksConfig;
};

type ChainBaseConfig = ChainIconsConfig &
  ChainLabelsConfig &
  ChainNetworksConfig & {};

export type ChainConfig = ChainBaseConfig & {};

const chainsBaseConfig: Record<Chain, ChainConfig> = {
  Arbitrum: {
    Icon: chainIcon(Arbitrum),
    fullName: "Arbitrum",
    networks: createNetworksConfig(42161, 421611),
  },
  Avalanche: {
    Icon: chainIcon(Avalanche),
    fullName: "Avalanche",
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
  },
  BitcoinCash: {
    Icon: chainIconFromToken(Bch),
    fullName: "Bitcoin Cash",
  },
  Dogecoin: {
    Icon: chainIconFromToken(Doge),
    fullName: "Dogecoin",
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
    networks: createNetworksConfig(250, 4002),
  },
  Polygon: {
    Icon: chainIcon(Polygon),
    fullName: "Polygon",
    networks: createNetworksConfig(137, 80001),
  },
  Zcash: {
    Icon: chainIconFromToken(Zec),
    fullName: "Zcash",
  },
  DigiByte: {
    Icon: chainIconFromToken(Dgb),
    fullName: "DigiByte",
  },
  Filecoin: {
    Icon: chainIconFromToken(Fil),
    fullName: "Filecoin",
  },
  Goerli: {
    Icon: chainIcon(Ethereum),
    fullName: "Goerli Testnet",
    networks: createNetworksConfig(1, 5),
  },
  Terra: {
    Icon: chainIcon(Luna),
    fullName: "Terra",
  },
  Solana: {
    Icon: chainIcon(Solana),
    fullName: "Solana",
  },
};

export const chainsConfig = chainsBaseConfig;

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
export const supportedBitcoinChains: Array<Chain> = [
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Dogecoin,
  Chain.Zcash,
  Chain.DigiByte,
  Chain.Terra,
];

export const supportedEthereumChains: Array<Chain> = [
  Chain.Ethereum,
  Chain.BinanceSmartChain,
  Chain.Polygon,
  // Chain.Goerli,
  Chain.Fantom,
  Chain.Avalanche,
  Chain.Arbitrum,
];

export const supportedSolanaChains: Array<Chain> = [Chain.Solana];

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

export const supportedContractChains = contractChains;
