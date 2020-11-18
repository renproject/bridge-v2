import { Ethereum } from "@renproject/chains";
import { RenNetwork } from "@renproject/interfaces";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { WalletStatus } from "../../components/utils/types";
import { useSelectedChainWallet } from "../../providers/multiwallet/multiwalletHooks";
import { mintChainClassMap } from "../../services/rentx";
import {
  BridgeChain,
  BridgeCurrency,
  getChainConfig,
} from "../../utils/assetConfigs";
import { $network } from "../network/networkSlice";
import { $chain, AssetBalance } from "./walletSlice";

export const bridgeChainToMultiwalletChain = (chainSymbol: BridgeChain) => {
  switch (chainSymbol) {
    case BridgeChain.BTCC:
      return "bitcoin";
    case BridgeChain.BNCC:
      return "bsc";
    case BridgeChain.ETHC:
      return "ethereum";
    default:
      return "unknown";
  }
};
export const multiwalletChainToBridgeChain = (chain: string) => {
  switch (chain) {
    case "bitcoin":
      return BridgeChain.BTCC;
    case "bsc":
      return BridgeChain.BNCC;
    case "ethereum":
      return BridgeChain.ETHC;
    default:
      return BridgeChain.UNKNOWNC;
  }
};

export const useFetchAssetBalance = () => {
  const bridgeChain = useSelector($chain);
  const { status, provider, account } = useSelectedChainWallet();
  const bridgeChainConfig = getChainConfig(bridgeChain);
  const network = useSelector($network);
  const Chain = (mintChainClassMap as any)[bridgeChainConfig.rentxName];
  console.log(bridgeChain, bridgeChainConfig);

  const fetchAssetBalance = useMemo(
    () => (asset: string) => {
      if (provider && account && status === WalletStatus.CONNECTED) {
        const chain = Chain(provider, network);
        return chain.getBalance(asset, account).then((balance: any) => {
          return balance.toNumber() / 100000000;
        });
      } else {
        return Promise.resolve(null);
      }
    },
    [Chain, account, network, provider, status]
  );
  return { fetchAssetBalance };
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
