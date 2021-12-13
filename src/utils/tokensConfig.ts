import { Asset } from "@renproject/chains";
import { Bitcoin, BitcoinCash } from "@renproject/chains-bitcoin";
import { Ethereum } from "@renproject/chains-ethereum";
import {
  BtcIcon,
  CustomSvgIconComponent,
  EmptyCircleIcon,
} from "../components/icons/RenIcons";
import { allAssetChains } from "./chainsConfig";

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

type AssetConfig = AssetIconsConfig & AssetLabelsConfig & {};

console.log("aac", allAssetChains);

const unsetAssetConfig: AssetConfig = {
  Icon: EmptyCircleIcon,
  shortName: "USN",
  fullName: "Unset full name",
};

//TODO: rename to assetsConfig when refactor done
const tokensConfig: Record<Asset, AssetConfig> = {
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
