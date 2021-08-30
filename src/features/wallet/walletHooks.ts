import { RenNetwork } from "@renproject/interfaces";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  WalletConnectionStatusType,
  WalletStatus,
} from "../../components/utils/types";
import { mintChainClassMap, releaseChainClassMap } from "../../services/rentx";
import {
  BridgeChain,
  BridgeCurrency,
  BridgeWallet,
  getChainConfig,
  getCurrencyConfig,
  toMintedCurrency,
} from "../../utils/assetConfigs";
import { $renNetwork } from "../network/networkSlice";
import { $multiwalletChain } from "./walletSlice";

type WalletData = ReturnType<typeof useMultiwallet> & {
  account: string;
  status: WalletConnectionStatusType;
  walletConnected: boolean;
  provider: any;
  symbol: BridgeWallet;
  deactivateConnector: () => void;
};

const resolveWallet = (provider: any) => {
  if (provider?.isMetaMask) {
    return BridgeWallet.METAMASKW;
  }

  if (provider?.wallet?._providerUrl?.href?.includes("sollet")) {
    return BridgeWallet.SOLLETW;
  }

  if (provider?.wallet) {
    return BridgeWallet.PHANTOMW;
  }

  if (provider?.chainId === "0x61" || provider?.chainId?.indexOf("Binance")) {
    return BridgeWallet.BINANCESMARTW;
  }

  if (provider?.isMewConnect || provider?.isMEWConnect) {
    return BridgeWallet.MEWCONNECTW;
  }

  return BridgeWallet.UNKNOWNW;
};

type UseWallet = (chain: string) => WalletData;

export const useWallet: UseWallet = (chain) => {
  const {
    enabledChains,
    targetNetwork,
    activateConnector,
    setTargetNetwork,
  } = useMultiwallet();
  const { account = "", status = "disconnected" } =
    enabledChains?.[chain] || {};
  const provider = enabledChains?.[chain]?.provider;
  const symbol = resolveWallet(provider);
  const emptyFn = () => {};
  const deactivateConnector =
    enabledChains[chain]?.connector.deactivate || emptyFn;

  return {
    account,
    status,
    walletConnected: status === WalletStatus.CONNECTED,
    provider,
    symbol,
    targetNetwork,
    enabledChains,
    activateConnector,
    setTargetNetwork,
    deactivateConnector,
  } as WalletData;
};

export const useSelectedChainWallet = () => {
  const multiwalletChain = useSelector($multiwalletChain);
  return useWallet(multiwalletChain);
};

export const useSyncMultiwalletNetwork = () => {
  const { targetNetwork, setTargetNetwork } = useSelectedChainWallet();
  const renNetwork = useSelector($renNetwork);
  useEffect(() => {
    if (renNetwork !== targetNetwork) {
      setTargetNetwork(
        renNetwork.includes("mainnet")
          ? RenNetwork.Mainnet
          : renNetwork.includes("testnet")
          ? RenNetwork.Testnet
          : renNetwork
      );
    }
  }, [renNetwork, setTargetNetwork, targetNetwork]);
};

export const useReleaseChainHelpers = (
  network: string,
  chainRentxName: string
) => {
  const helpers = useMemo(() => {
    let validateAddress = (address: any) => true;
    const ChainClass = (releaseChainClassMap as any)[chainRentxName];
    if (ChainClass) {
      const chain = ChainClass();
      validateAddress = (address: any) => {
        return chain.utils.addressIsValid(address, network);
      };
      console.log(chain);
    }
    return { validateAddress };
  }, [chainRentxName, network]);
  console.log(helpers);
  return helpers;
};

export const useRenAssetHelpers = (
  chain: BridgeChain,
  network: string,
  provider: any,
  nativeCurrency: BridgeCurrency
) => {
  const [decimals, setDecimals] = useState(null);
  const [address, setAddress] = useState("");
  const chainConfig = getChainConfig(chain);
  const mintCurrencyConfig = getCurrencyConfig(
    toMintedCurrency(nativeCurrency)
  );
  const mintCurrencyName = mintCurrencyConfig.short;

  useEffect(() => {
    const ChainClass = (mintChainClassMap as any)[chainConfig.rentxName];
    if (ChainClass && network && provider) {
      const chainInstance = ChainClass(provider, network);
      chainInstance
        .resolveTokenGatewayContract(nativeCurrency.toUpperCase())
        .then(setAddress)
        .catch(console.error);

      chainInstance
        .assetDecimals(nativeCurrency.toUpperCase())
        .then(setDecimals)
        .catch(console.error);
    }
  }, [chainConfig.rentxName, network, provider, nativeCurrency]);

  const addToken = useMemo(() => {
    if (
      !provider ||
      !provider.isMetaMask ||
      address === "" ||
      decimals === null
    ) {
      return null;
    }
    const params = {
      type: "ERC20",
      options: {
        address,
        decimals,
        symbol: mintCurrencyName,
        image: `https://bridge.renproject.io/tokens/${mintCurrencyName}.svg`,
      },
    };
    return () =>
      provider.request({
        method: "wallet_watchAsset",
        params,
      });
  }, [address, decimals, provider, mintCurrencyName]);

  return { address, decimals, addToken };
};

export const useSwitchChainHelpers = (
  chain: BridgeChain,
  network: string,
  provider: any
) => {
  const chainConfig = getChainConfig(chain);

  const addOrSwitchChain = useMemo(() => {
    const ChainClass = (mintChainClassMap as any)[chainConfig.rentxName];
    if (ChainClass && network && provider) {
      const nativeCurrencyConfig = getCurrencyConfig(
        chainConfig.nativeCurrency
      );
      const chainInstance = ChainClass(provider, network);
      const details = chainInstance.renNetworkDetails;
      const chainId = "0x" + details.networkID.toString(16);
      const chainName = details.chainLabel;
      const rpcUrl = details.publicProvider() || details.infura;
      const rpcUrls = [rpcUrl];
      const blockExplorerUrls = [details.etherscan];

      const params = [
        {
          chainId,
          chainName,
          rpcUrls,
          blockExplorerUrls,
          nativeCurrency: {
            name: nativeCurrencyConfig.full,
            symbol: nativeCurrencyConfig.short,
            decimals: nativeCurrencyConfig.decimals || 0,
          },
        },
      ];
      console.log(params);
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
  }, [network, provider, chainConfig.rentxName, chainConfig.nativeCurrency]);

  return { addOrSwitchChain };
};
