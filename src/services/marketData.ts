import BandChain from "@bandprotocol/bandchain.js";

export const fetchMarketRates = async () => {
  // BandChain proof-of-authority Mainnet REST endpoint
  const endpoint = "https://poa-api.bandchain.org";

  const bandchain = new BandChain(endpoint);
  return bandchain.getReferenceData([
    "BTC/USD",
    "ETH/USD", // TODO add more pairs
  ]);
};
