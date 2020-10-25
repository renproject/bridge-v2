import { ChainSymbols, ChainType } from "../../components/utils/types";

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

// TODO: Bridge and Multiwallet should use the same chain mapping for example from @renproject/interfaces / Chain
