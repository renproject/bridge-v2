import { Asset, Chain } from "@renproject/chains";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { ContractChain, RenNetwork } from "@renproject/utils";
import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRenAssetName } from "../../utils/tokensConfig";

import { Wallet } from "../../utils/walletsConfig";
import {
  useChainAssetAddress,
  useChainInstanceAssetDecimals,
} from "../gateway/gatewayHooks";
import { useChains, useCurrentNetworkChains } from "../network/networkHooks";
import { $network } from "../network/networkSlice";
import { $wallet, setChain, setPickerOpened } from "./walletSlice";
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
  let resolved = Wallet.MetaMask;

  // TODO: we should persist wallet selection somewhere
  if (!provider) {
    resolved = Wallet.MetaMask; //default wallet
  } else if (provider?.isMetaMask) {
    resolved = Wallet.MetaMask;
  } else if (provider?.isCoinbaseWallet) {
    resolved = Wallet.Coinbase;
  } else if (provider?.wallet?._providerUrl?.href?.includes("sollet")) {
    resolved = Wallet.Sollet;
  } else if (provider?.wallet) {
    resolved = Wallet.Phantom;
  } else if (
    provider?.chainId === "0x61" ||
    provider?.chainId?.indexOf("Binance")
  ) {
    resolved = Wallet.BinanceSmartChain;
  } else if (provider?.isMewConnect || provider?.isMEWConnect) {
    resolved = Wallet.MewConnect;
  } else {
    console.warn("Unresolved wallet", provider);
  }
  console.log("wallet resolvied", resolved);
  return resolved;
};

type UseWallet = (chain: Chain) => WalletData;

export const useWallet: UseWallet = (chain) => {
  const { enabledChains, targetNetwork, activateConnector, setTargetNetwork } =
    useMultiwallet();
  const { account = "", status = WalletStatus.Disconnected } =
    enabledChains?.[chain] || {};
  const provider = enabledChains?.[chain]?.provider;
  // TODO: crit this is faulty
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

export const useWalletPicker = () => {
  const dispatch = useDispatch();
  const { pickerOpened } = useSelector($wallet);
  const handlePickerOpen = useCallback(() => {
    dispatch(setPickerOpened(true));
  }, [dispatch]);
  const handlePickerClose = useCallback(() => {
    dispatch(setPickerOpened(false));
  }, [dispatch]);
  return {
    handlePickerOpen,
    handlePickerClose,
    pickerOpened,
  };
};

export const useCurrentChain = () => {
  const { chain } = useSelector($wallet);
  return chain;
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
        } catch (error: any) {
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

export const useWalletAssetHelpers = (chain: Chain, asset: Asset | string) => {
  const chains = useCurrentNetworkChains();
  const { provider } = useWallet(chain);

  const renAssetName = getRenAssetName(asset);
  const chainInstance = chains[chain].chain;
  const { decimals } = useChainInstanceAssetDecimals(chainInstance, asset);
  const { address } = useChainAssetAddress(
    chainInstance as ContractChain,
    asset
  );

  const addToken = useMemo(() => {
    if (
      !provider ||
      !provider.isMetaMask ||
      address === null ||
      decimals === null
    ) {
      return null;
    }
    const params = {
      type: "ERC20",
      options: {
        address,
        decimals,
        symbol: renAssetName,
        image: `https://bridge.renproject.io/tokens/${renAssetName}.svg`, //TODO: change to ren-ui
      },
    };
    return () =>
      provider.request({
        method: "wallet_watchAsset",
        params,
      });
  }, [address, decimals, provider, renAssetName]);

  return { address, decimals, addToken };
};
