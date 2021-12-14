import { Asset, Chain, chains } from "@renproject/chains";
import { AssetChainsConfig } from "./tokensConfig";

const mintChains: Array<Chain> = [
  Chain.Ethereum,
  Chain.BinanceSmartChain,
  Chain.Polygon,
  Chain.Fantom,
  Chain.Avalanche,
  Chain.Arbitrum,
];

type AssetChainsData = AssetChainsConfig & {
  asset: Asset;
};

export const assetChainsArray = Object.values(chains).reduce(
  (acc, chain) => [
    ...acc,
    ...Object.values(chain.assets).map((asset) => ({
      asset: asset as Asset,
      lockChain: chain.chain as Chain,
      mintChains: mintChains.filter((mintChain) => mintChain !== chain.chain),
    })),
  ],
  [] as Array<AssetChainsData>
);

export const getAssetChainsConfig = (asset: Asset) => {
  const info = assetChainsArray.find((entry) => entry.asset === asset);
  if (!info) {
    throw new Error(`Chain mapping for ${asset} not found.`);
  }
  return {
    lockChain: info.lockChain,
    mintChains: info.mintChains,
  } as AssetChainsConfig;
};
