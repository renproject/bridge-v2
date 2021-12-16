import {
  Bitcoin,
  BitcoinBaseChain,
  BitcoinCash,
  Dogecoin,
  Zcash,
} from "@renproject/chains-bitcoin";

import {
  Arbitrum,
  Avalanche,
  BinanceSmartChain,
  Ethereum,
  EthereumBaseChain,
  EthProvider,
  EvmNetworkConfig,
  Fantom,
  Polygon,
} from "@renproject/chains-ethereum";
import { RenNetwork, Chain as GatewayChain } from "@renproject/utils";
import { Chain } from "@renproject/chains";
import { providers } from "ethers";
import { supportedEthereumChains } from "../../utils/chainsConfig";

export interface ChainInstance {
  chain: GatewayChain;
  connectionRequired?: boolean;
  accounts?: string[];
}

export type ChainInstanceMap = Record<Chain, ChainInstance>;

interface EVMConstructor<EVM> {
  configMap: {
    [network in RenNetwork]?: EvmNetworkConfig;
  };

  new (renNetwork: RenNetwork, web3Provider: EthProvider): EVM;
}

export const getEthereumBaseChain = <EVM extends EthereumBaseChain>(
  ChainClass: EVMConstructor<EVM>,
  network: RenNetwork
): ChainInstance & {
  chain: EVM;
} => {
  const config = ChainClass.configMap[network];
  if (!config) {
    throw new Error(`No configuration for ${ChainClass.name} on ${network}.`);
  }

  let rpcUrl = config.network.rpcUrls[0];
  if (process.env.REACT_APP_INFURA_KEY) {
    for (const url of config.network.rpcUrls) {
      if (url.match(/^https:\/\/.*\$\{INFURA_API_KEY\}/)) {
        rpcUrl = url.replace(
          /\$\{INFURA_API_KEY\}/,
          process.env.REACT_APP_INFURA_KEY
        );
        break;
      }
    }
  }

  const provider = new providers.JsonRpcProvider(rpcUrl);

  return {
    chain: new ChainClass(network, {
      provider,
    }),
    connectionRequired: true,
    accounts: [],
  };
};

const getBitcoinBaseChain = <BTC extends BitcoinBaseChain>(ChainClass: BTC) => {
  return {
    chain: ChainClass,
  };
};

export const getDefaultChains = (network: RenNetwork): ChainInstanceMap => {
  const ethereumBaseChains = {
    [Chain.Ethereum]: getEthereumBaseChain(Ethereum, network),
    [Chain.BinanceSmartChain]: getEthereumBaseChain(BinanceSmartChain, network),
    [Chain.Polygon]: getEthereumBaseChain(Polygon, network),
    [Chain.Avalanche]: getEthereumBaseChain(Avalanche, network),
    [Chain.Arbitrum]: getEthereumBaseChain(Fantom, network),
    [Chain.Fantom]: getEthereumBaseChain(Arbitrum, network),
  };

  const bitcoinBaseChains = {
    [Chain.BitcoinCash]: getBitcoinBaseChain(new BitcoinCash(network)),
    [Chain.Dogecoin]: getBitcoinBaseChain(new Dogecoin(network)),
    [Chain.Bitcoin]: getBitcoinBaseChain(new Bitcoin(network)),
    [Chain.Zcash]: getBitcoinBaseChain(new Zcash(network)),
  };

  return {
    ...ethereumBaseChains,
    ...bitcoinBaseChains,
  } as unknown as ChainInstanceMap;
};

export const alterEthereumBaseChainSigner = (
  chains: ChainInstanceMap,
  signer: any
) => {
  supportedEthereumChains.forEach((chainName) => {
    if (chains[chainName]?.chain?.withProvider) {
      chains[chainName].chain.withProvider!({
        signer,
      });
    } else {
      throw new Error(
        `Unable to find chain ${chainName} in chains ${Object.keys(chains).join(
          ", "
        )}`
      );
    }
  });
};
