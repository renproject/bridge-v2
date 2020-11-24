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
    const { destAddress, destChain, network } = context.tx;
    const { providers } = context;

    return Ethereum(providers[destChain], network).Account({
      address: destAddress,
    });
  },
  [RenChain.binanceSmartChain]: (context: GatewayMachineContext) => {
    const { destAddress, destChain, network } = context.tx;
    const { providers } = context;
    return new BinanceSmartChain(providers[destChain], network).Account({
      address: destAddress,
    });
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
  console.log(lockedCurrency);

  const lockedCurrencyChain = getChainConfig(lockedCurrencyConfig.sourceChain);

  console.log(lockedCurrencyChain.rentxName, network);
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

export const burnChainMap: BurnMachineContext["fromChainMap"] = {
  [RenChain.ethereum]: (context) => {
    return Ethereum(context.providers.ethereum, context.tx.network).Account({
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
  const burnedCurrencyConfig = getCurrencyConfig(burnedCurrency);
  const burnedCurrencyChain = getChainConfig(burnedCurrencyConfig.sourceChain);
  const releasedCurrency = toReleasedCurrency(burnedCurrency);
  const releasedCurrencyConfig = getCurrencyConfig(releasedCurrency);
  const releasedCurrencyChain = getChainConfig(
    releasedCurrencyConfig.sourceChain
  );

  console.log(releasedCurrency);
  const From = (burnChainClassMap as any)[burnedCurrencyChain.rentxName];
  const To = (releaseChainClassMap as any)[releasedCurrencyChain.rentxName];
  return getRenJs(network)
    .getFees({
      asset: releasedCurrency,
      from: From(provider, network),
      to: To(),
    })
    .then(mapFees);
};
