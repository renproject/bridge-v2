import queryString from "query-string";

import { env } from "./environmentVariables";

export const featureFlags = {
  enableBSCMetamask:
    env.BSC_MM_ENABLED ||
    queryString.parse(window.location.search).bscMetamaskEnabled,
  enableMEWConnect:
    env.MEWCONNECT_ENABLED ||
    queryString.parse(window.location.search).MEWConnectEnabled,
  enableWalletConnect:
    env.WALLETCONNECT_ENABLED ||
    queryString.parse(window.location.search).walletConnectEnabled,
  godMode:
    Boolean(queryString.parse(window.location.search).godMode) ||
    Boolean(localStorage.getItem("godMode")),
};

console.info(featureFlags);
