// A mapping of how to construct parameters for host chains,
// based on the destination network
import { Fantom, Polygon } from "@renproject/chains";
import {
  Bitcoin,
  BitcoinCash,
  Dogecoin,
  Zcash,
} from "@renproject/chains-bitcoin";
import { BinanceSmartChain, Ethereum } from "@renproject/chains-ethereum";
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

export const getMintChainMap = (providers: any) => ({
  [RenChain.ethereum]: (context: GatewayMachineContext<any>) => {
    const { destAddress, network } = context.tx;

    return Ethereum(providers.ethereum, network).Account({
      address: destAddress,
    }) as any;
  },
  [RenChain.binanceSmartChain]: (context: GatewayMachineContext<any>) => {
    const { destAddress, network } = context.tx;

    return new BinanceSmartChain(providers.binanceSmartChain, network).Account({
      address: destAddress,
    }) as any;
  },
  [RenChain.fantom]: (context: GatewayMachineContext<any>) => {
    const { destAddress, network } = context.tx;

    return new Fantom(providers.fantom, network).Account({
      address: destAddress,
    }) as any;
  },
  [RenChain.polygon]: (context: GatewayMachineContext<any>) => {
    const { destAddress, network } = context.tx;

    return new Polygon(providers.polygon, network).Account({
      address: destAddress,
    }) as any;
  },
});

export const mintChainClassMap = {
  [RenChain.ethereum]: Ethereum,
  [RenChain.binanceSmartChain]: BinanceSmartChain,
  [RenChain.fantom]: Fantom,
  [RenChain.polygon]: Polygon,
};

export const getBurnChainMap: any = (providers: any) => ({
  [RenChain.ethereum]: (context: BurnMachineContext<any, any>) => {
    return Ethereum(providers.ethereum, context.tx.network).Account({
      address: context.tx.userAddress,
      value: String(Number(context.tx.targetAmount) * 1e8), // TODO: crit
    }) as any;
  },
  [RenChain.binanceSmartChain]: (context: BurnMachineContext<any, any>) => {
    const { network } = context.tx;
    return new BinanceSmartChain(providers.binanceSmartChain, network).Account({
      address: context.tx.userAddress,
      value: String(Number(context.tx.targetAmount) * 1e8),
    }) as any;
  },
  [RenChain.fantom]: (context: BurnMachineContext<any, any>) => {
    const { network } = context.tx;
    return new Fantom(providers.fantom, network).Account({
      address: context.tx.userAddress,
      value: String(Number(context.tx.targetAmount) * 1e8),
    }) as any;
  },
  [RenChain.polygon]: (context: BurnMachineContext<any, any>) => {
    const { network } = context.tx;
    return new Polygon(providers.polygon, network).Account({
      address: context.tx.userAddress,
      value: String(Number(context.tx.targetAmount) * 1e8),
    }) as any;
  },
});

export const burnChainClassMap = {
  [RenChain.ethereum]: Ethereum,
  [RenChain.binanceSmartChain]: BinanceSmartChain,
  [RenChain.fantom]: Fantom,
  [RenChain.polygon]: Polygon,
};

export const releaseChainMap: any = {
  [RenChain.bitcoin]: (context: BurnMachineContext<any, any>) => {
    return Bitcoin().Address(context.tx.destAddress) as any;
  },
  [RenChain.zcash]: (context: BurnMachineContext<any, any>) => {
    return Zcash().Address(context.tx.destAddress) as any;
  },
  [RenChain.bitcoinCash]: (context: BurnMachineContext<any, any>) => {
    return BitcoinCash().Address(context.tx.destAddress) as any;
  },
  [RenChain.dogecoin]: (context: BurnMachineContext<any, any>) => {
    return Dogecoin().Address(context.tx.destAddress) as any;
  },
};

export const releaseChainClassMap = {
  [RenChain.bitcoin]: Bitcoin,
  [RenChain.zcash]: Zcash,
  [RenChain.bitcoinCash]: BitcoinCash,
  [RenChain.dogecoin]: Dogecoin,
};

export const chainsClassMap = { ...burnChainClassMap, ...releaseChainClassMap };

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

  return getRenJs(network)
    .getFees({
      asset: lockedCurrency,
      from: From(),
      to: To(provider, network),
    })
    .then(mapFees);
};
