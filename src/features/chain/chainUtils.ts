import { Chain } from "@renproject/chains";
import {
  Bitcoin,
  BitcoinBaseChain,
  BitcoinCash,
  DigiByte,
  Dogecoin,
  Zcash,
} from "@renproject/chains-bitcoin";
import {
  Arbitrum,
  Avalanche,
  BinanceSmartChain,
  Ethereum,
  EthProvider,
  EvmNetworkConfig,
  Fantom,
  Polygon,
} from "@renproject/chains-ethereum";
import SolanaWallet from "@project-serum/sol-wallet-adapter";
import { Solana } from "@renproject/chains-solana";
import { Terra } from "@renproject/chains-terra";
import { SolanaConnector } from "@renproject/multiwallet-solana-connector";

import {
  Chain as GatewayChain,
  DepositChain,
  RenNetwork,
} from "@renproject/utils";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { ethers, providers } from "ethers";
import {
  contractChains,
  supportedEthereumChains,
} from "../../utils/chainsConfig";
import { EthereumBaseChain } from "../../utils/missingTypes";

export interface ChainInstance<C = GatewayChain> {
  chain: C;
  connectionRequired?: boolean;
  accounts?: string[];
}

export type ChainInstanceMap = Record<Chain, ChainInstance>;
export type PartialChainInstanceMap = Partial<ChainInstanceMap>;

interface EVMConstructor<EVM> {
  configMap: {
    [network in RenNetwork]?: EvmNetworkConfig;
  };

  new ({
    network,
    provider,
  }: {
    network: RenNetwork;
    provider: EthProvider;
  }): EVM;
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
    chain: new ChainClass({
      network,
      provider,
    }),
    connectionRequired: true,
    accounts: [],
  };
};

export const getSolanaChain = (
  network: RenNetwork
): ChainInstance & {
  chain: Solana;
} => {
  const solanaNetwork =
    network === RenNetwork.Mainnet ? "mainnet-beta" : "testnet";
  const rpcUrl = clusterApiUrl(solanaNetwork);
  const provider = new Connection(rpcUrl);
  console.log(rpcUrl);
  const signer =
    ((window as any).solana as SolanaWallet) ||
    new SolanaWallet(rpcUrl, network);
  console.log("solana signer", (window as any).solana, signer);
  console.log(signer);
  return {
    chain: new Solana({
      network,
      provider,
      signer,
    }),
    connectionRequired: true,
    accounts: [],
  };
};

const alterSolanaChainProviderSigner = (
  chainInstance: ChainInstance<Solana>,
  provider: SolanaConnector,
  alterProvider?: boolean
) => {
  if (alterProvider) {
    chainInstance.chain.withProvider(provider.connection);
  }
  chainInstance.chain.withSigner(provider.wallet as unknown as SolanaWallet);
};

const getBitcoinBaseChain = <BTC extends BitcoinBaseChain>(ChainClass: BTC) => {
  return {
    chain: ChainClass,
  };
};

const getDepositBaseChain = <DBC extends DepositChain>(ChainClass: DBC) => {
  return {
    chain: ChainClass,
  };
};

export const getDefaultChains = (network: RenNetwork): ChainInstanceMap => {
  const ethereumBaseChains = {
    [Chain.Ethereum]: getEthereumBaseChain(Ethereum, network),
    [Chain.BinanceSmartChain]: getEthereumBaseChain(BinanceSmartChain, network),
    [Chain.Polygon]: getEthereumBaseChain(Polygon, network),
    // [Chain.Goerli]: getEthereumBaseChain(Goerli, network),
    [Chain.Avalanche]: getEthereumBaseChain(Avalanche, network),
    [Chain.Arbitrum]: getEthereumBaseChain(Fantom, network),
    [Chain.Fantom]: getEthereumBaseChain(Arbitrum, network),
  };

  const bitcoinBaseChains = {
    [Chain.BitcoinCash]: getBitcoinBaseChain(new BitcoinCash({ network })),
    [Chain.Dogecoin]: getBitcoinBaseChain(new Dogecoin({ network })),
    [Chain.Bitcoin]: getBitcoinBaseChain(new Bitcoin({ network })),
    [Chain.Zcash]: getBitcoinBaseChain(new Zcash({ network })),
    [Chain.DigiByte]: getBitcoinBaseChain(new DigiByte({ network })),
  };

  const solanaBaseChains = {
    [Chain.Solana]: getSolanaChain(network),
  };

  const depositBaseChains = {
    // @ts-ignore
    [Chain.Terra]: getDepositBaseChain(new Terra({ network })),
  };
  return {
    ...ethereumBaseChains,
    ...bitcoinBaseChains,
    ...depositBaseChains,
    ...solanaBaseChains,
  } as unknown as ChainInstanceMap;
};

export const alterContractChainProviderSigner = (
  chains: PartialChainInstanceMap,
  alteredChain: Chain,
  provider: SolanaConnector | any,
  alterProvider?: boolean
) => {
  if (!provider) {
    console.error(`Altering failed: No provider`);
    return;
  }
  console.log("ContractChainProviderSigner", alteredChain);
  if (!contractChains.includes(alteredChain)) {
    throw new Error(`Altering failed: Not a contract chain: ${alteredChain}.`);
  }
  if (alteredChain === Chain.Solana) {
    console.log("Solana", provider);
    (window as any).solanaProvider = provider;
    alterSolanaChainProviderSigner(
      chains[alteredChain] as ChainInstance<Solana>,
      provider as SolanaConnector,
      false
    );
  } else if (supportedEthereumChains.includes(alteredChain)) {
    alterEthereumBaseChainProviderSigner(
      chains,
      alteredChain,
      provider,
      alterProvider
    );
  }
};

export const alterEthereumBaseChainProviderSigner = (
  chains: PartialChainInstanceMap,
  alteredChain: Chain,
  provider: any,
  alterProvider?: boolean
) => {
  console.log(
    `altering provider signer`,
    provider,
    alteredChain ? alteredChain : "all chains"
  );
  const ethersProvider = new ethers.providers.Web3Provider(provider);
  const signer = ethersProvider.getSigner();
  console.log("altering signer", signer, alteredChain);
  alterEthereumBaseChainSigner(chains, alteredChain, signer);

  if (alterProvider) {
    console.log("altering provider", provider, alteredChain);
    alterEthereumBaseChainProvider(chains, alteredChain, provider);
  }
};

export const alterEthereumBaseChainSigner = (
  chains: PartialChainInstanceMap,
  alteredChain: Chain,
  signer: any
) => {
  const alteredChains = alteredChain
    ? supportedEthereumChains.filter((chainName) => chainName === alteredChain)
    : supportedEthereumChains;
  alteredChains.forEach((chainName) => {
    if ((chains[chainName]?.chain as EthereumBaseChain).withSigner) {
      (chains[chainName]?.chain as EthereumBaseChain).withSigner!(signer);
      console.log("altered signer for", alteredChains.join(", "), signer);
    } else {
      throw new Error(
        `Altering signer failed: Unable to find chain ${chainName} in chains ${Object.keys(
          chains
        ).join(", ")}`
      );
    }
  });
};

export const alterEthereumBaseChainProvider = (
  chains: PartialChainInstanceMap,
  alteredChain: Chain,
  provider: any
) => {
  const alteredChains = alteredChain
    ? supportedEthereumChains.filter((chainName) => chainName === alteredChain)
    : supportedEthereumChains;
  alteredChains.forEach((chainName) => {
    if ((chains[chainName]?.chain as EthereumBaseChain).withProvider) {
      (chains[chainName]?.chain as EthereumBaseChain).withProvider!(provider);
      console.log("altered provider for", alteredChains.join(", "));
    } else {
      throw new Error(
        `Altering provider failed. Unable to find chain ${chainName} in chains ${Object.keys(
          chains
        ).join(", ")}`
      );
    }
  });
};

export const pickChains = (
  chains: ChainInstanceMap,
  from: Chain,
  to: Chain
) => {
  return { [from]: chains[from], [to]: chains[to] };
};
