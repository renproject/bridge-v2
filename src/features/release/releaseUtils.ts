import { RenNetwork } from "@renproject/interfaces";
import { GatewaySession } from "@renproject/rentx";
import { env } from "../../constants/environmentVariables";
import {
  BridgeChain,
  BridgeCurrency,
  getChainRentxName,
  getCurrencyRentxName,
  getCurrencyRentxSourceChain,
} from "../../utils/assetConfigs";

export const preValidateReleaseTransaction = (tx: GatewaySession) => {
  // TODO: create advancedValidation
  return (
    tx.type === "burn" &&
    tx.sourceAsset &&
    tx.destAddress &&
    tx.userAddress &&
    tx.targetAmount > 0
  );
};

type CreateReleaseTransactionParams = {
  amount: number;
  currency: BridgeCurrency;
  releasedCurrency: BridgeCurrency;
  releasedCurrencyChain: BridgeChain;
  userAddress: string;
  destAddress: string;
};

export const createReleaseTransaction = ({
  amount,
  currency,
  releasedCurrencyChain,
  userAddress,
  destAddress,
}: CreateReleaseTransactionParams) => {
  const tx: GatewaySession = {
    id: "tx-" + Math.floor(Math.random() * 10 ** 16),
    type: "burn",
    network: env.NETWORK as RenNetwork,
    sourceAsset: getCurrencyRentxName(currency),
    sourceNetwork: getCurrencyRentxSourceChain(currency),
    destAddress,
    destNetwork: getChainRentxName(releasedCurrencyChain),
    targetAmount: Number(amount),
    userAddress,
    expiryTime: new Date().getTime() + 1000 * 60 * 60 * 24,
    transactions: {},
    customParams: {},
  };

  return tx;
};
