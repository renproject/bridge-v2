import { Ethereum } from "@renproject/chains";
import { RenNetwork } from "@renproject/interfaces";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSelectedChainWallet } from "../../providers/multiwallet/multiwalletHooks";
import { mintChainClassMap } from "../../services/rentx";
import {
  BridgeCurrency,
  getChainConfig,
  toReleasedCurrency,
} from "../../utils/assetConfigs";
import { $network } from "../network/networkSlice";
import {
  $chain,
  addOrUpdateBalance,
  AssetBalance,
  resetBalances,
} from "./walletSlice";

export const useFetchBalances = () => {
  const dispatch = useDispatch();
  const bridgeChain = useSelector($chain);
  const { walletConnected, provider, account } = useSelectedChainWallet();
  const bridgeChainConfig = getChainConfig(bridgeChain);
  const network = useSelector($network);
  const Chain = (mintChainClassMap as any)[bridgeChainConfig.rentxName];

  useEffect(() => {
    if (!walletConnected) {
      dispatch(resetBalances());
    }
  }, [dispatch, walletConnected]);

  const fetchAssetBalance = useCallback(
    (asset: string) => {
      if (provider && account && walletConnected) {
        const chain = Chain(provider, network);
        return chain.getBalance(asset, account).then((balance: any) => {
          return balance.toNumber() / 100000000;
        });
      } else {
        return Promise.resolve(null);
      }
    },
    [Chain, account, network, provider, walletConnected]
  );

  const fetchAssetsBalances = useCallback(
    (currencySymbols) => {
      console.log("refetching");
      if (!walletConnected) {
        return;
      }
      for (const currencySymbol of currencySymbols) {
        const sourceCurrencySymbol = toReleasedCurrency(currencySymbol);
        fetchAssetBalance(sourceCurrencySymbol).then((balance: any) => {
          console.log("fab", balance);
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

export const fetchAssetBalance = (
  provider: any,
  account: string,
  asset: string
) => {
  const chain = Ethereum(provider, RenNetwork.Testnet);
  return chain.getBalance(asset, account).then((balance) => {
    return balance.toNumber() / 100000000;
  });
};

export const getAssetBalance = (
  balances: Array<AssetBalance>,
  symbol: BridgeCurrency
) => {
  const balanceEntry = balances.find((entry) => entry.symbol === symbol);
  return balanceEntry?.balance;
};
