// A mapping of how to construct parameters for host chains,
// based on the destination network
import { Bitcoin, BitcoinCash, Ethereum, Zcash, } from '@renproject/chains'
import { BurnMachineContext } from '@renproject/rentx'

export const mintChainMap = {
  // binanceSmartChain: (context: any) => {
  //   const { destAddress, destNetwork } = context.tx;
  //   const { providers } = context;
  //   return new BinanceSmartChain(providers[destNetwork]).Account({
  //     address: destAddress,
  //   });
  // },
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
export const lockChainMap = {
  bitcoin: () => Bitcoin(),
  zcash: () => Zcash(),
  bitcoinCash: () => BitcoinCash(),
};

export const burnChainMap: BurnMachineContext["fromChainMap"] = {
  ethereum: (context: any) => {
    return Ethereum(context.providers.ethereum).Account({
      address: context.tx.userAddress,
      value: (context.tx.targetAmount * 1e8) + "",
    }) as any;
  },
};

export const releaseChainMap: BurnMachineContext["toChainMap"] = {
  bitcoin: (context: any) => {
    return Bitcoin().Address(context.tx.destAddress) as any;
  },
};
