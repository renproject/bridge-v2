import { Asset, Chain } from "@renproject/chains";
import {
  Bch,
  Bnb,
  Btc,
  Dai,
  Doge,
  Digi,
  RenDigi,
  Eth,
  Fil,
  RenBch,
  RenBnb,
  RenBtc,
  RenDai,
  RenDoge,
  RenEth,
  RenFil,
  RenZec,
  Zec,
  Luna,
  RenLuna,
  Sol,
  RenSol,
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
import { bitcoinOrange } from "../theme/colors";
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
  AVAX: {
    ...unsetAssetConfig,
    rateService: AssetRateService.Coingecko,
    rateSymbol: "avalanche-2",
  },
  ArbETH: {
    ...unsetAssetConfig,
    rateService: AssetRateService.Coingecko,
    rateSymbol: "weth", // simple hack for duplicated ethereum entry
  },
  BADGER: unsetAssetConfig,
  BCH: {
    Icon: nativeTokenIcon(Bch),
    RenIcon: wrappedTokenIcon(RenBch),
    shortName: "BCH",
    fullName: "Bitcoin Cash",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "bitcoin-cash",
  },
  BNB: {
    Icon: nativeTokenIcon(Bnb),
    RenIcon: wrappedTokenIcon(RenBnb),
    shortName: "BNB",
    fullName: "Binance Coin",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "binancecoin",
  },
  BTC: {
    Icon: nativeTokenIcon(Btc),
    RenIcon: wrappedTokenIcon(RenBtc),
    color: bitcoinOrange,
    shortName: "BTC",
    fullName: "Bitcoin",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "bitcoin",
  },
  BUSD: unsetAssetConfig,
  CRV: unsetAssetConfig,
  DAI: {
    Icon: nativeTokenIcon(Dai),
    RenIcon: wrappedTokenIcon(RenDai),
    shortName: "DAI",
    fullName: "Dai",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "dai",
  },
  DGB: {
    Icon: nativeTokenIcon(Digi),
    RenIcon: wrappedTokenIcon(RenDigi),
    shortName: "DGB",
    fullName: "DigiByte",
    // rateService: AssetRateService.Coingecko,
    rateSymbol: "digibyte",
  },
  DOGE: {
    Icon: nativeTokenIcon(Doge),
    RenIcon: wrappedTokenIcon(RenDoge),
    shortName: "DOGE",
    fullName: "Dogecoin",
    // rateService: AssetRateService.Coingecko,
    rateSymbol: "dogecoin",
  },
  ETH: {
    Icon: nativeTokenIcon(Eth),
    RenIcon: wrappedTokenIcon(RenEth),
    shortName: "ETH",
    fullName: "Ether",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "ethereum",
  },
  EURT: unsetAssetConfig,
  FIL: {
    Icon: nativeTokenIcon(Fil),
    RenIcon: wrappedTokenIcon(RenFil),
    shortName: "FIL",
    fullName: "Filecoin",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "filecoin",
  },
  FTM: {
    ...unsetAssetConfig,
    rateService: AssetRateService.Coingecko,
    rateSymbol: "fantom",
  },
  FTT: unsetAssetConfig,
  KNC: unsetAssetConfig,
  LINK: unsetAssetConfig,
  LUNA: {
    Icon: nativeTokenIcon(Luna),
    RenIcon: wrappedTokenIcon(RenLuna),
    shortName: "LUNA",
    fullName: "Terra",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "terra-luna",
  },
  MATIC: {
    ...unsetAssetConfig,
    rateService: AssetRateService.Coingecko,
    rateSymbol: "polygon",
  },
  MIM: unsetAssetConfig,
  REN: unsetAssetConfig,
  ROOK: unsetAssetConfig,
  SUSHI: unsetAssetConfig,
  SOL: {
    Icon: nativeTokenIcon(Sol),
    RenIcon: wrappedTokenIcon(RenSol),
    shortName: "SOL",
    fullName: "Solana",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "solana",
  },
  UNI: unsetAssetConfig,
  USDC: unsetAssetConfig,
  USDT: unsetAssetConfig,
  ZEC: {
    Icon: nativeTokenIcon(Zec),
    RenIcon: wrappedTokenIcon(RenZec),
    shortName: "ZEC",
    fullName: "Zcash",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "zcash",
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

export const getRenAssetConfig = (asset: Asset | string) => {
  const assetConfig = getAssetConfig(asset);
  const { shortName, fullName, ...rest } = assetConfig;
  return {
    shortName: getRenAssetName(shortName),
    fullName: getRenAssetFullName(fullName),
    ...rest,
  };
};

export const getAssetSymbolByRateSymbol = (symbol: string) => {
  const entry = Object.entries(assetsConfig).find(
    ([_, config]) => config.rateSymbol === symbol
  );
  if (!entry) {
    throw new Error(`Asset config not found by rateSymbol: ${symbol}`);
  }
  return entry[0];
};

export const getRenAssetFullName = (fullName: string) => `Ren ${fullName}`;
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
        Asset.DGB,
        // Asset.DOGE,
        // Asset.FIL,
        Asset.LUNA,
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
