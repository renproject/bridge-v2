import { Asset, Chain } from "@renproject/chains";
import { BitcoinBaseChain } from "@renproject/chains-bitcoin";
import { Ethereum, EthereumBaseChain } from "@renproject/chains-ethereum";
import RenJS, { Gateway } from "@renproject/ren";
import { InputType, OutputType } from "@renproject/utils";
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
