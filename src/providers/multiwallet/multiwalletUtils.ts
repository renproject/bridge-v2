import { BridgeChain, BridgeCurrency } from "../../components/utils/types";

// TODO: Bridge and Multiwallet should use the same chain mapping for example from @renproject/interfaces / Chain

export const supportedMintCurrencies = [
  BridgeCurrency.BTC,
  // BridgeCurrency.BCH,
  // BridgeCurrency.DOGE,
  BridgeCurrency.ZEC,
];

export const supportedMintDestinationChains = [
  BridgeChain.ETHC,
  // BridgeChain.BNCC,
];

export const supportedReleaseSourceChains = [
  BridgeChain.ETHC, // BridgeChain.BNCC,
];

export const supportedReleaseCurrencies = [
  BridgeCurrency.RENBTC,
  // BridgeCurrency.RENBCH,
  // BridgeCurrency.RENDOGE,
  BridgeCurrency.RENZEC,
];

export const getMintedDestinationCurrencySymbol = (
  sourceCurrency: BridgeCurrency
) => {
  switch (sourceCurrency) {
    case BridgeCurrency.BTC:
      return BridgeCurrency.RENBTC;
    case BridgeCurrency.BCH:
      return BridgeCurrency.RENBCH;
    case BridgeCurrency.DOGE:
      return BridgeCurrency.RENDOGE;
    case BridgeCurrency.ZEC:
      return BridgeCurrency.RENZEC;
    default:
      return BridgeCurrency.UNKNOWN;
  }
};

export const getReleasedDestinationCurrencySymbol = (
  sourceCurrency: BridgeCurrency
) => {
  switch (sourceCurrency) {
    case BridgeCurrency.RENBTC:
      return BridgeCurrency.BTC;
    case BridgeCurrency.RENBCH:
      return BridgeCurrency.BCH;
    case BridgeCurrency.RENDOGE:
      return BridgeCurrency.DOGE;
    case BridgeCurrency.RENZEC:
      return BridgeCurrency.ZEC;
    default:
      return BridgeCurrency.UNKNOWN;
  }
};
