import { env } from "../../constants/environmentVariables";
import { getBandchain } from "../../services/bandchain";
import { uniqueArray } from "../../utils/arrays";
import {
  BridgeCurrency,
  currenciesConfig,
  getCurrencyConfigByBandchainSymbol,
} from "../../utils/assetConfigs";

// move to assetConfig
const mapToBandchainCurrencySymbol = (symbol: BridgeCurrency) => {
  const config = currenciesConfig[symbol];
  return config.bandchainSymbol || symbol;
};

const mapBandchainToCurrencySymbol = (symbol: string) => {
  const config = getCurrencyConfigByBandchainSymbol(symbol);
  return config.symbol;
};

export const USD_SYMBOL = "USD";

const getPair = (base: string, quote: string) => `${base}/${quote}`;

const bandchainReferencePairs = uniqueArray(
  Object.values(BridgeCurrency)
    .filter(
      (symbol) =>
        symbol !== BridgeCurrency.UNKNOWN && symbol !== BridgeCurrency.AVAX
    )
    .map(mapToBandchainCurrencySymbol)
).map((symbol: string) => getPair(symbol, USD_SYMBOL));

const coingeckoSymbols = Object.values(currenciesConfig)
  .filter((entry) => Boolean(entry.coingeckoSymbol))
  .map((entry) => entry.coingeckoSymbol);

type BandchainExchangeRateEntry = {
  pair: string;
  rate: number;
  updated: {
    base: number;
    quote: number;
  };
};

type CoingeckoExchangeRateEntry = {
  symbol: string;
  current_price: number;
};

const mapBandchainToExchangeData = (
  referenceData: Array<BandchainExchangeRateEntry>
) => {
  return referenceData.map((entry: any) => {
    const [base, quote] = entry.pair.split("/");
    const data: ExchangeRate = {
      pair: getPair(mapBandchainToCurrencySymbol(base), quote),
      rate: entry.rate,
    };
    return data;
  });
};

const mapCoingeckoToExchangeData = (
  entries: Array<CoingeckoExchangeRateEntry>
) => {
  return entries.map((entry: any) => ({
    pair: getPair(entry.symbol, "USD"),
    rate: entry.current_price,
  }));
};

export type ExchangeRate = {
  pair: string;
  rate: number;
};

export type GasPrice = {
  chain: string;
  standard: number;
};

export const fetchMarketDataRates = async () => {
  const bandchain = await getBandchain()
    .getReferenceData(bandchainReferencePairs)
    .then(mapBandchainToExchangeData);

  const coingecko = await fetch(
    env.COINGECKO_ENDPOINT +
      `/coins/markets?vs_currency=usd&ids=${coingeckoSymbols.join(",")}`
  )
    .then((response) => response.json())
    .then(mapCoingeckoToExchangeData)
    .catch((error) => {
      console.error(error);
      return [];
    });

  return [...bandchain, ...coingecko];
};

export const findExchangeRate = (
  exchangeRates: Array<ExchangeRate>,
  base: BridgeCurrency,
  quote = USD_SYMBOL
) => {
  const baseBandchainSymbol = mapToBandchainCurrencySymbol(base);
  const rateEntry = exchangeRates.find(
    (entry) => entry.pair === getPair(baseBandchainSymbol, quote)
  );
  return rateEntry?.rate || 0;
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

export const fetchEthMarketDataGasPrices = () =>
  fetch(env.GAS_FEE_ENDPOINT)
    .then((response) => response.json())
    .then((data: AnyBlockGasPrices) => {
      return data;
    });

export const findGasPrice = (gasPrices: Array<GasPrice>, chain: string) => {
  const gasEntry = gasPrices.find((entry) => entry.chain === chain);
  return gasEntry?.standard || 0;
};
