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
        // TODO: crit update when on production
        image: `https://deploy-preview-116--bridge-v2-staging.netlify.app/tokens/${mintCurrencyName}.svg`,
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

// TODO: finish
// const params = [
//   {
//     chainId: "0x1e",
//     chainName: "RSK Mainnet",
//     nativeCurrency: {
//       name: "RSK BTC",
//       symbol: "RBTC",
//       decimals: 18,
//     },
//     rpcUrls: ["https://public-node.rsk.co"],
//     blockExplorerUrls: ["https://explorer.rsk.co"],
//   },
// ];
//
// provider
//   .request({ method: "wallet_addEthereumChain", params })
//   .then(() => console.log("Success"))
//   .catch((error: Error) => console.log("Error", error.message));

export const useSwitchChainHelpers = (
  chain: BridgeChain,
  network: string,
  provider: any
) => {
  const chainConfig = getChainConfig(chain);

  useEffect(() => {
    const ChainClass = (mintChainClassMap as any)[chainConfig.rentxName];
    if (ChainClass && network && provider) {
      console.log(provider, chainConfig.rentxName, network);
      const chainInstance = ChainClass(provider, network);
      (window as any).c4 = chainInstance;
    }
  }, [chainConfig.rentxName, network, provider]);

  (window as any).p3 = provider;

  const addOrSwitchChain = useMemo(() => {
    const ChainClass = (mintChainClassMap as any)[chainConfig.rentxName];
    if (ChainClass && network && provider) {
      console.log(provider, chainConfig.rentxName, network);
      const chainInstance = ChainClass(provider, network);
      console.log(chainInstance);
      const details = chainInstance.renNetworkDetails;
      console.log(details);
      const chainId = "0x" + details.networkID.toString(16);
      const chainName = details.chainLabel;
      const rpcUrls = [details.infura];
      const blockExplorerUrls = [details.etherscan];

      const params = [
        {
          chainId,
          chainName,
          rpcUrls,
          blockExplorerUrls,
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
          console.log("catched", error);
          // This error code indicates that the chain has not been added to MetaMask.
          if (error.code === 4902) {
            console.log("fallback");
            await provider.request({
              method: "wallet_addEthereumChain",
              params,
            });
          }
          // handle other "switch" errors
        }
      };
    } else {
      return null;
    }
  }, [chainConfig.rentxName, network, provider]);

  const helpers = { addOrSwitchChain };
  (window as any).h4 = helpers;
  return helpers;
};
