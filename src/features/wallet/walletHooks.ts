import { Chain } from "@renproject/chains";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { RenNetwork } from "@renproject/utils";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Wallet } from "../../utils/walletsConfig";
import { useChains } from "../network/networkHooks";
import { $network } from "../network/networkSlice";
import { $wallet, setChain } from "./walletSlice";
import { WalletStatus } from "./walletUtils";

type WalletData = ReturnType<typeof useMultiwallet> & {
  account: string;
  status: WalletStatus;
  connected: boolean;
  provider: any;
  wallet: Wallet;
  deactivateConnector: () => void;
};

const resolveWalletByProvider = (provider: any) => {
  if (!provider) {
    return Wallet.MetaMask; // TODO: is it valid ?
  }
  if (provider?.isMetaMask) {
    return Wallet.MetaMask;
  }
  if (provider?.wallet?._providerUrl?.href?.includes("sollet")) {
    return Wallet.Sollet;
  }
  if (provider?.wallet) {
    return Wallet.Phantom;
  }
  if (provider?.chainId === "0x61" || provider?.chainId?.indexOf("Binance")) {
    return Wallet.BinanceSmartChain;
  }
  if (provider?.isMewConnect || provider?.isMEWConnect) {
    return Wallet.MewConnect;
  }
  console.warn("Unresolved wallet", provider);
  return Wallet.MetaMask; // throw error?
};

type UseWallet = (chain: Chain) => WalletData;

export const useWallet: UseWallet = (chain) => {
  const { enabledChains, targetNetwork, activateConnector, setTargetNetwork } =
    useMultiwallet();
  const { account = "", status = WalletStatus.Disconnected } =
    enabledChains?.[chain] || {};
  const provider = enabledChains?.[chain]?.provider;
  const wallet = resolveWalletByProvider(provider);
  const emptyFn = () => {};
  const deactivateConnector =
    enabledChains[chain]?.connector.deactivate || emptyFn;

  (window as any).p = provider;
  return {
    account,
    status,
    connected: status === WalletStatus.Connected,
    provider,
    wallet,
    targetNetwork,
    enabledChains,
    activateConnector,
    setTargetNetwork,
    deactivateConnector,
  } as WalletData;
};

export const useCurrentChainWallet = () => {
  const { chain } = useSelector($wallet);
  return useWallet(chain);
};

export const useSyncWalletChain = (chain: Chain) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setChain(chain));
  }, [dispatch, chain]);
};

export const useSyncWalletNetwork = () => {
  const { chain } = useSelector($wallet);
  const { network } = useSelector($network);
  const { targetNetwork, setTargetNetwork } = useWallet(chain);
  useEffect(() => {
    if (network !== targetNetwork) {
      setTargetNetwork(
        network.includes("mainnet")
          ? RenNetwork.Mainnet
          : network.includes("testnet")
          ? RenNetwork.Testnet
          : network
      );
    }
  }, [network, setTargetNetwork, targetNetwork]);
};

export const useSwitchChainHelpers = (
  chain: Chain,
  network: RenNetwork,
  provider: any
) => {
  const chains = useChains(network);

  const addOrSwitchChain = useMemo(() => {
    const chainInstance = chains[chain];
    const networkData = (chainInstance.chain as any).network.network;
    if (networkData) {
      const { chainId, chainName, rpcUrls, blockExplorerUrls, nativeCurrency } =
        networkData;
      const params: any = [
        {
          chainId,
          chainName,
          rpcUrls,
          blockExplorerUrls,
          nativeCurrency,
        },
      ];

      return async () => {
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId }],
          });
        } catch (error) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (error.code === 4902) {
            await provider.request({
              method: "wallet_addEthereumChain",
              params,
            });
          } else {
            throw error;
          }
        }
      };
    } else {
      return null;
    }
  }, [chains, chain, provider]);

  return { addOrSwitchChain };
};
