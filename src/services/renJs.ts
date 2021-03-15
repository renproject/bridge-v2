import { RenNetwork } from "@renproject/interfaces";
import RenJS from "@renproject/ren";
import { RenJSConfig } from "@renproject/ren/build/main/config";

const renJsConfig: RenJSConfig = {
  loadCompletedDeposits: true,
};

type RenJSCache = Record<RenNetwork, RenJS>;
const renJsCache: Partial<RenJSCache> = {};
export const getRenJs = (network: RenNetwork) => {
  if (!renJsCache[network]) {
    renJsCache[network] = new RenJS(network, renJsConfig);
  }
  return renJsCache[network] as RenJS;
};
