// A mapping of how to construct parameters for host chains,
// based on the destination network
import {
  BinanceSmartChain,
  Bitcoin,
  Ethereum,
  Zcash,
  BitcoinCash,
} from "@renproject/chains";

export const toChainMap = {
  binanceSmartChain: (context: any) => {
    const { destAddress, destNetwork } = context.tx;
    const { providers } = context;
    return new BinanceSmartChain(providers[destNetwork]).Account({
      address: destAddress,
    });
  },
  ethereum: (context: any) => {
    const { destAddress, destNetwork } = context.tx;
    const { providers } = context;

    return Ethereum(providers[destNetwork]).Account({
      address: destAddress,
    });
  },
};

// A mapping of how to construct parameters for source chains,
// based on the source network
export const fromChainMap = {
  bitcoin: () => Bitcoin(),
  zcash: () => Zcash(),
  bitcoinCash: () => BitcoinCash(),
};
