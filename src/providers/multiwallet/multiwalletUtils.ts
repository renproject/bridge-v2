import {
  ChainSymbols,
  ChainType,
  CurrencySymbols,
  CurrencyType,
} from "../../components/utils/types";

// TODO: Bridge and Multiwallet should use the same chain mapping for example from @renproject/interfaces / Chain

export const bridgeChainToMultiwalletChain = (chainSymbol: ChainType) => {
  switch (chainSymbol) {
    case ChainSymbols.BTCC:
      return "bitcoin";
    case ChainSymbols.BNCC:
      return "bsc";
    case ChainSymbols.ETHC:
      return "ethereum";
    default:
      return "unknown";
  }
};

export const multiwalletChainToBridgeChain = (chain: string) => {
  switch (chain) {
    case "bitcoin":
      return ChainSymbols.BTCC;
    case "bsc":
      return ChainSymbols.BNCC;
    case "ethereum":
      return ChainSymbols.ETHC;
    default:
      return "unknown";
  }
};

export const supportedMintCurrencies = [
  CurrencySymbols.BTC,
  CurrencySymbols.BCH,
  CurrencySymbols.DOGE,
  CurrencySymbols.ZEC,
];

export const supportedMintDestinationChains = [
  ChainSymbols.ETHC,
  ChainSymbols.BNCC,
];

export const getMintedCurrencySymbol = (currency: CurrencyType) => {
  switch (currency) {
    case CurrencySymbols.BTC:
      return CurrencySymbols.RENBTC;
    case CurrencySymbols.BCH:
      return CurrencySymbols.RENBCH;
    case CurrencySymbols.DOGE:
      return CurrencySymbols.RENDOGE;
    case CurrencySymbols.ZEC:
      return CurrencySymbols.RENZEC;
    default:
      return CurrencySymbols.RENBTC; //TODO: create unknown currency
  }
};
