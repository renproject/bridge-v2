import { RenNetwork } from "@renproject/interfaces";
import RenJS from "@renproject/ren";

type RenJSCache = Record<RenNetwork, RenJS>;
const renJsCache: Partial<RenJSCache> = {};
export const getRenJs = (network: RenNetwork) => {
  if (!renJsCache[network]) {
    renJsCache[network] = new RenJS(network);
  }
  return renJsCache[network] as RenJS;
};
