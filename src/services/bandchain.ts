import Client from "@bandprotocol/bandchain.js/lib/client";

let bandchainInstance: any | null = null;

// BandChain's Proof-of-Authority REST endpoint
const endpoint = "https://laozi-testnet4.bandchain.org/grpc-web";

export const getBandchain = () => {
  if (bandchainInstance === null) {
    bandchainInstance = new Client(endpoint);
  }
  return bandchainInstance;
};
