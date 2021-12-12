import { Bitcoin } from "@renproject/chains-bitcoin";
import { Ethereum } from "@renproject/chains-ethereum";

//TODO: should be explicitly stated "ETH | BTC | DAI" etc...
export type GatewayAsset =
  | string
  | keyof Ethereum["assets"]
  | keyof Bitcoin["assets"];

export type GatewayChain = string | Ethereum["chain"] | Bitcoin["chain"];
