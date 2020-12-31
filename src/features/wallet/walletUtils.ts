import { RenNetwork } from "@renproject/interfaces";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSelectedChainWallet } from "../../providers/multiwallet/multiwalletHooks";
import { mintChainClassMap } from "../../services/rentx";
import {
  BridgeCurrency,
  getChainConfig,
  getCurrencyConfig,
  toReleasedCurrency,
} from "../../utils/assetConfigs";
import { $networks } from "../network/networkSlice";
import {
  $chain,
  addOrUpdateBalance,
  AssetBalance,
  resetBalances,
} from "./walletSlice";

export const isSupportedByCurrentNetwork = (
  currency: BridgeCurrency,
  renNetwork: RenNetwork
) => {
  const currencyConfig = getCurrencyConfig(currency);
  if (currencyConfig.networks) {
    return currencyConfig.networks.indexOf(renNetwork) > -1;
  }
  return true;
};

export const useFetchBalances = () => {
  const dispatch = useDispatch();
  const bridgeChain = useSelector($chain);
  const {
    walletConnected,
    status,
    provider,
    account,
    targetNetwork,
  } = useSelectedChainWallet();
  const { renNetwork } = useSelector($networks);
  const bridgeChainConfig = getChainConfig(bridgeChain);
  const Chain = (mintChainClassMap as any)[bridgeChainConfig.rentxName];

  useEffect(() => {
    if (!walletConnected) {
      dispatch(resetBalances());
    }
  }, [dispatch, walletConnected]);

  const fetchAssetBalance = useCallback(
    (currency: BridgeCurrency) => {
      if (
        provider &&
        account &&
        walletConnected &&
        isSupportedByCurrentNetwork(currency, renNetwork) &&
        targetNetwork === renNetwork
      ) {
        console.log("fetching", currency, renNetwork, targetNetwork, status);
        const chain = Chain(provider, renNetwork);
        return chain.getBalance(currency, account).then((balance: any) => {
          return balance.toNumber() / 100000000;
        });
      } else {
        return Promise.resolve(null);
      }
    },
    [
      Chain,
      account,
      renNetwork,
      provider,
      walletConnected,
      targetNetwork,
      status,
    ]
  );

  const fetchAssetsBalances = useCallback(
    (currencySymbols) => {
      if (!walletConnected) {
        return;
      }
      for (const currencySymbol of currencySymbols) {
        const sourceCurrencySymbol = toReleasedCurrency(currencySymbol);
        fetchAssetBalance(sourceCurrencySymbol).then((balance: any) => {
          if (balance === null) {
            return;
          }
          dispatch(
            addOrUpdateBalance({
              symbol: currencySymbol,
              balance,
            })
          );
        });
      }
    },
    [dispatch, fetchAssetBalance, walletConnected]
  );

  return { fetchAssetBalance, fetchAssetsBalances };
};

export const getAssetBalance = (
  balances: Array<AssetBalance>,
  symbol: BridgeCurrency
) => {
  const balanceEntry = balances.find((entry) => entry.symbol === symbol);
  return balanceEntry?.balance;
};
