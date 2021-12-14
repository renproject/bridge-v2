import { Asset, Chain } from "@renproject/chains";
import {
  BtcIcon,
  CustomSvgIconComponent,
  EmptyCircleIcon,
} from "../components/icons/RenIcons";
import { getAssetChainsConfig } from "./chainsConfig";

export type AssetIconsConfig = {
  Icon: CustomSvgIconComponent;
};

export type AssetLabelsConfig = {
  shortName: string;
  fullName: string;
};

// export type AssetChainConfig = {
//   sourceChain: string;
// };

export type MarketDataConfig = {
  bandchainSymbol?: string;
  coingeckoSymbol?: string;
};

type AssetBaseConfig = AssetIconsConfig & AssetLabelsConfig & {};

const unsetAssetConfig: AssetBaseConfig = {
  Icon: EmptyCircleIcon,
  shortName: "USN",
  fullName: "Unset full name",
};

const assetsBaseConfig: Record<Asset, AssetBaseConfig> = {
  AVAX: unsetAssetConfig,
  ArbETH: unsetAssetConfig,
  BADGER: unsetAssetConfig,
  BCH: unsetAssetConfig,
  BNB: unsetAssetConfig,
  BTC: {
    Icon: BtcIcon,
    shortName: "BTC",
    fullName: "Bitcoin",
  },
  BUSD: unsetAssetConfig,
  CRV: unsetAssetConfig,
  DAI: unsetAssetConfig,
  DGB: unsetAssetConfig,
  DOGE: unsetAssetConfig,
  ETH: unsetAssetConfig,
  EURT: unsetAssetConfig,
  FIL: unsetAssetConfig,
  FTM: unsetAssetConfig,
  FTT: unsetAssetConfig,
  KNC: unsetAssetConfig,
  LINK: unsetAssetConfig,
  LUNA: unsetAssetConfig,
  MATIC: unsetAssetConfig,
  MIM: unsetAssetConfig,
  REN: unsetAssetConfig,
  ROOK: unsetAssetConfig,
  SUSHI: unsetAssetConfig,
  UNI: unsetAssetConfig,
  USDC: unsetAssetConfig,
  USDT: unsetAssetConfig,
  ZEC: unsetAssetConfig,
  gETH: unsetAssetConfig,
};

export type AssetChainsConfig = {
  lockChain: Chain;
  mintChains: Array<Chain>;
};

export const assetsConfig = Object.fromEntries(
  Object.entries(assetsBaseConfig).map(([asset, config]) => [
    asset,
    {
      ...config,
      ...getAssetChainsConfig(asset as Asset),
    },
  ])
);

export const getAssetConfig = (asset: Asset) => {
  const config = assetsConfig[asset];
  if (!config) {
    throw new Error(`Asset config not found for ${asset}`);
  }
  return config;
};
