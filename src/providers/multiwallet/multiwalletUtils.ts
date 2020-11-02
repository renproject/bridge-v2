import { BridgeChain, CurrencySymbols, CurrencyType, } from '../../components/utils/types'

// TODO: Bridge and Multiwallet should use the same chain mapping for example from @renproject/interfaces / Chain

export const bridgeChainToMultiwalletChain = (chainSymbol: BridgeChain) => {
  switch (chainSymbol) {
    case BridgeChain.BTCC:
      return "bitcoin";
    case BridgeChain.BNCC:
      return "bsc";
    case BridgeChain.ETHC:
      return "ethereum";
    default:
      return "unknown";
  }
};

export const multiwalletChainToBridgeChain = (chain: string) => {
  switch (chain) {
    case "bitcoin":
      return BridgeChain.BTCC;
    case "bsc":
      return BridgeChain.BNCC;
    case "ethereum":
      return BridgeChain.ETHC;
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
  BridgeChain.ETHC,
  BridgeChain.BNCC,
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
