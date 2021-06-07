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

const mapToBridgeCurrencySymbol = (symbol: string) => {
  const config = getCurrencyConfigByBandchainSymbol(symbol);
  return config.symbol;
};

export const USD_SYMBOL = "USD";

const getPair = (base: string, quote: string) => `${base}/${quote}`;

const referencePairs = uniqueArray(
  Object.values(BridgeCurrency)
    .map(mapToBandchainCurrencySymbol)
    .filter(
      (symbol) =>
        symbol !== BridgeCurrency.UNKNOWN && symbol !== BridgeCurrency.AVAX
    )
).map((symbol: string) => getPair(symbol, USD_SYMBOL));

type BandchainExchangeRateEntry = {
  pair: string;
  rate: number;
  updated: {
    base: number;
    quote: number;
  };
};

const mapToExchangeData = (
  referenceData: Array<BandchainExchangeRateEntry>
) => {
  return referenceData.map((entry: any) => {
    const [base, quote] = entry.pair.split("/");
    const data: ExchangeRate = {
      pair: getPair(mapToBridgeCurrencySymbol(base), quote),
      rate: entry.rate,
    };
    return data;
  });
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
  return getBandchain()
    .getReferenceData(referencePairs)
    .then(mapToExchangeData);
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
