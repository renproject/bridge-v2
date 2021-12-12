import { Bitcoin } from "@renproject/chains-bitcoin";
import { Ethereum } from "@renproject/chains-ethereum";

export type GatewayAsset =
  | string
  | keyof Ethereum["assets"]
  | keyof Bitcoin["assets"];
