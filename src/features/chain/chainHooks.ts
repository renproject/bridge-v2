import { useEffect, useMemo, useState } from "react";
import { mintChainClassMap, releaseChainClassMap } from "../../services/rentx";
import {
  BridgeChain,
  BridgeCurrency,
  getChainConfig,
  getCurrencyConfig,
  toMintedCurrency,
} from "../../utils/assetConfigs";

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
      console.log(provider, chainConfig.rentxName, network);
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

  (window as any).p3 = provider;

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
    console.log(params);
    return () =>
      provider.request({
        method: "wallet_watchAsset",
        params,
      });
  }, [address, decimals, provider, mintCurrencyName]);

  const helpers = { address, decimals, addToken };
  (window as any).h3 = helpers;
  return helpers;
};

export const useSwitchChainHelpers = (
  chain: BridgeChain,
  network: string,
  provider: any
) => {
  const chainConfig = getChainConfig(chain);

  (window as any).p3 = provider;

  const addOrSwitchChain = useMemo(() => {
    const ChainClass = (mintChainClassMap as any)[chainConfig.rentxName];
    if (ChainClass && network && provider) {
      console.log(provider, chainConfig.rentxName, network);
      const nativeCurrencyConfig = getCurrencyConfig(
        chainConfig.nativeCurrency
      );
      const chainInstance = ChainClass(provider, network);
      (window as any).eci = chainInstance;
      console.log(chainInstance);
      const details = chainInstance.renNetworkDetails;
      console.log(details);
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
