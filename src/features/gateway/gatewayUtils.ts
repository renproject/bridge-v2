import { Asset, Chain } from "@renproject/chains";
import { BitcoinBaseChain } from "@renproject/chains-bitcoin";
import { Ethereum, EthereumBaseChain } from "@renproject/chains-ethereum";
import RenJS, { Gateway } from "@renproject/ren";
import queryString from "query-string";
import {
  supportedBitcoinChains,
  supportedEthereumChains,
} from "../../utils/chainsConfig";
import { ChainInstanceMap } from "../chain/chainUtils";

export interface CreateGatewayParams {
  asset: Asset;
  from: Chain;
  to: Chain;
  nonce?: number;
  amount?: string;
  toAddress?: string;
}

export const createGateway = async (
  renJS: RenJS,
  gatewayParams: CreateGatewayParams,
  chains: ChainInstanceMap
): Promise<Gateway> => {
  if (!gatewayParams.from || !gatewayParams.to) {
    throw new Error(`Missing gateway field.`);
  }

  const asset = gatewayParams.asset;
  console.log("gatewayParams", gatewayParams);
  let fromChain;
  if (supportedEthereumChains.includes(gatewayParams.from)) {
    fromChain = (chains[gatewayParams.from].chain as EthereumBaseChain).Account(
      {
        amount: gatewayParams.amount,
        convertToWei: true,
      }
    );
  } else if (supportedBitcoinChains.includes(gatewayParams.from)) {
    fromChain = (
      chains[gatewayParams.from].chain as BitcoinBaseChain
    ).GatewayAddress();
  } else {
    throw new Error(`Unknown chain "from": ${gatewayParams.from}`);
  }

  let toChain;
  if (supportedEthereumChains.includes(gatewayParams.to)) {
    toChain = (chains[gatewayParams.to].chain as Ethereum).Account();
  } else if (supportedBitcoinChains.includes(gatewayParams.to)) {
    if (!gatewayParams.toAddress) {
      throw new Error(`No recipient address provided.`);
    }
    toChain = (chains[gatewayParams.to].chain as BitcoinBaseChain).Address(
      gatewayParams.toAddress
    );
  } else {
    throw new Error(`Unknown chain "to": ${gatewayParams.from}`);
  }

  return await renJS.gateway({
    asset,
    from: fromChain,
    to: toChain,
  });
};

export const createGatewayQueryString = (
  gatewayParams: CreateGatewayParams
) => {
  return queryString.stringify(gatewayParams);
};

export const parseGatewayQueryString = (query: string) => {
  return queryString.parse(query) as unknown as CreateGatewayParams;
};

export const GATEWAY_EXPIRY_OFFSET_MS = 24 * 3600 * 1000;

export const getSessionDay = (dayOffset = 0) =>
  Math.floor(Date.now() / GATEWAY_EXPIRY_OFFSET_MS) - dayOffset;

export const generateNonce = (dayOffset = 0, dayIndex = 0) => {
  const nonce = dayIndex + getSessionDay(dayOffset) * 1000;
  return nonce;
};

// Amount of time remaining until gateway expires
export const getRemainingGatewayTime = (expiryTime: number) =>
  Math.ceil(expiryTime - GATEWAY_EXPIRY_OFFSET_MS - Number(new Date()));

export const getRemainingTime = (expiryTime: number) =>
  Math.ceil(expiryTime - Number(new Date()));
