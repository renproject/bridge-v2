import { BridgeCurrency } from "../../components/utils/types";
import { env } from "../../constants/environmentVariables";
import { getBandchain } from "../../services/bandchain";
import { uniqueArray } from "../../utils/arrays";
import {
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

const QUOTE = "USD";

const getPair = (base: string, quote: string) => `${base}/${quote}`;

const referenceParis = uniqueArray(
  Object.values(BridgeCurrency)
    .map(mapToBandchainCurrencySymbol)
    .filter((symbol) => symbol !== BridgeCurrency.UNKNOWN)
).map((symbol: string) => getPair(symbol, QUOTE));

console.log(referenceParis);

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

export const fetchMarketDataRates = async () => {
  return getBandchain()
    .getReferenceData(referenceParis)
    .then(mapToExchangeData);
};

export const findExchangeRate = (
  // TODO: CRIT: investigate what to do with nonexistent currencies
  exchangeRates: Array<ExchangeRate>,
  base: BridgeCurrency,
  quote = QUOTE
) => {
  const rateEntry = exchangeRates.find(
    (entry) => entry.pair === getPair(base, quote)
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

export const fetchMarketDataGasPrices = () =>
  fetch(env.GAS_FEE_ENDPOINT)
    .then((response) => response.json())
    .then((data: AnyBlockGasPrices) => {
      return data;
    });
