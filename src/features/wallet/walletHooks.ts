import { ethers } from "ethers";
import { Asset, Chain } from "@renproject/chains";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { ContractChain, RenNetwork } from "@renproject/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cancelable } from "cancelable-promise";
import { getRenAssetName } from "../../utils/assetsConfig";
import { env } from "../../constants/environmentVariables";
import { Wallet } from "../../utils/walletsConfig";
import {
  useChainAssetAddress,
  useChainInstanceAssetDecimals,
} from "../gateway/gatewayHooks";
import { useChains, useCurrentNetworkChains } from "../network/networkHooks";
import { $network } from "../network/networkSlice";
import {
  $wallet,
  setChain,
  setPickerOpened,
  setToAddressSanctioned,
  setFromAddressSanctioned,
} from "./walletSlice";
import { WalletStatus } from "./walletUtils";

type WalletData = ReturnType<typeof useMultiwallet> & {
  account: string;
  status: WalletStatus;
  connected: boolean;
  provider: any;
  wallet: Wallet;
  deactivateConnector: () => void;
  refreshConnector: () => void;
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
    resolved = Wallet.MyEtherWallet;
  } else {
    console.warn("Unresolved wallet", provider);
  }
  return resolved;
};

type UseWallet = (chain: Chain) => WalletData;

export const useWallet: UseWallet = (chain) => {
  const { enabledChains, targetNetwork, activateConnector, setTargetNetwork } =
    useMultiwallet();
  const { account = "", status = WalletStatus.Disconnected } =
    enabledChains?.[chain] || {};
  const provider = enabledChains?.[chain]?.provider;

  // TODO: crit this is faulty FIX this
  const wallet = resolveWalletByProvider(provider);

  const deactivateConnector = useCallback(() => {
    enabledChains[chain]?.connector.deactivate();
  }, [enabledChains, chain]);

  const refreshConnector = useCallback(() => {
    deactivateConnector();
    setTimeout(() => {
      enabledChains[chain]?.connector.activate();
    }, 2000);
  }, [enabledChains, chain, deactivateConnector]);

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
    refreshConnector,
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
        // image: `https://bridge.renproject.io/tokens/${renAssetName}.svg`,
        image: `https://ren-ui.netlify.app/assets/icons/tokens/wrapped/${renAssetName}.svg`,
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

// this will try to find window.solana wallet up to 5 seconds after page load
// solana wallet sometimes is not present after page load
export const useDirtySolanaWalletDetector = () => {
  const [count, setCount] = useState(0);
  const [found, setFound] = useState(Boolean((window as any).solana));
  const [isRunning, setIsRunning] = useState(!Boolean((window as any).solana));
  if (count > 5) {
    if (isRunning) {
      setIsRunning(false);
    }
  }
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => c + 1);
      if ((window as any).solana) {
        setFound(true);
        setIsRunning(false);
      }
    }, 1000);
    if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return found;
};

export const useEns = (address: string | undefined) => {
  const [ensName, setEnsName] = useState<string | null>();

  useEffect(() => {
    async function resolveENS() {
      if (address && ethers.utils.isAddress(address)) {
        let provider;
        if (env.INFURA_ID) {
          provider = new ethers.providers.StaticJsonRpcProvider(
            `https://mainnet.infura.io/v3/${env.INFURA_ID}`
          );
        } else {
          provider = ethers.getDefaultProvider(env.NETWORK);
        }
        const ensName = await provider.lookupAddress(address);
        setEnsName(ensName);
      }
    }
    resolveENS().catch((error) => {
      console.error(error);
    });
  }, [address]);

  return { ensName };
};

export type SanctionData = Array<{ address: string; isSanctioned: boolean }>;
const addressSanctionApiUrl = `https://api.trmlabs.com/public/v1/sanctions/screening`;

async function fetchAddressData(address: string) {
  const data = [
    {
      address,
    },
  ];
  // Default options are marked with *
  return fetch(addressSanctionApiUrl, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  }).then((response) => {
    const data = response.json();
    return data as unknown as SanctionData;
  });
}

export const useAddressScreening = (address: string, start: boolean) => {
  const [sanctioned, setSanctioned] = useState<boolean | null>(null);
  useEffect(() => {
    setSanctioned(null);
    if (!start) {
      return;
    }
    const promise = fetchAddressData(address).then((data) => {
      // console.log("sanction", data);
      const addressData = data[0];
      setSanctioned(addressData.isSanctioned);
    });
    const cancellable = cancelable(promise);
    return () => {
      cancellable.cancel();
    };
  }, [address, start]);

  return { sanctioned };
};

type UseSyncScreeningProps = {
  fromAddress: string;
  fromStart?: boolean;
  toAddress: string;
  toStart?: boolean;
};
export const useSyncScreening = ({
  fromAddress,
  fromStart = true,
  toAddress,
  toStart = true,
}: UseSyncScreeningProps) => {
  const dispatch = useDispatch();
  const { sanctioned: fromSanctioned } = useAddressScreening(
    fromAddress,
    fromStart
  );
  const { sanctioned: toSanctioned } = useAddressScreening(toAddress, toStart);

  useEffect(() => {
    dispatch(setFromAddressSanctioned(fromSanctioned));
    dispatch(setToAddressSanctioned(toSanctioned));
    return () => {
      dispatch(setFromAddressSanctioned(null));
      dispatch(setToAddressSanctioned(null));
    };
  }, [dispatch, fromSanctioned, toSanctioned]);
};
