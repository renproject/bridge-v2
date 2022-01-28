import { ReferenceData } from "@bandprotocol/bandchain.js/lib/data";
import { env } from "../../constants/environmentVariables";
import {
  BridgeChain,
  BridgeCurrency,
  currenciesConfig,
  getCurrencyConfigByBandchainSymbol,
  getCurrencyConfigByCoingeckoSymbol,
} from "../../utils/assetConfigs";

// move to assetConfig

const mapBandchainToCurrencySymbol = (symbol: string) => {
  const config = getCurrencyConfigByBandchainSymbol(symbol);
  return config.symbol;
};

export const USD_SYMBOL = "USD";

const getPair = (base: string, quote: string) => `${base}/${quote}`;

export const bandchainReferencePairs = [];

export const coingeckoSymbols = Object.values(currenciesConfig)
  .filter((entry) => Boolean(entry.coingeckoSymbol))
  .map((entry) => entry.coingeckoSymbol);

export type BandchainReferenceData = ReferenceData;

export type CoingeckoReferenceData = {
  id: string;
  symbol: string;
  current_price: number;
};

export const mapBandchainToExchangeData = (
  referenceData: Array<BandchainReferenceData>
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

export const mapCoingeckoToExchangeData = (
  entries: Array<CoingeckoReferenceData>
) => {
  return entries.map((entry: any) => {
    const assetConfig = getCurrencyConfigByCoingeckoSymbol(entry.id);
    return {
      pair: getPair(assetConfig.symbol, "USD"),
      rate: entry.current_price,
    };
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

export const findExchangeRate = (
  exchangeRates: Array<ExchangeRate>,
  base: BridgeCurrency,
  quote = USD_SYMBOL
) => {
  let symbol = base;
  if (base.indexOf("REN") === 0 && base.length > 3) {
    symbol = base.substr(3) as BridgeCurrency;
  }
  const rateEntry = exchangeRates.find(
    (entry) => entry.pair === getPair(symbol, quote)
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

export const fetchMarketDataGasPrices = async () => {
  const anyBlockEth = await fetch(env.GAS_FEE_ENDPOINT)
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
      return {
        fast: 50, // fallback
      };
    });
  const fast = anyBlockEth.fast;
  const ethPrice = {
    chain: BridgeChain.ETHC,
    standard: fast < 20 ? 50 : fast,
  };
  const matic = await fetch("https://gasstation-mainnet.matic.network")
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
      return {
        fast: 6, // fallback
      };
    });
  const maticPrice = {
    chain: BridgeChain.MATICC,
    standard: matic.fast,
  };
  const bscPrice = {
    chain: BridgeChain.BSCC,
    standard: 20, // unable to find reliable source, but binance gas price is stable
  };
  const avaxPrice = {
    chain: BridgeChain.AVAXC,
    standard: 225, // taken from https://docs.avax.network/learn/platform-overview/transaction-fees#fee-schedule
  };
  const ftmPrice = {
    chain: BridgeChain.FTMC,
    standard: 75, // avg gas price
  };
  const arbPrice = {
    chain: BridgeChain.ARBITRUMC,
    standard: 0.4, // avg gas price
  };
  const solanaPrice = {
    chain: BridgeChain.SOLC,
    standard: 6, // extrapolated to make it around 0,001 SOL
  };
  return [
    ethPrice,
    bscPrice,
    avaxPrice,
    ftmPrice,
    maticPrice,
    solanaPrice,
    arbPrice,
  ] as Array<GasPrice>;
};

export const findGasPrice = (gasPrices: Array<GasPrice>, chain: string) => {
  const gasEntry = gasPrices.find((entry) => entry.chain === chain);
  return gasEntry?.standard || 0;
};
