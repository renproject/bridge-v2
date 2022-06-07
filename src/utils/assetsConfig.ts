import { Badge } from "@material-ui/core";
import { Asset, Chain } from "@renproject/chains";
import {
  assetsColors,
  Avax,
  Bch,
  Bnb,
  Btc,
  Busd,
  Crv,
  Dai,
  Dgb,
  Doge,
  Eth,
  Eurt,
  Fil,
  Ftm,
  Ftt,
  Knc,
  Link,
  Luna,
  Matic,
  Mim,
  Ren,
  RenAvax,
  RenBadger,
  RenBch,
  RenBnb,
  RenBtc,
  RenBusd,
  RenCrv,
  RenDai,
  RenDgb,
  RenDoge,
  RenEth,
  RenEurt,
  RenFil,
  RenFtm,
  RenFtt,
  RenKnc,
  RenLink,
  RenLuna,
  RenMatic,
  RenMim,
  RenRen,
  RenRook,
  RenSol,
  RenSushi,
  RenUni,
  RenUsdc,
  RenUsdt,
  RenZec,
  Rook,
  Sol,
  Sushi,
  Uni,
  Usdc,
  Usdt,
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
  RenIcon: EmptyCircleIcon,
  shortName: "",
  fullName: "",
};

const assetsBaseConfig: Record<Asset, AssetBaseConfig> = {
  AVAX: {
    Icon: nativeTokenIcon(Avax),
    RenIcon: wrappedTokenIcon(RenAvax),
    shortName: "AVAX",
    fullName: "Avalanche",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "avalanche-2",
  },
  ArbETH: {
    Icon: nativeTokenIcon(Eth),
    RenIcon: wrappedTokenIcon(RenEth),
    shortName: "ArbETH",
    fullName: "Arbitrum Ether",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "weth", // simple hack for duplicated ethereum entry
  },
  BADGER: {
    Icon: nativeTokenIcon(Badge),
    RenIcon: wrappedTokenIcon(RenBadger),
    shortName: "BADGER",
    fullName: "Badger DAO",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "badger-dao",
  },
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
    shortName: "BTC",
    fullName: "Bitcoin",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "bitcoin",
  },
  BUSD: {
    Icon: nativeTokenIcon(Busd),
    RenIcon: wrappedTokenIcon(RenBusd),
    shortName: "BUSD",
    fullName: "Binance USD",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "binance-usd",
  },
  CRV: {
    Icon: nativeTokenIcon(Crv),
    RenIcon: wrappedTokenIcon(RenCrv),
    shortName: "CRV",
    fullName: "Curve DAO Token",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "curve-dao-token",
  },
  DAI: {
    Icon: nativeTokenIcon(Dai),
    RenIcon: wrappedTokenIcon(RenDai),
    shortName: "DAI",
    fullName: "Dai",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "dai",
  },
  DGB: {
    Icon: nativeTokenIcon(Dgb),
    RenIcon: wrappedTokenIcon(RenDgb),
    shortName: "DGB",
    fullName: "DigiByte",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "digibyte",
  },
  DOGE: {
    Icon: nativeTokenIcon(Doge),
    RenIcon: wrappedTokenIcon(RenDoge),
    shortName: "DOGE",
    fullName: "Dogecoin",
    rateService: AssetRateService.Coingecko,
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
  EURT: {
    Icon: nativeTokenIcon(Eurt),
    RenIcon: wrappedTokenIcon(RenEurt),
    shortName: "EURT",
    fullName: "Euro Tether",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "euro-tether",
  },
  FIL: {
    Icon: nativeTokenIcon(Fil),
    RenIcon: wrappedTokenIcon(RenFil),
    shortName: "FIL",
    fullName: "Filecoin",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "filecoin",
  },
  FTM: {
    Icon: nativeTokenIcon(Ftm),
    RenIcon: wrappedTokenIcon(RenFtm),
    shortName: "FTM",
    fullName: "Fantom",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "fantom",
  },
  FTT: {
    Icon: nativeTokenIcon(Ftt),
    RenIcon: wrappedTokenIcon(RenFtt),
    shortName: "FTT",
    fullName: "FTX Token",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "ftx-token",
  },
  KNC: {
    Icon: nativeTokenIcon(Knc),
    RenIcon: wrappedTokenIcon(RenKnc),
    shortName: "KNC",
    fullName: "Kyber Network Crystal",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "kyber-network-crystal",
  },
  LINK: {
    Icon: nativeTokenIcon(Link),
    RenIcon: wrappedTokenIcon(RenLink),
    shortName: "LINK",
    fullName: "Chainlink",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "chainlink",
  },
  LUNA: {
    Icon: nativeTokenIcon(Luna),
    RenIcon: wrappedTokenIcon(RenLuna),
    shortName: "LUNA",
    fullName: "Terra",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "terra-luna",
  },
  MATIC: {
    Icon: nativeTokenIcon(Matic),
    RenIcon: wrappedTokenIcon(RenMatic),
    shortName: "MATIC",
    fullName: "Polygon",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "polygon",
  },
  MIM: {
    Icon: nativeTokenIcon(Mim),
    RenIcon: wrappedTokenIcon(RenMim),
    shortName: "MIM",
    fullName: "Magic Internet Money",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "magic-internet-money",
  },
  REN: {
    Icon: nativeTokenIcon(Ren),
    RenIcon: wrappedTokenIcon(RenRen),
    shortName: "REN",
    fullName: "REN",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "republic-protocol",
  },
  ROOK: {
    Icon: nativeTokenIcon(Rook),
    RenIcon: wrappedTokenIcon(RenRook),
    shortName: "ROOK",
    fullName: "KeeperDAO",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "rook",
  },
  SUSHI: {
    Icon: nativeTokenIcon(Sushi),
    RenIcon: wrappedTokenIcon(RenSushi),
    shortName: "SUSHI",
    fullName: "Sushi",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "sushi",
  },
  SOL: {
    Icon: nativeTokenIcon(Sol),
    RenIcon: wrappedTokenIcon(RenSol),
    shortName: "SOL",
    fullName: "Solana",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "solana",
  },
  UNI: {
    Icon: nativeTokenIcon(Uni),
    RenIcon: wrappedTokenIcon(RenUni),
    shortName: "UNI",
    fullName: "Uniswap",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "uniswap",
  },
  USDC: {
    Icon: nativeTokenIcon(Usdc),
    RenIcon: wrappedTokenIcon(RenUsdc),
    shortName: "USDC",
    fullName: "USD Coin",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "usd-coin",
  },
  USDT: {
    Icon: nativeTokenIcon(Usdt),
    RenIcon: wrappedTokenIcon(RenUsdt),
    shortName: "USDT",
    fullName: "Tether",
    rateService: AssetRateService.Coingecko,
    rateSymbol: "tether",
  },
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

const getAssetColorConfig = (asset: Asset) => {
  const color = assetsColors[asset];
  return color.primary;
};

export type AssetChainsConfig = {
  lockChain: Chain;
  mintChains: Array<Chain>;
  lockChainConnectionRequired?: boolean; // better name?
};

export type AssetColorConfig = {
  color: string;
};

export type AssetConfig = AssetBaseConfig &
  AssetColorConfig &
  AssetChainsConfig;

export const assetsConfig = Object.fromEntries(
  Object.entries(assetsBaseConfig).map(([asset, config]) => [
    asset,
    {
      ...config,
      ...getAssetChainsConfig(asset as Asset),
      color: getAssetColorConfig(asset as Asset),
      // prevent UNSET for simple cases
      shortName: config.shortName || asset,
      fullName: config.fullName || asset,
    },
  ])
) as Record<Asset, AssetConfig>;

console.log("assetsConfig", assetsConfig);
(window as any).assetsConfig = assetsConfig;

export const getAssetConfig = (asset: Asset | string) => {
  const config = assetsConfig[asset as Asset];
  if (!config) {
    throw new Error(`Asset config not found for ${asset}`);
  }
  return config;
};

export const getRenAssetConfig = (asset: Asset | string) => {
  const assetConfig = getAssetConfig(asset);
  const { shortName, fullName, Icon, RenIcon, ...rest } = assetConfig;
  return {
    shortName: getRenAssetName(shortName),
    fullName: getRenAssetFullName(fullName),
    Icon: RenIcon,
    RenIcon,
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

export const isChainNativeAsset = (chain: Chain, asset: Asset) => {
  return getAssetConfig(asset).lockChain === chain;
};

export const getUIAsset = (asset: Asset, chain: Chain) => {
  const assetConfig = getAssetConfig(asset);
  const isNative = isChainNativeAsset(chain, asset);
  const renAssetConfig = getRenAssetConfig(asset);
  const shortName = isNative ? assetConfig.shortName : renAssetConfig.shortName;
  const fullName = isNative ? assetConfig.fullName : renAssetConfig.fullName;
  const Icon = isNative ? assetConfig.Icon : renAssetConfig.Icon;
  return { shortName, fullName, Icon };
};

export const supportedAssets =
  env.ENABLED_ASSETS[0] === "*"
    ? [
        Asset.BTC,
        Asset.BCH,
        Asset.DGB,
        Asset.DOGE,
        Asset.FIL,
        Asset.LUNA,
        Asset.ZEC,
        Asset.ETH,
        Asset.BNB,
        Asset.AVAX,
        Asset.FTM,
        Asset.ArbETH,
        Asset.MATIC,
        // Asset.SOL, // not sure about that
        Asset.REN,
        Asset.DAI,
        Asset.USDC,
        Asset.USDT,
        Asset.EURT,
        Asset.BUSD,
        Asset.MIM,
        Asset.CRV,
        Asset.LINK,
        Asset.UNI,
        Asset.SUSHI,
        Asset.FTT,
        Asset.ROOK,
        Asset.BADGER,
        Asset.KNC,
      ]
    : env.ENABLED_ASSETS.filter((x) => {
        const included = Object.keys(assetsConfig).includes(x);
        if (!included) {
          console.error("Unknown asset:", x);
        }
        return included;
      }).map((x) => x as Asset);

console.log("supportedAssets", supportedAssets);
