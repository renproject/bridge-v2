// A mapping of how to construct parameters for host chains,
// based on the destination network
import { Bitcoin, BitcoinCash, Ethereum, Zcash } from '@renproject/chains'
import { RenNetwork } from '@renproject/interfaces'
import { BurnMachineContext, GatewayMachineContext } from '@renproject/ren-tx'
import { mapFees } from '../features/fees/feesUtils'
import {
  BridgeCurrency,
  getChainConfig,
  getCurrencyConfig,
  toMintedCurrency,
  toReleasedCurrency,
} from '../utils/assetConfigs'
import { getRenJs } from './renJs'

export const lockChainMap = {
  bitcoin: () => Bitcoin(),
  zcash: () => Zcash(),
  bitcoinCash: () => BitcoinCash(),
};

export const mintChainMap = {
  // binanceSmartChain: (context: any) => {
  //   const { destAddress, destNetwork } = context.tx;
  //   const { providers } = context;
  //   return new BinanceSmartChain(providers[destNetwork]).Account({
  //     address: destAddress,
  //   });
  // },
  ethereum: (context: GatewayMachineContext) => {
    const { destAddress, destChain, network } = context.tx;
    const { providers } = context;

    return Ethereum(providers[destChain], network).Account({
      address: destAddress,
    });
  },
};

export const mintChainMapClass = {
  ethereum: Ethereum,
};

export const getLockAndMintFees = (
  lockedCurrency: BridgeCurrency,
  provider: any,
  network: RenNetwork
) => {
  const lockedCurrencyConfig = getCurrencyConfig(lockedCurrency);
  const lockedCurrencyChain = getChainConfig(lockedCurrencyConfig.chain);
  const mintedCurrency = toMintedCurrency(lockedCurrency);
  const mintedCurrencyConfig = getCurrencyConfig(mintedCurrency);
  const mintedCurrencyChain = getChainConfig(mintedCurrencyConfig.chain);

  const From = (lockChainMap as any)[lockedCurrencyChain.rentxName];
  const To = (mintChainMapClass as any)[mintedCurrencyChain.rentxName];
  return getRenJs()
    .getFees({
      asset: lockedCurrency,
      from: From(),
      to: To(provider, network),
    })
    .then(mapFees);
};

export const burnChainMap: BurnMachineContext["fromChainMap"] = {
  ethereum: (context) => {
    return Ethereum(context.providers.ethereum, context.tx.network).Account({
      address: context.tx.userAddress,
      value: context.tx.suggestedAmount,
    }) as any;
  },
};

export const burnChainClassMap = {
  ethereum: Ethereum,
};

export const releaseChainMap: BurnMachineContext["toChainMap"] = {
  bitcoin: (context) => {
    return Bitcoin().Address(context.tx.destAddress) as any;
  },
};

export const releaseChainClassMap = {
  bitcoin: Bitcoin,
  zcash: Zcash,
  bitcoinCash: BitcoinCash,
};

export const getBurnAndReleaseFees = (
  burnedCurrency: BridgeCurrency,
  provider: any,
  network: RenNetwork
) => {
  const burnedCurrencyConfig = getCurrencyConfig(burnedCurrency);
  const burnedCurrencyChain = getChainConfig(burnedCurrencyConfig.chain);
  const releasedCurrency = toReleasedCurrency(burnedCurrency);
  const releasedCurrencyConfig = getCurrencyConfig(releasedCurrency);
  const releasedCurrencyChain = getChainConfig(releasedCurrencyConfig.chain);

  console.log(releasedCurrency);
  const From = (burnChainClassMap as any)[burnedCurrencyChain.rentxName];
  const To = (releaseChainClassMap as any)[releasedCurrencyChain.rentxName];
  return getRenJs()
    .getFees({
      asset: releasedCurrency,
      from: From(provider, network),
      to: To(),
    })
    .then(mapFees);
};

