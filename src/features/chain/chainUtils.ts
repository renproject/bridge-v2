import SolanaWalletSerum from "@project-serum/sol-wallet-adapter";
import { Chain, Filecoin, Goerli } from "@renproject/chains";
import {
  Bitcoin,
  BitcoinBaseChain,
  BitcoinCash,
  DigiByte,
  Dogecoin,
  Zcash
} from "@renproject/chains-bitcoin";
import {
  Arbitrum,
  Avalanche,
  BinanceSmartChain,
  Ethereum,
  EthProvider,
  EVMNetworkConfig,
  Fantom,
  Kava,
  Moonbeam,
  Optimism,
  Polygon
} from "@renproject/chains-ethereum";
import { goerliConfigMap } from "@renproject/chains-ethereum/ethereum";
import { Solana } from "@renproject/chains-solana";
import { Wallet as SolanaWallet } from "@renproject/chains-solana/wallet";
import { Terra } from "@renproject/chains-terra";
import { SolanaConnector } from "@renproject/multiwallet-solana-connector";

import {
  Chain as GatewayChain,
  DepositChain,
  RenNetwork
} from "@renproject/utils";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { ethers, providers } from "ethers";
import { env } from "../../constants/environmentVariables";
import {
  isContractBaseChain,
  isEthereumBaseChain,
  supportedEthereumChains
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
    [network in RenNetwork]?: EVMNetworkConfig;
  };
  new({
    network,
    provider
}: {
    network: RenNetwork;
    provider: EthProvider;

  }): EVM;
}

const getEVMDefaultProvider = (ChainClass: EVMConstructor<any>, network: RenNetwork, configMap = ChainClass.configMap) => {
  const config = configMap[network];
  if (!config) {
    throw new Error(`No configuration for ${ChainClass.name} on ${network}.`);
  }

  let rpcUrl = config.config.rpcUrls[0];
  if (env.INFURA_ID) {
    for (const url of config.config.rpcUrls) {
      if (url.match(/^https:\/\/.*\$\{INFURA_API_KEY\}/)) {
        rpcUrl = url.replace(/\$\{INFURA_API_KEY\}/, env.INFURA_ID);
        break;
      }
    }
  }

  let provider = new providers.JsonRpcProvider(rpcUrl);

  return provider;
}

export const getEthereumChain = (
  network: RenNetwork
): ChainInstance & {
  chain: Ethereum;
} => {

  const provider = getEVMDefaultProvider(Ethereum as unknown as any, network, goerliConfigMap);
  return {
    chain: new Ethereum({
      network,
      provider,
      defaultTestnet: "goerli"
    }),
    connectionRequired: true,
    accounts: [],
  };
};

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
  const provider = getEVMDefaultProvider(ChainClass, network);

  return {
    chain: new ChainClass({
      network,
      provider
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
    network === RenNetwork.Mainnet ? "mainnet-beta" : "devnet";
  const rpcUrl = network === RenNetwork.Mainnet ? env.SOLANA_MAINNET_RPC_URL : clusterApiUrl(solanaNetwork);
  const provider = new Connection(rpcUrl);
  // console.log(rpcUrl);
  const signer =
    ((window as any).solana as SolanaWallet) ||
    new SolanaWalletSerum(rpcUrl, network);
  console.info("solana signer", (window as any).solana, signer);
  console.info(signer);
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
    [Chain.Ethereum]: getEthereumChain(network),
    [Chain.BinanceSmartChain]: getEthereumBaseChain(BinanceSmartChain, network),
    [Chain.Polygon]: getEthereumBaseChain(Polygon, network),
    [Chain.Goerli]: getEthereumBaseChain(Goerli, network),
    [Chain.Avalanche]: getEthereumBaseChain(Avalanche, network),
    [Chain.Arbitrum]: getEthereumBaseChain(Arbitrum, network),
    [Chain.Fantom]: getEthereumBaseChain(Fantom, network),
    [Chain.Kava]: getEthereumBaseChain(Kava, network),
    [Chain.Moonbeam]: getEthereumBaseChain(Moonbeam, network),
    [Chain.Optimism]: getEthereumBaseChain(Optimism, network),
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
    [Chain.Terra]: getDepositBaseChain(new Terra({ network })),
    [Chain.Filecoin]: getDepositBaseChain(new Filecoin({ network })),
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
  console.info("ContractChainProviderSigner", alteredChain);
  if (!isContractBaseChain(alteredChain)) {
    throw new Error(`Altering failed: Not a contract chain: ${alteredChain}.`);
  }
  if (alteredChain === Chain.Solana) {
    console.info("Solana", provider);
    (window as any).solanaProvider = provider;
    alterSolanaChainProviderSigner(
      chains[alteredChain] as ChainInstance<Solana>,
      provider as SolanaConnector,
      false
    );
  } else if (isEthereumBaseChain(alteredChain)) {
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
  console.info(
    `altering provider signer`,
    provider,
    alteredChain ? alteredChain : "all chains"
  );
  const ethersProvider = new ethers.providers.Web3Provider(provider);
  const signer = ethersProvider.getSigner();
  console.info("altering signer", signer, alteredChain);
  alterEthereumBaseChainSigner(chains, alteredChain, signer);

  if (alterProvider) {
    console.info("altering provider", provider, alteredChain);
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
      console.info("altered signer for", alteredChains.join(", "), signer);
      console.info(
        "new altered signer for",
        alteredChains.join(", "),
        (chains[chainName]?.chain as EthereumBaseChain).signer
      );
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
      console.info("altered provider for", alteredChains.join(", "));
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
  const pickedChains = { [from]: chains[from], [to]: chains[to] };
  (window as any).pickedChains = pickedChains;
  console.info("chains picked", pickedChains);
  return pickedChains;
};

export const chainsWithSignerOrNull = (
  chains: PartialChainInstanceMap,
  chain: Chain
) => {
  const present = Boolean((chains[chain]?.chain as any)?.signer);
  console.info("signer", chains, chain, present);
  if (present) {
    return chains;
  }
  return null;
};
