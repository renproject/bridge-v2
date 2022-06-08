import { Asset, Chain } from "@renproject/chains";
import RenJS from "@renproject/ren";
import { LogLevel } from "@renproject/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { env } from "../../constants/environmentVariables";
import { supportedAssets } from "../../utils/assetsConfig";
import { getAssetChainsConfig } from "../../utils/chainsConfig";
import { getDefaultChains } from "../chain/chainUtils";
import { GatewayIOType } from "./gatewayHooks";

// network will be global session-unchangeable variable;
const chains = getDefaultChains(env.NETWORK);
const chainsArray = Object.values(chains).map((chain) => chain.chain);
const globalRenJs = new RenJS(env.NETWORK, {
  logLevel: LogLevel.Debug,
}).withChains(...chainsArray);

(window as any).globalRenJs = globalRenJs;

const extractChain = (chainPart: string, prefix: string) => {
  const chain = chainPart.slice(prefix.length);
  return chain as Chain;
};

const decomposeSelector = (selector: string) => {
  const [asset, chainsPart] = selector.split("/") as [Asset, string];

  let ioType: GatewayIOType | null = null;
  let from: Chain | null = null;
  let to: Chain | null = null;

  if (chainsPart.indexOf("_") > -1) {
    const [fromPart, toPart] = chainsPart.split("_");
    ioType = GatewayIOType.burnAndMint;
    from = extractChain(fromPart, "from");
    to = extractChain(toPart, "to");
  } else if (chainsPart.startsWith("to")) {
    ioType = GatewayIOType.lockAndMint;
    from = getAssetChainsConfig(asset, true)?.lockChain || null;
    to = extractChain(chainsPart, "to");
  } else if (chainsPart.startsWith("from")) {
    ioType = GatewayIOType.burnAndRelease;
    from = extractChain(chainsPart, "from");
    to = getAssetChainsConfig(asset, true)?.lockChain || null;
  }
  return { asset, from, to, ioType };
};

type assetsMappingMapping = Record<GatewayIOType, Array<Asset>>;

type ChainsByassetsMappingMapping = Record<
  GatewayIOType,
  Partial<Record<Asset, Array<Chain>>>
>;

export const useWhitelist = () => {
  const [whitelist, setWhitelist] = useState<Array<string> | null>(null);
  useEffect(() => {
    globalRenJs.provider.queryConfig().then((response) => {
      setWhitelist(response.whitelist);
    });
  }, []);

  const { assetsMapping, toChainMapping, fromChainMapping } = useMemo(() => {
    if (whitelist === null) {
      return {
        assetsMapping: null,
        toChainMapping: null,
        fromChainMapping: null,
      };
    }
    const assetsMapping: assetsMappingMapping = {
      burnAndMint: [],
      burnAndRelease: [],
      lockAndMint: [],
    };
    const toChainMapping: ChainsByassetsMappingMapping = {
      burnAndMint: {},
      burnAndRelease: {},
      lockAndMint: {},
    };
    const fromChainMapping: ChainsByassetsMappingMapping = {
      burnAndMint: {},
      burnAndRelease: {},
      lockAndMint: {},
    };
    for (let selector of whitelist) {
      const { asset, from, to, ioType } = decomposeSelector(selector);
      if (!supportedAssets.includes(asset) || ioType === null) {
        continue;
      }
      assetsMapping[ioType].push(asset);
      if (to) {
        if (!toChainMapping[ioType][asset]) {
          toChainMapping[ioType][asset] = [];
        }
        if (!toChainMapping[ioType][asset]?.includes(to)) {
          toChainMapping[ioType][asset]?.push(to);
        }
      }
      if (from) {
        if (!fromChainMapping[ioType][asset]) {
          fromChainMapping[ioType][asset] = [];
        }
        if (!fromChainMapping[ioType][asset]?.includes(from)) {
          fromChainMapping[ioType][asset]?.push(from);
        }
      }
    }
    // console.log("toChainMapping", toChainMapping);
    // console.log("fromChainMapping", toChainMapping);
    return { assetsMapping, toChainMapping, fromChainMapping };
  }, [whitelist]);

  const whitelistAssets = useCallback(
    (asset: Asset, ioType: GatewayIOType) => {
      if (assetsMapping === null) {
        return true;
      }
      return assetsMapping[ioType].includes(asset);
    },
    [assetsMapping]
  );

  const whitelistToChains = useCallback(
    (asset: Asset, ioType: GatewayIOType, chain: Chain) => {
      if (toChainMapping === null) {
        return true;
      }
      if (toChainMapping[ioType][asset] !== undefined) {
        return toChainMapping[ioType][asset]?.includes(chain);
      }
      return false;
    },
    [toChainMapping]
  );

  const whitelistFromChains = useCallback(
    (asset: Asset, ioType: GatewayIOType, chain: Chain) => {
      if (fromChainMapping === null) {
        return true;
      }
      if (fromChainMapping[ioType][asset] !== undefined) {
        return fromChainMapping[ioType][asset]?.includes(chain);
      }
      return false;
    },
    [fromChainMapping]
  );

  return {
    whitelistAssets,
    whitelistToChains,
    whitelistFromChains,
  };
};
