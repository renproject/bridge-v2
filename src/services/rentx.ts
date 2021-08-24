// A mapping of how to construct parameters for host chains,
// based on the destination network
import { Filecoin } from "@renproject/chains-filecoin";
import {
  Bitcoin,
  BitcoinCash,
  Dogecoin,
  Zcash,
  DigiByte,
} from "@renproject/chains-bitcoin";
import {
  BinanceSmartChain,
  Ethereum,
  Fantom,
  Polygon,
  Avalanche,
  Arbitrum,
} from "@renproject/chains-ethereum";
import { Solana } from "@renproject/chains-solana";
import { Terra } from "@renproject/chains-terra";
import { RenNetwork } from "@renproject/interfaces";
import { BurnMachineContext, GatewayMachineContext } from "@renproject/ren-tx";
import { mapFees } from "../features/fees/feesUtils";
import { getReleaseAssetDecimals } from "../features/transactions/transactionsUtils";
import {
  BridgeCurrency,
  getChainConfig,
  getChainConfigByRentxName,
  getCurrencyConfig,
  RenChain,
  toReleasedCurrency,
} from "../utils/assetConfigs";
import { getRenJs } from "./renJs";
import { env } from "../constants/environmentVariables";

export const lockChainMap = {
  [RenChain.bitcoin]: () => Bitcoin(),
  [RenChain.zcash]: () => Zcash(),
  [RenChain.bitcoinCash]: () => BitcoinCash(),
  [RenChain.dogecoin]: () => Dogecoin(),
  [RenChain.digibyte]: () => DigiByte(),
  [RenChain.filecoin]: () => Filecoin(),
  [RenChain.terra]: () => Terra(),
};

export const getMintChainMap = (providers: any, timestamp = 0) => ({
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
  [RenChain.avalanche]: (context: GatewayMachineContext<any>) => {
    const { destAddress, network } = context.tx;

    return new Avalanche(providers.avalanche, network).Account({
      address: destAddress,
    }) as any;
  },
  [RenChain.solana]: (context: GatewayMachineContext<any>) => {
    const { network } = context.tx;

    const includeAddressInPayload = timestamp < env.V2_DEPRECATION_TIME;

    // Currently Solana will always mint to the connected provider's address
    return new Solana(providers.solana, network, {
      includeAddressInPayload,
    }) as any;
  },
  [RenChain.arbitrum]: (context: GatewayMachineContext<any>) => {
    const { destAddress, network } = context.tx;

    return new Arbitrum(providers.arbitrum, network).Account({
      address: destAddress,
    }) as any;
  },
});

export const mintChainClassMap = {
  [RenChain.ethereum]: Ethereum,
  [RenChain.binanceSmartChain]: BinanceSmartChain,
  [RenChain.fantom]: Fantom,
  [RenChain.polygon]: Polygon,
  [RenChain.avalanche]: Avalanche,
  [RenChain.solana]: Solana,
  [RenChain.arbitrum]: Arbitrum,
};

const buildBurner = (
  chain: keyof typeof burnChainClassMap,
  providers: any,
  context: BurnMachineContext<any, any>
) => {
  const burnClass = burnChainClassMap[chain](
    providers[chain],
    context.tx.network
  );
  const releaseChain = getChainConfigByRentxName(context.tx.destChain).symbol;

  let decimals = getReleaseAssetDecimals(releaseChain, context.tx.sourceAsset);

  if (chain === "solana" && decimals > 9) {
    decimals = 9;
  }

  const amount = String(
    Math.floor(Number(context.tx.targetAmount) * Math.pow(10, decimals))
  );
  return burnClass.Account({
    address: context.tx.userAddress,
    amount, // FIXME: solana uses amount, other chains use value
    value: amount,
  }) as any;
};

export const getBurnChainMap: any = (providers: any) =>
  Object.fromEntries(
    Object.keys(burnChainClassMap).map((chain: any) => {
      return [
        chain as keyof typeof burnChainClassMap,
        (context: BurnMachineContext<any, any>) => {
          return buildBurner(chain, providers, context);
        },
      ];
    })
  );

export const burnChainClassMap = {
  [RenChain.ethereum]: Ethereum,
  [RenChain.binanceSmartChain]: BinanceSmartChain,
  [RenChain.fantom]: Fantom,
  [RenChain.polygon]: Polygon,
  [RenChain.avalanche]: Avalanche,
  [RenChain.solana]: Solana,
  [RenChain.arbitrum]: Arbitrum,
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
  [RenChain.digibyte]: (context: BurnMachineContext<any, any>) => {
    return DigiByte().Address(context.tx.destAddress) as any;
  },
  [RenChain.filecoin]: (context: BurnMachineContext<any, any>) => {
    return Filecoin().Address(context.tx.destAddress) as any;
  },
  [RenChain.terra]: (context: BurnMachineContext<any, any>) => {
    return Terra().Address(context.tx.destAddress) as any;
  },
};

export const releaseChainClassMap = {
  [RenChain.bitcoin]: Bitcoin,
  [RenChain.zcash]: Zcash,
  [RenChain.bitcoinCash]: BitcoinCash,
  [RenChain.dogecoin]: Dogecoin,
  [RenChain.digibyte]: DigiByte,
  [RenChain.filecoin]: Filecoin,
  [RenChain.terra]: Terra,
  [RenChain.arbitrum]: Arbitrum,
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
