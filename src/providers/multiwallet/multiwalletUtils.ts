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

export const getDestinationChainsByCurrency = (currency: CurrencyType) => {
  const ethereumChainList = [ChainSymbols.ETHC];
  switch (currency) {
    case CurrencySymbols.BTC:
      return ethereumChainList;
    case CurrencySymbols.BCH:
      return ethereumChainList;
    case CurrencySymbols.DOTS:
      return ethereumChainList;
    case CurrencySymbols.DOGE:
      return ethereumChainList;
    case CurrencySymbols.ZEC:
      return ethereumChainList;
  }
};

export const supportedMintCurrencies = [
  CurrencySymbols.BTC,
  CurrencySymbols.ZEC,
  CurrencySymbols.BCH,
  CurrencySymbols.DOGE,
];

export const supportedMintDestinationChains = [
  ChainSymbols.ETHC,
  ChainSymbols.BNCC,
];
