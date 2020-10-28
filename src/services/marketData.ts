import BandChain from "@bandprotocol/bandchain.js";
import { CurrencySymbols, CurrencyType } from "../components/utils/types";
import { env } from "../constants/environmentVariables";

const mapToBandchainSymbol = (symbol: CurrencyType) => {
  switch (symbol) {
    case CurrencySymbols.DOTS:
      return "DOT";
    case CurrencySymbols.RENBCH:
      return "";
    case CurrencySymbols.RENDOGE:
      return "";
    case CurrencySymbols.RENZEC:
      return "";
    case CurrencySymbols.RENDGB:
      return "";
  }
  return symbol;
};

const mapToBridgeSymbol = (symbol: string) => {
  switch (symbol) {
    case "DOT":
      return CurrencySymbols.RENBCH;
  }
  return symbol as CurrencyType;
};

const QUOTE = "USD";

const getPair = (base: string, quote: string) => `${base}/${quote}`;

const referenceParis = Object.values(CurrencySymbols)
  .map(mapToBandchainSymbol)
  .filter((symbol) => !!symbol)
  .map((symbol: string) => getPair(symbol, QUOTE));

let bandchainInstance: typeof BandChain | null = null;

const getBandchain = () => {
  if (bandchainInstance === null) {
    bandchainInstance = new BandChain(env.BANDCHAIN_ENDPOINT);
  }
  return bandchainInstance;
};

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
      pair: getPair(mapToBridgeSymbol(base), quote),
      rate: entry.rate,
    };
    return data;
  });
};

export type ExchangeRate = {
  pair: string;
  rate: number;
};

export const fetchMarketRates = async () => {
  return getBandchain()
    .getReferenceData(referenceParis)
    .then(mapToExchangeData);
};

export const findExchangeRate = (
  exchangeRates: Array<ExchangeRate>,
  base: CurrencyType,
  quote = QUOTE
) => {
  const rateEntry = exchangeRates.find(
    (entry) => entry.pair === getPair(base, quote)
  );
  return rateEntry?.rate || 0;
};
