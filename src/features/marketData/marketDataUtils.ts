import { BridgeCurrency } from "../../components/utils/types";
import { env } from "../../constants/environmentVariables";
import { getBandchain } from "../../services/bandchain";

const mapToBandchainCurrencySymbol = (symbol: BridgeCurrency) => {
  switch (symbol) {
    case BridgeCurrency.DOTS:
      return "DOT";
    case BridgeCurrency.RENBCH:
      return "";
    case BridgeCurrency.RENDOGE:
      return "";
    case BridgeCurrency.RENZEC:
      return "";
    case BridgeCurrency.RENDGB:
      return "";
  }
  return symbol;
};

const mapToBridgeCurrencySymbol = (symbol: string) => {
  switch (symbol) {
    case "DOT":
      return BridgeCurrency.RENBCH;
  }
  return symbol as BridgeCurrency;
};

const QUOTE = "USD";

const getPair = (base: string, quote: string) => `${base}/${quote}`;

const referenceParis = Object.values(BridgeCurrency)
  .map(mapToBandchainCurrencySymbol)
  .filter((symbol) => !!symbol)
  .map((symbol: string) => getPair(symbol, QUOTE));

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
      console.log("gas", data);
      return data;
    });
