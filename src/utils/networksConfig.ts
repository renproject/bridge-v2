import { Chain } from "@renproject/chains";
import { RenNetwork } from "@renproject/utils";
import { getChainNetworkConfig } from "./chainsConfig";

export type NetworkConfig = {
  id: string | number;
  fullName: string;
  shortName?: string;
};

export type NetworksConfig = Partial<Record<RenNetwork, NetworkConfig>>;

export const createNetworkConfig = (
  network: RenNetwork,
  id: string | number,
  name = network as string
) => {
  const fullName = network === RenNetwork.Mainnet ? "Mainnet" : "Testnet";
  return {
    [network]: {
      id,
      fullName,
    },
  } as Record<RenNetwork, NetworkConfig>;
};

export const createNetworksConfig = (
  mainnetId: string | number,
  testnetId: string | number,
  mainnetName = RenNetwork.Mainnet,
  testnetName = RenNetwork.Testnet
) => {
  return {
    ...createNetworkConfig(RenNetwork.Mainnet, mainnetId, mainnetName),
    ...createNetworkConfig(RenNetwork.Testnet, testnetId, testnetName),
  } as Record<RenNetwork, NetworkConfig>;
};

type NetworkIdMapper = (id: string | number) => RenNetwork;

export const createNetworkIdMapper = (chain: Chain) => {
  const mainnet = getChainNetworkConfig(chain, RenNetwork.Mainnet);
  const testnet = getChainNetworkConfig(chain, RenNetwork.Testnet);

  const mapper: NetworkIdMapper = (id) => {
    const parsedId = parseInt(id as string).toString();
    if (mainnet.id === id || parsedId === mainnet.id.toString()) {
      return RenNetwork.Mainnet;
    } else if (testnet.id === id || parsedId === testnet.id.toString()) {
      return RenNetwork.Testnet;
    } else {
      console.warn(`Network mapping failed for ${chain}:${id}`);
      return RenNetwork.Devnet; // hack to show correct wrong network info
    }
  };
  return mapper;
};
