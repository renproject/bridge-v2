import { RenNetwork } from "@renproject/interfaces";
import RenJS from "@renproject/ren";
import { RenJSConfig } from "@renproject/ren/build/main/config";
import { env } from "../constants/environmentVariables";

const renJsConfig: RenJSConfig = {
  loadCompletedDeposits: true,
};

type RenJSCache = Record<RenNetwork, RenJS>;
const renJsCache: Partial<RenJSCache> = {};
const renJsV2Cache: Partial<RenJSCache> = {};
export const getRenJs = (network: RenNetwork, timestamp = 0) => {
  const forceV2 = timestamp > env.V2_DEPRECATION_TIME;
  const cache = forceV2 ? renJsV2Cache : renJsCache;
  if (!cache[network]) {
    cache[network] = new RenJS(network, {
      ...renJsConfig,
      useV2TransactionFormat: forceV2,
    });
  }
  return cache[network] as RenJS;
};
