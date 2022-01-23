import { Client } from "@bandprotocol/bandchain.js";

let bandchainInstance: any | null = null;

// BandChain's Proof-of-Authority REST endpoint
const endpoint = "https://laozi1.bandchain.org/grpc-web";

export const getBandchain = () => {
  if (bandchainInstance === null) {
    bandchainInstance = new Client(endpoint);
  }
  return bandchainInstance;
};
