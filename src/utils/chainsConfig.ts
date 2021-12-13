import { Asset, Chain, chains } from "@renproject/chains";

const mintChains: Array<Chain> = [
  Chain.Ethereum,
  Chain.BinanceSmartChain,
  Chain.Polygon,
  Chain.Fantom,
  Chain.Avalanche,
  Chain.Arbitrum,
];

type AssetChainsConfig = {
  asset: Asset;
  lockChain: Chain;
  mintChains: Chain[];
};

export const allAssetChains = Object.values(chains)
  .reduce(
    (acc, chain) => [
      ...acc,
      ...Object.values(chain.assets).map((asset) => ({
        asset: asset as Asset,
        lockChain: chain.chain as Chain,
        mintChains: mintChains.filter((mintChain) => mintChain !== chain.chain),
      })),
    ],
    [] as Array<AssetChainsConfig>
  )
  .filter(
    (asset) => mintChains.includes(asset.lockChain) || asset.asset === Asset.BTC
  );
