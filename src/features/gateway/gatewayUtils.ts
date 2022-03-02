import { Asset, Chain } from "@renproject/chains";
import { BitcoinBaseChain } from "@renproject/chains-bitcoin";
import { Ethereum } from "@renproject/chains-ethereum";
import RenJS, { Gateway } from "@renproject/ren";
import queryString from "query-string";
import {
  supportedBitcoinChains,
  supportedEthereumChains,
} from "../../utils/chainsConfig";
import { EthereumBaseChain } from "../../utils/missingTypes";
import { ChainInstanceMap, PartialChainInstanceMap } from "../chain/chainUtils";

export interface CreateGatewayParams {
  asset: Asset;
  from: Chain;
  to: Chain;
  nonce?: string | number;
  amount?: string;
  toAddress?: string;
}

export const createGateway = async (
  renJS: RenJS,
  gatewayParams: CreateGatewayParams,
  chains: PartialChainInstanceMap
): Promise<Gateway> => {
  if (!gatewayParams.from || !gatewayParams.to) {
    throw new Error(`Missing gateway field.`);
  }
  const fromChainInstance = chains[gatewayParams.from];
  const toChainInstance = chains[gatewayParams.to];
  if (!fromChainInstance || !toChainInstance) {
    throw new Error(`Missing chain instances.`);
  }

  const { asset, nonce } = gatewayParams;
  console.log("gatewayParams", gatewayParams);
  let fromChain;
  if (supportedEthereumChains.includes(gatewayParams.from)) {
    fromChain = (fromChainInstance.chain as EthereumBaseChain).Account({
      amount: gatewayParams.amount,
      convertToWei: true,
    });
  } else if (supportedBitcoinChains.includes(gatewayParams.from)) {
    fromChain = (fromChainInstance.chain as BitcoinBaseChain).GatewayAddress();
  } else {
    throw new Error(`Unknown chain "from": ${gatewayParams.from}`);
  }

  let toChain;
  if (supportedEthereumChains.includes(gatewayParams.to)) {
    toChain = (toChainInstance.chain as Ethereum).Account();
  } else if (supportedBitcoinChains.includes(gatewayParams.to)) {
    if (!gatewayParams.toAddress) {
      throw new Error(`No recipient address provided.`);
    }
    toChain = (toChainInstance.chain as BitcoinBaseChain).Address(
      gatewayParams.toAddress
    );
  } else {
    throw new Error(`Unknown chain "to": ${gatewayParams.from}`);
  }

  console.log("creating gateway with fromChain", fromChain);
  console.log("creating gateway with toChain", toChain);
  return await renJS.gateway({
    asset,
    from: fromChain,
    to: toChain,
    nonce,
  });
};

export type AdditionalGatewayParams = {
  expiryTime?: number;
  renVMHash?: string;
};

export const createGatewayQueryString = (
  gatewayParams: CreateGatewayParams,
  additionalParams: AdditionalGatewayParams = {}
) => {
  return queryString.stringify({ ...gatewayParams, ...additionalParams });
};

export const parseGatewayQueryString = (query: string, checkNonce = false) => {
  const parsed = queryString.parse(query) as unknown as CreateGatewayParams &
    AdditionalGatewayParams;
  const { expiryTime, renVMHash, ...gatewayParams } = parsed;
  const additionalParams = { expiryTime, renVMHash };
  let error;
  let nonce = undefined;
  if (checkNonce) {
    nonce = Number(gatewayParams.nonce);
    if (isNaN(nonce)) {
      error = `Unable to parse nonce as number: ${gatewayParams.nonce}`;
    }
  }

  const sanitized = {
    asset: gatewayParams.asset,
    from: gatewayParams.from,
    to: gatewayParams.to,
    toAddress: gatewayParams.toAddress,
    amount: gatewayParams.amount,
    nonce,
  };
  return { gatewayParams: sanitized, additionalParams, error };
};

const DAY_S = 24 * 3600;
const DAY_MS = DAY_S * 1000;
export const GATEWAY_EXPIRY_OFFSET_S = DAY_S;
export const GATEWAY_EXPIRY_OFFSET_MS = GATEWAY_EXPIRY_OFFSET_S * 1000;

export const getSessionDay = (pastDayOffset = 0) =>
  Math.floor(Date.now() / 1000 / DAY_S) - pastDayOffset;

export const getGatewayNonce = (pastDayOffset = 0) => {
  const sessionDay = getSessionDay(pastDayOffset);
  return sessionDay;
  // return toURLBase64(Buffer.from([sessionDay]));
};

export const getGatewayExpiryTime = (pastDayOffset = 0) => {
  return getSessionDay(pastDayOffset) * DAY_MS + GATEWAY_EXPIRY_OFFSET_MS;
};

// export const getRenJSBase64Nonce = (pastDayOffset = 0) => {
//   return toURLBase64(Buffer.from([getSessionDay(pastDayOffset)]));
// };
// console.log("gst", getRenJSNonce(), getRenJSBase64Nonce());
