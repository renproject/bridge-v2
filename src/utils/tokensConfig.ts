import { Asset, Chain } from "@renproject/chains";
import {
  BchFullIcon,
  BtcFullIcon,
  BtcIcon,
  CustomSvgIconComponent,
  DogeFullIcon,
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

export enum AssetRateService {
  Bandchain = "Bandchain",
  Coingecko = "Coingecko",
}

export type AssetRateConfig = {
  rateService?: AssetRateService;
  rateSymbol?: string;
};

type AssetBaseConfig = AssetIconsConfig &
  AssetLabelsConfig &
  AssetRateConfig & {};

const unsetAssetConfig: AssetBaseConfig = {
  Icon: EmptyCircleIcon,
  shortName: "UNSET",
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
    rateService: AssetRateService.Bandchain,
  },
  BNB: unsetAssetConfig,
  BTC: {
    Icon: BtcFullIcon,
    shortName: "BTC",
    fullName: "Bitcoin",
    rateService: AssetRateService.Bandchain,
  },
  BUSD: unsetAssetConfig,
  CRV: unsetAssetConfig,
  DAI: {
    Icon: EmptyCircleIcon,
    shortName: "DAI",
    fullName: "Dai",
  },
  DGB: unsetAssetConfig,
  DOGE: {
    Icon: DogeFullIcon,
    shortName: "DOGE",
    fullName: "Dogecoin",
    rateService: AssetRateService.Bandchain,
  },
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

// TODO: invent naming similar to renJS, Noah
export const getRenAssetName = (asset: Asset) => `ren${asset}`; //or mint?
export const getLockAssetName = (renAsset: string) => {
  if (renAsset.indexOf("ren") !== 0) {
    throw new Error(`Unable to convert asset to origin (locked): ${renAsset}`);
  }
  return renAsset.substr(3);
};

export const supportedAssets =
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

console.log("supportedAssets", supportedAssets);
