import { Asset, Chain } from "@renproject/chains";
import { BitcoinBaseChain } from "@renproject/chains-bitcoin";
import { Ethereum } from "@renproject/chains-ethereum";
import { Solana } from "@renproject/chains-solana";
import RenJS, { Gateway } from "@renproject/ren";
import { ChainTransaction } from "@renproject/utils";
// import BigNumber from "bignumber.js";
import queryString from "query-string";
import { featureFlags } from "../../constants/featureFlags";
import {
  isDepositBaseChain,
  isEthereumBaseChain,
  isSolanaBaseChain,
} from "../../utils/chainsConfig";
import { EthereumBaseChain } from "../../utils/missingTypes";
import { PartialChainInstanceMap } from "../chain/chainUtils";

export type PartialChainTransaction = Partial<ChainTransaction> &
  (
    | {
        txid: string;
      }
    | {
        txidFormatted: string;
      }
  );

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
const anyoneCanSubmit = featureFlags.godMode || false;

export const createGateway = async (
  renJS: RenJS,
  gatewayParams: CreateGatewayParams,
  chains: PartialChainInstanceMap,
  partialTx?: PartialChainTransaction | null
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
  console.info("gatewayParams", gatewayParams);
  let fromChain;
  if (isEthereumBaseChain(gatewayParams.from)) {
    const ethereum = fromChainInstance.chain as unknown as EthereumBaseChain;
    console.info("resolving from chain", gatewayParams);
    if (partialTx) {
      console.info("resolved from paritalTx", gatewayParams);
      fromChain = ethereum.Transaction(partialTx);
    } else if (gatewayParams.fromAddress) {
      console.info("resolved from fromAddress", gatewayParams);
      fromChain = fromChain = ethereum.Account({
        account: gatewayParams.fromAddress,
        amount: gatewayParams.amount,
        convertUnit,
        anyoneCanSubmit,
      });
    } else {
      console.info("resolved from account", gatewayParams);
      fromChain = ethereum.Account({
        amount: gatewayParams.amount,
        convertUnit,
        anyoneCanSubmit,
      });
    }
  } else if (isSolanaBaseChain(gatewayParams.from)) {
    const solana = fromChainInstance.chain as Solana;
    if (partialTx) {
      fromChain = solana.Transaction(partialTx);
    } else if (gatewayParams.fromAddress) {
      fromChain = solana.Account({
        address: gatewayParams.fromAddress,
        amount: gatewayParams.amount,
        convertUnit,
      });
    } else {
      fromChain = solana.Account({
        amount: gatewayParams.amount,
        convertUnit,
      });
    }
  } else if (isDepositBaseChain(gatewayParams.from)) {
    fromChain = (fromChainInstance.chain as BitcoinBaseChain).GatewayAddress();
  } else {
    throw new Error(`Unknown chain "from": ${gatewayParams.from}`);
  }

  let toChain;
  if (isEthereumBaseChain(gatewayParams.to)) {
    const ethereumChain = toChainInstance.chain as unknown as Ethereum;
    console.info("resolving toAddress", gatewayParams);
    if (gatewayParams.toAddress) {
      toChain = ethereumChain.Account({
        account: gatewayParams.toAddress,
        convertUnit,
        anyoneCanSubmit,
      });
    } else {
      toChain = ethereumChain.Account({ convertUnit, anyoneCanSubmit });
    }
  } else if (isSolanaBaseChain(gatewayParams.to)) {
    const solana = toChainInstance.chain as Solana;
    if (gatewayParams.toAddress) {
      toChain = solana.Address(gatewayParams.toAddress);
    } else {
      toChain = solana.Account();
    }
  } else if (isDepositBaseChain(gatewayParams.to)) {
    if (!gatewayParams.toAddress) {
      throw new Error(`No recipient address provided.`);
    }
    toChain = (toChainInstance.chain as BitcoinBaseChain).Address(
      gatewayParams.toAddress
    );
  } else {
    throw new Error(`Unknown chain "to": ${gatewayParams.to}`);
  }

  console.info("creating gateway with fromChain", fromChain);
  console.info("creating gateway with toChain", toChain);
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
  partialTx?: string;
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
  const {
    expiryTime,
    renVMHash,
    partialTx: partialTxString,
    ...gatewayParams
  } = parsed;
  const additionalParams = {
    expiryTime,
    renVMHash,
    partialTxString,
  };
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
