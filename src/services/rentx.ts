// A mapping of how to construct parameters for host chains,
// based on the destination network
import {
  BinanceSmartChain,
  Bitcoin,
  BitcoinCash,
  Dogecoin,
  Ethereum,
  Zcash,
} from "@renproject/chains";
import { RenNetwork } from "@renproject/interfaces";
import { BurnMachineContext, GatewayMachineContext } from "@renproject/ren-tx";
import { mapFees } from "../features/fees/feesUtils";
import {
  BridgeCurrency,
  getChainConfig,
  getCurrencyConfig,
  RenChain,
  toReleasedCurrency,
} from "../utils/assetConfigs";
import { getRenJs } from "./renJs";

export const lockChainMap = {
  [RenChain.bitcoin]: () => Bitcoin(),
  [RenChain.zcash]: () => Zcash(),
  [RenChain.bitcoinCash]: () => BitcoinCash(),
  [RenChain.dogecoin]: () => Dogecoin(),
};

export const mintChainMap = {
  [RenChain.ethereum]: (context: GatewayMachineContext) => {
    const { destAddress, network } = context.tx;
    const { providers } = context;

    return Ethereum(providers.ethereum, network).Account({
      address: destAddress,
    }) as any;
  },
  [RenChain.binanceSmartChain]: (context: GatewayMachineContext) => {
    const { destAddress, network } = context.tx;
    const { providers } = context;

    return new BinanceSmartChain(providers.binanceSmartChain, network).Account({
      // providers.binanceSmartChain?
      address: destAddress,
    }) as any;
  },
};

export const mintChainClassMap = {
  [RenChain.ethereum]: Ethereum,
  [RenChain.binanceSmartChain]: BinanceSmartChain,
};

export const getLockAndMintFees = (
  lockedCurrency: BridgeCurrency,
  provider: any,
  network: RenNetwork,
  chain: RenChain
) => {
  const lockedCurrencyConfig = getCurrencyConfig(lockedCurrency);

  const lockedCurrencyChain = getChainConfig(lockedCurrencyConfig.sourceChain);

  const From = (lockChainMap as any)[lockedCurrencyChain.rentxName];
  const To = (mintChainClassMap as any)[chain];
  // TODO: crit temp
  let subnetwork = network;
  if (lockedCurrency === BridgeCurrency.DOGE) {
    subnetwork = RenNetwork.TestnetVDot3;
  }
  return getRenJs(subnetwork)
    .getFees({
      asset: lockedCurrency,
      from: From(),
      to: To(provider, subnetwork), // TODO: this should differentiate based on selected asset
    })
    .then(mapFees);
};

export const burnChainMap: BurnMachineContext["fromChainMap"] = {
  [RenChain.ethereum]: (context) => {
    return Ethereum(context.providers.ethereum, context.tx.network).Account({
      address: context.tx.userAddress,
      value: context.tx.suggestedAmount,
    }) as any;
  },
  [RenChain.binanceSmartChain]: (context) => {
    const { network } = context.tx;
    const { providers } = context;
    return new BinanceSmartChain(providers.binanceSmartChain, network).Account({
      address: context.tx.userAddress,
      value: context.tx.suggestedAmount,
    }) as any;
  },
};

export const burnChainClassMap = {
  [RenChain.ethereum]: Ethereum,
  [RenChain.binanceSmartChain]: BinanceSmartChain,
};

export const releaseChainMap: BurnMachineContext["toChainMap"] = {
  [RenChain.bitcoin]: (context) => {
    return Bitcoin().Address(context.tx.destAddress) as any;
  },
  [RenChain.zcash]: (context) => {
    return Zcash().Address(context.tx.destAddress) as any;
  },
  [RenChain.bitcoinCash]: (context) => {
    return BitcoinCash().Address(context.tx.destAddress) as any;
  },
};

export const releaseChainClassMap = {
  [RenChain.bitcoin]: Bitcoin,
  [RenChain.zcash]: Zcash,
  [RenChain.bitcoinCash]: BitcoinCash,
};

export const getBurnAndReleaseFees = (
  burnedCurrency: BridgeCurrency,
  provider: any,
  network: RenNetwork,
  chain: RenChain
) => {
  const releasedCurrency = toReleasedCurrency(burnedCurrency);
  const releasedCurrencyConfig = getCurrencyConfig(releasedCurrency);
  const releasedCurrencyChain = getChainConfig(
    releasedCurrencyConfig.sourceChain
  );

  const From = (burnChainClassMap as any)[chain];
  const To = (releaseChainClassMap as any)[releasedCurrencyChain.rentxName];
  return getRenJs(network)
    .getFees({
      asset: releasedCurrency,
      from: From(provider, network),
      to: To(),
    })
    .then(mapFees);
};
