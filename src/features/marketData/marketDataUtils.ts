import { Asset, Chain } from "@renproject/chains";
import {
  AssetRateService,
  assetsConfig,
  getAssetSymbolByRateSymbol,
} from "../../utils/assetsConfig";

export const USD_SYMBOL = "USD";

const getPair = (base: string, quote: string) => `${base}/${quote}`;

export const coingeckoSymbols = Object.entries(assetsConfig)
  .filter(
    ([asset, config]) => config.rateService === AssetRateService.Coingecko
  )
  .map(([asset, entry]) => entry.rateSymbol || asset);

console.info("coingeckoSymbols", coingeckoSymbols);

export type CoingeckoReferenceData = {
  id: string;
  symbol: string;
  current_price: number;
};

export const mapCoingeckoToExchangeRate = (
  entries: Array<CoingeckoReferenceData>
) => {
  return entries.map((entry) => {
    const asset = getAssetSymbolByRateSymbol(entry.id);
    return {
      pair: getPair(asset, "USD"),
      rate: entry.current_price,
    };
  });
};

export type ExchangeRate = {
  pair: string;
  rate: number;
};

export type GasPrice = {
  chain: Chain;
  standard: number;
};

export const findAssetExchangeRate = (
  exchangeRates: Array<ExchangeRate>,
  base: Asset,
  quote = USD_SYMBOL
) => {
  const rateEntry = exchangeRates.find(
    (entry) => entry.pair === getPair(base, quote)
  );
  return rateEntry?.rate || null;
};

export type AnyBlockGasPrices = {
  health: boolean;
  blockNumber: number;
  blockTime: number;
  slow: number;
  standard: number;
  fast: number;
  instant: number;
};

export const findGasPrice = (
  gasPrices: Array<GasPrice>,
  chain: Chain | string
) => {
  const gasEntry = gasPrices.find((entry) => entry.chain === chain);
  return gasEntry?.standard || 0;
};
