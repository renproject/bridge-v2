import { RenNetwork } from "@renproject/interfaces";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import { burnMachine, GatewaySession } from "@renproject/rentx";
import { useMachine } from "@xstate/react";
import { env } from "../../constants/environmentVariables";
import { getRenJs } from "../../services/renJs";
import { burnChainMap, releaseChainMap } from "../../services/rentx";
import {
  BridgeCurrency,
  getChainRentxName,
  getCurrencyConfig,
  getCurrencyRentxSourceChain,
  getReleasedDestinationCurrencySymbol,
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
  userAddress: string;
  destAddress: string;
};

export const createReleaseTransaction = ({
  amount,
  currency,
  userAddress,
  destAddress,
}: CreateReleaseTransactionParams) => {
  const sourceCurrency = getReleasedDestinationCurrencySymbol(currency);
  const sourceCurrencyConfig = getCurrencyConfig(sourceCurrency);
  const tx: GatewaySession = {
    id: "tx-" + Math.floor(Math.random() * 10 ** 16),
    type: "burn",
    network: env.NETWORK as RenNetwork,
    sourceAsset: sourceCurrencyConfig.rentxName,
    sourceNetwork: getCurrencyRentxSourceChain(currency),
    destAddress,
    destNetwork: getChainRentxName(sourceCurrencyConfig.sourceChain),
    targetAmount: Number(amount),
    userAddress,
    expiryTime: new Date().getTime() + 1000 * 60 * 60 * 24,
    transactions: {},
    customParams: {},
  };

  return tx;
};

export const useBurnMachine = (burnTransaction: GatewaySession) => {
  const { enabledChains } = useMultiwallet();
  const providers = Object.entries(enabledChains).reduce(
    (c, n) => ({
      ...c,
      [n[0]]: n[1].provider,
    }),
    {}
  );
  return useMachine(burnMachine, {
    context: {
      tx: burnTransaction,
      providers,
      sdk: getRenJs(),
      fromChainMap: burnChainMap,
      toChainMap: releaseChainMap,
    },
    devTools: env.XSTATE_DEVTOOLS,
  });
};
