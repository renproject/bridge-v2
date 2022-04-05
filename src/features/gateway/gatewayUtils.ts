import { Asset, Chain } from "@renproject/chains";
import { BitcoinBaseChain } from "@renproject/chains-bitcoin";
import { Ethereum } from "@renproject/chains-ethereum";
import { Solana } from "@renproject/chains-solana";
import RenJS, { Gateway } from "@renproject/ren";
// import BigNumber from "bignumber.js";
import queryString from "query-string";
import {
  supportedBitcoinChains,
  supportedEthereumChains,
  supportedSolanaChains,
} from "../../utils/chainsConfig";
import { EthereumBaseChain } from "../../utils/missingTypes";
import { PartialChainInstanceMap } from "../chain/chainUtils";

export interface CreateGatewayParams {
  asset: Asset;
  from: Chain;
  to: Chain;
  nonce?: string | number;
  amount?: string;
  toAddress?: string;
  fromAddress?: string;
}

const convertUnit = true;

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
    const ethereumChain =
      fromChainInstance.chain as unknown as EthereumBaseChain;
    console.log("resolving fromAddress", gatewayParams);
    if (gatewayParams.fromAddress) {
      fromChain = fromChain = ethereumChain.Account({
        account: gatewayParams.fromAddress,
        amount: gatewayParams.amount,
        convertUnit,
      });
    } else {
      fromChain = ethereumChain.Account({
        amount: gatewayParams.amount,
        convertUnit,
      });
    }
  } else if (supportedSolanaChains.includes(gatewayParams.from)) {
    const solana = fromChainInstance.chain as Solana;
    //TODO: finish .Address / Account when fromAddress with Solana H2H
    fromChain = solana.Account({
      amount: gatewayParams.amount,
      convertUnit,
    });
  } else if (supportedBitcoinChains.includes(gatewayParams.from)) {
    fromChain = (fromChainInstance.chain as BitcoinBaseChain).GatewayAddress();
  } else {
    throw new Error(`Unknown chain "from": ${gatewayParams.from}`);
  }

  let toChain;
  if (supportedEthereumChains.includes(gatewayParams.to)) {
    const ethereumChain = toChainInstance.chain as unknown as Ethereum;
    console.log("resolving toAddress", gatewayParams);
    if (gatewayParams.toAddress) {
      toChain = ethereumChain.Address(gatewayParams.toAddress || "");
    } else {
      toChain = ethereumChain.Account({ convertUnit });
    }
  } else if (supportedSolanaChains.includes(gatewayParams.to)) {
    if (gatewayParams.toAddress) {
      toChain = (toChainInstance.chain as Solana).Address({
        address: gatewayParams.toAddress,
      });
    } else {
      toChain = (toChainInstance.chain as Solana).Account();
    }
  } else if (supportedBitcoinChains.includes(gatewayParams.to)) {
    if (!gatewayParams.toAddress) {
      throw new Error(`No recipient address provided.`);
    }
    toChain = (toChainInstance.chain as BitcoinBaseChain).Address(
      gatewayParams.toAddress
    );
  } else {
    throw new Error(`Unknown chain "to": ${gatewayParams.to}`);
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

export const getBridgeNonce = (renJSNonce: string) => {
  // TODO: Noah - is there a better way?
  // "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASoo" => 19082;
  let result = 0;
  try {
    result = Buffer.from(renJSNonce, "base64").readIntBE(0, 32);
  } catch (ex) {
    console.error("Unable to decode renJSNonce", renJSNonce);
  }
  return result;
};
