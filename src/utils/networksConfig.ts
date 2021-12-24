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
) =>
  ({ [network]: { id, fullName: name } } as Record<RenNetwork, NetworkConfig>);

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
      throw new Error(`Network mapping failed for ${chain}:${id}`);
    }
  };
  return mapper;
};
