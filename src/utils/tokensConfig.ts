import { Asset, Chain } from "@renproject/chains";
import {
  Bch,
  Bnb,
  Btc,
  Dai,
  Doge,
  Eth,
  RenBch,
  RenBnb,
  RenBtc,
  RenDai,
  RenDoge,
  RenEth,
  RenZec,
  Zec,
} from "@renproject/icons";
import {
  nativeTokenIcon,
  wrappedTokenIcon,
} from "../components/icons/IconHelpers";
import {
  CustomSvgIconComponent,
  EmptyCircleIcon,
} from "../components/icons/RenIcons";

import { env } from "../constants/environmentVariables";
import { getAssetChainsConfig } from "./chainsConfig";

export type AssetIconsConfig = {
  Icon: CustomSvgIconComponent;
  RenIcon: CustomSvgIconComponent;
};

export type AssetLabelsConfig = {
  shortName: string;
  fullName: string;
};

export enum AssetRateService {
  Bandchain = "Bandchain",
  Coingecko = "Coingecko",
}

export type AssetColorsConfig = {
  color?: string;
};

export type AssetRateConfig = {
  rateService?: AssetRateService;
  rateSymbol?: string;
};

type AssetBaseConfig = AssetIconsConfig &
  AssetColorsConfig &
  AssetLabelsConfig &
  AssetRateConfig & {};

const unsetAssetConfig: AssetBaseConfig = {
  Icon: EmptyCircleIcon,
  RenIcon: EmptyCircleIcon,
  shortName: "UNSET",
  fullName: "Unset full name",
};

const assetsBaseConfig: Record<Asset, AssetBaseConfig> = {
  AVAX: unsetAssetConfig,
  ArbETH: unsetAssetConfig,
  BADGER: unsetAssetConfig,
  BCH: {
    Icon: nativeTokenIcon(Bch),
    RenIcon: wrappedTokenIcon(RenBch),
    shortName: "BCH",
    fullName: "Bitcoin Cash",
    rateService: AssetRateService.Bandchain,
  },
  BNB: {
    Icon: nativeTokenIcon(Bnb),
    RenIcon: wrappedTokenIcon(RenBnb),
    shortName: "BNB",
    fullName: "Binance Coin",
    rateService: AssetRateService.Bandchain,
  },
  BTC: {
    Icon: nativeTokenIcon(Btc),
    RenIcon: wrappedTokenIcon(RenBtc),
    shortName: "BTC",
    fullName: "Bitcoin",
    rateService: AssetRateService.Bandchain,
  },
  BUSD: unsetAssetConfig,
  CRV: unsetAssetConfig,
  DAI: {
    Icon: nativeTokenIcon(Dai),
    RenIcon: wrappedTokenIcon(RenDai),
    shortName: "DAI",
    fullName: "Dai",
  },
  DGB: unsetAssetConfig,
  DOGE: {
    Icon: nativeTokenIcon(Doge),
    RenIcon: wrappedTokenIcon(RenDoge),
    shortName: "DOGE",
    fullName: "Dogecoin",
    rateService: AssetRateService.Bandchain,
  },
  ETH: {
    Icon: nativeTokenIcon(Eth),
    RenIcon: wrappedTokenIcon(RenEth),
    shortName: "ETH",
    fullName: "Ether",
  },
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
    Icon: nativeTokenIcon(Zec),
    RenIcon: wrappedTokenIcon(RenZec),
    shortName: "ZEC",
    fullName: "Zcash.",
  },
  gETH: unsetAssetConfig,
};

export type AssetChainsConfig = {
  lockChain: Chain;
  mintChains: Array<Chain>;
  lockChainConnectionRequired?: boolean; // better name?
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

export const getAssetConfig = (asset: Asset | string) => {
  const config = assetsConfig[asset as Asset];
  if (!config) {
    throw new Error(`Asset config not found for ${asset}`);
  }
  return config;
};

export const getRenShortName = (shortName: string) => `ren${shortName}`;
export const getRenFullName = (fullName: string) => `Ren ${fullName}`;

// TODO: invent naming similar to renJS, Noah
export const getRenAssetName = (asset: Asset | string) => `ren${asset}`; //or mint?
export const getOriginAssetName = (renAsset: string) => {
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
