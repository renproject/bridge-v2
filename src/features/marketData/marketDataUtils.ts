import { ReferenceData } from "@bandprotocol/bandchain.js/lib/data";
import { Asset } from "@renproject/chains";
import { env } from "../../constants/environmentVariables";
import { uniqueArray } from "../../utils/arrays";
import {
  BridgeChain,
  BridgeCurrency,
  currenciesConfig,
  getCurrencyConfigByBandchainSymbol,
} from "../../utils/assetConfigs";
import {
  AssetRateService,
  assetsConfig,
  supportedAssets,
} from "../../utils/tokensConfig";

const mapBandchainToCurrencySymbol = (symbol: string) => {
  const config = getCurrencyConfigByBandchainSymbol(symbol);
  return config.symbol;
};

export const USD_SYMBOL = "USD";

const getPair = (base: string, quote: string) => `${base}/${quote}`;

export const bandchainReferencePairs = uniqueArray(
  Object.entries(assetsConfig)
    .filter(([asset]) => supportedAssets.includes(asset as Asset))
    .filter(
      ([asset, config]) => config.rateService === AssetRateService.Bandchain
    )
    .map(([asset, config]) => config.rateSymbol || asset)
).map((symbol: string) => getPair(symbol, USD_SYMBOL));

console.log("bandchainReferencePairs", bandchainReferencePairs);

export const coingeckoSymbols = Object.values(currenciesConfig)
  .filter((entry) => Boolean(entry.coingeckoSymbol))
  .map((entry) => entry.coingeckoSymbol);

export type BandchainReferenceData = ReferenceData;

export type CoingeckoReferenceData = {
  symbol: string;
  current_price: number;
};

export const mapBandchainToExchangeRate = (
  referenceData: Array<BandchainReferenceData>
) => {
  return referenceData.map((entry: any) => {
    const [rateSymbol, quote] = entry.pair.split("/");
    const data: ExchangeRate = {
      pair: getPair(mapBandchainToCurrencySymbol(rateSymbol), quote),
      rate: entry.rate,
    };
    return data;
  });
};

export const mapCoingeckoToExchangeRate = (
  entries: Array<CoingeckoReferenceData>
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

export const findAssetExchangeRate = (
  exchangeRates: Array<ExchangeRate>,
  base: Asset,
  quote = USD_SYMBOL
) => {
  const rateSymbol = assetsConfig[base].rateSymbol || base;
  const rateEntry = exchangeRates.find(
    (entry) => entry.pair === getPair(rateSymbol, quote)
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
