import { Asset, Chain } from "@renproject/chains";
import {
  BchFullIcon,
  BtcFullIcon,
  BtcIcon,
  CustomSvgIconComponent,
  EmptyCircleIcon,
  ZecFullIcon,
} from "../components/icons/RenIcons";
import { env } from "../constants/environmentVariables";
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
  shortName: "???",
  fullName: "Unset full name",
};

const assetsBaseConfig: Record<Asset, AssetBaseConfig> = {
  AVAX: unsetAssetConfig,
  ArbETH: unsetAssetConfig,
  BADGER: unsetAssetConfig,
  BCH: {
    Icon: BchFullIcon,
    shortName: "BCH",
    fullName: "Bitcoin Cash",
  },
  BNB: unsetAssetConfig,
  BTC: {
    Icon: BtcFullIcon,
    shortName: "BTC",
    fullName: "Bitcoin",
  },
  BUSD: unsetAssetConfig,
  CRV: unsetAssetConfig,
  DAI: {
    Icon: EmptyCircleIcon,
    shortName: "DAI",
    fullName: "Dai",
  },
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
  ZEC: {
    Icon: ZecFullIcon,
    shortName: "ZEC",
    fullName: "Zcash",
  },
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

console.log("assetsConfig", assetsConfig);

export const getAssetConfig = (asset: Asset) => {
  const config = assetsConfig[asset];
  if (!config) {
    throw new Error(`Asset config not found for ${asset}`);
  }
  return config;
};

export const supportedLockAssets =
  env.ENABLED_ASSETS[0] === "*"
    ? [
        Asset.BTC,
        Asset.BCH,
        // Asset.DGB,
        // Asset.DOGE,
        // Asset.FIL,
        // Asset.LUNA,
        Asset.ZEC,
        Asset.DAI,
      ]
    : env.ENABLED_ASSETS.filter((x) => {
        const included = Object.keys(assetsConfig).includes(x);
        if (!included) {
          console.error("Unknown asset:", x);
        }
        return included;
      }).map((x) => x as Asset);
