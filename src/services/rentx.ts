// A mapping of how to construct parameters for host chains,
// based on the destination network
import { Bitcoin, BitcoinCash, Ethereum, Zcash } from "@renproject/chains";
import { RenNetwork } from "@renproject/interfaces";
import { BurnMachineContext, GatewayMachineContext } from "@renproject/ren-tx";
import { useEffect, useState } from "react";
import { WalletStatus } from "../components/utils/types";
import { SimpleFee } from "../features/renData/renDataUtils";
import { TxType } from "../features/transactions/transactionsUtils";
import { useSelectedChainWallet } from "../providers/multiwallet/multiwalletHooks";
import {
  BridgeCurrency,
  getChainConfig,
  getCurrencyConfig,
  toMintedCurrency,
  toReleasedCurrency,
} from "../utils/assetConfigs";
import { getRenJs } from "./renJs";

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

const mapFees = (rates: any) => {
  return {
    mint: rates.mint,
    burn: rates.burn,
    lock: rates.lock ? rates.lock.toNumber() : 0,
    release: rates.release ? rates.release.toNumber() : 0,
  } as SimpleFee;
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

export const useFetchFees = (
  lockedCurrency: BridgeCurrency,
  txType: TxType
) => {
  const fetchFees =
    txType === TxType.MINT ? getLockAndMintFees : getBurnAndReleaseFees;
  const { provider, status } = useSelectedChainWallet();
  const network = RenNetwork.Testnet; //TODO: getFromSelector;
  const initialFees: SimpleFee = {
    mint: 0,
    burn: 0,
    lock: 0,
    release: 0,
  };
  const [fees, setFees] = useState(initialFees);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    console.log("fetching fees");
    if (provider && status === WalletStatus.CONNECTED) {
      fetchFees(lockedCurrency, provider, network).then((feeRates) => {
        setPending(false);
        setFees(feeRates);
      });
    }
  }, [lockedCurrency, provider, status, network, fetchFees]);

  return { fees, pending };
};
