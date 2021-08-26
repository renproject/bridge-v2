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

export const getMintAssetTokenAddress = (
  chain: BridgeChain,
  asset: string,
  provider: any,
  network: any
) => {
  if (!asset) {
    return 8;
  }
  const chainConfig = getChainConfig(chain);
  return (mintChainClassMap[
    chainConfig.rentxName as keyof typeof mintChainClassMap
  ](provider, network) as any).getTokenContractAddress(asset.toUpperCase());
};

export const useRenTokenHelpers = (
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
    if (ChainClass) {
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
  }, [chainConfig.rentxName, network, provider]);

  (window as any).p3 = provider;

  const addToken = useMemo(() => {
    if (!provider.isMetaMask || address === "" || decimals === null) {
      return () => {};
    }
    const params = {
      type: "ERC20",
      options: {
        address,
        decimals,
        symbol: mintCurrencyName,
      },
    };
    console.log(params);
    return () => provider.request({ method: "wallet_watchAsset", params });
  }, [address, decimals, provider, mintCurrencyName]);

  return { address, decimals, addToken };
};
