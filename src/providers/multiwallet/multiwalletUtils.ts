import { BridgeChain, BridgeCurrency, } from '../../components/utils/types'

// TODO: Bridge and Multiwallet should use the same chain mapping for example from @renproject/interfaces / Chain

export const supportedMintCurrencies = [
  BridgeCurrency.BTC,
  BridgeCurrency.BCH,
  BridgeCurrency.DOGE,
  BridgeCurrency.ZEC,
];

export const supportedMintDestinationChains = [
  BridgeChain.ETHC,
  BridgeChain.BNCC,
];

export const getMintedCurrencySymbol = (currency: BridgeCurrency) => {
  switch (currency) {
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
