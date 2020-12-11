import { RenNetwork } from "@renproject/interfaces";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import {
  burnMachine,
  BurnMachineSchema,
  GatewaySession,
} from "@renproject/ren-tx";
import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { env } from "../../constants/environmentVariables";
import { db } from "../../services/database/database";
import { DbGatewaySession } from "../../services/database/firebase/firebase";
import { getRenJs } from "../../services/renJs";
import { burnChainMap, releaseChainMap } from "../../services/rentx";
import {
  BridgeCurrency,
  getChainConfig,
  getChainRentxName,
  getCurrencyConfig,
  getCurrencyConfigByRentxName,
  getCurrencyRentxSourceChain,
  getNetworkConfigByRentxName,
  RenChain,
  toMintedCurrency,
  toReleasedCurrency,
} from "../../utils/assetConfigs";
import { $network } from "../network/networkSlice";
import { updateTransaction } from "../transactions/transactionsSlice";
import {
  getChainExplorerLink,
  getTxCreationTimestamp,
  TxEntryStatus,
  TxMeta,
  TxPhase,
} from "../transactions/transactionsUtils";

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
  sourceChain?: RenChain;
  network: RenNetwork;
};

export const createReleaseTransaction = ({
  amount,
  currency,
  userAddress,
  destAddress,
  network,
}: CreateReleaseTransactionParams) => {
  const sourceCurrency = toReleasedCurrency(currency);
  const sourceCurrencyConfig = getCurrencyConfig(sourceCurrency);
  const tx: GatewaySession = {
    id: "tx-" + Math.floor(Math.random() * 10 ** 16),
    type: "burn",
    network,
    sourceAsset: sourceCurrencyConfig.rentxName,
    sourceChain: getCurrencyRentxSourceChain(currency), // TODO: pass sourceChain explicitly
    destAddress,
    destChain: getChainRentxName(sourceCurrencyConfig.sourceChain),
    targetAmount: Number(amount),
    userAddress,
    expiryTime: new Date().getTime() + 1000 * 60 * 60 * 24,
    transactions: {},
    customParams: {},
  };

  return tx;
};

export const getBurnAndReleaseParams = (tx: GatewaySession) => {
  const networkConfig = getNetworkConfigByRentxName(tx.network);
  const releaseCurrencyConfig = getCurrencyConfigByRentxName(tx.sourceAsset);
  const burnCurrencyConfig = getCurrencyConfig(
    toMintedCurrency(releaseCurrencyConfig.symbol)
  );
  const burnChainConfig = getChainConfig(burnCurrencyConfig.sourceChain);
  const releaseChainConfig = getChainConfig(releaseCurrencyConfig.sourceChain);

  const transaction = Object.values(tx.transactions)[0];
  let burnTxHash: string = "";
  let burnTxLink: string = "";
  if (transaction && transaction.sourceTxHash) {
    burnTxHash = transaction.sourceTxHash;
    burnTxLink =
      getChainExplorerLink(
        burnChainConfig.symbol,
        networkConfig.symbol,
        transaction.sourceTxHash
      ) || "";
  }
  let releaseTxHash: string = "";
  let releaseTxLink: string = "";
  if (transaction && transaction.destTxHash) {
    releaseTxHash = Buffer.from(transaction.destTxHash, "base64").toString(
      "hex"
    );
    releaseTxLink =
      getChainExplorerLink(
        releaseChainConfig.symbol,
        networkConfig.symbol,
        releaseTxHash
      ) || "";
  }
  const meta: TxMeta = {
    status: TxEntryStatus.PENDING,
    phase: TxPhase.NONE,
    createdTimestamp: getTxCreationTimestamp(tx),
  };
  if (burnTxHash) {
    if (releaseTxHash) {
      // burn and releaseTxHash present
      meta.status = TxEntryStatus.COMPLETED;
    }
  } else {
    // no burnTxHash - action required on burningChain
    meta.status = TxEntryStatus.ACTION_REQUIRED;
    meta.phase = TxPhase.BURN;
  }

  return {
    networkConfig,
    burnCurrencyConfig,
    releaseCurrencyConfig,
    burnChainConfig,
    releaseChainConfig,
    burnTxHash,
    burnTxLink,
    releaseTxHash,
    releaseTxLink,
    meta,
  };
};

export type BurnMachineSchemaState = keyof BurnMachineSchema["states"];

export const useBurnMachine = (burnTransaction: GatewaySession) => {
  const { enabledChains } = useMultiwallet();
  const network = useSelector($network);
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
      sdk: getRenJs(network),
      fromChainMap: burnChainMap,
      toChainMap: releaseChainMap,
      // If we already have a transaction, we need to autoSubmit
      // to check the tx status
      autoSubmit: !!Object.values(burnTransaction.transactions)[0],
    },
    devTools: env.XSTATE_DEVTOOLS,
  });
};

export enum BurnState {
  restoring = "restoring",
  created = "created",
  createError = "createError",
  srcSettling = "srcSettling",
  srcConfirmed = "srcConfirmed",
  destInitiated = "destInitiated", // We only care if the txHash has been issued by renVM
}

export const releaseTxStateUpdateSequence = [
  BurnState.created,
  BurnState.srcSettling,
  BurnState.srcConfirmed,
  BurnState.destInitiated,
];

export const shouldUpdateReleaseTx = (
  tx: GatewaySession | DbGatewaySession,
  dbTx: DbGatewaySession,
  state: string
) => {
  // update when the new state is next in sequence
  // will prevent multiple updates in separate sessions
  const dbState = dbTx?.meta?.state;
  if (!dbState) {
    // update when no state
    return true;
  }
  const dbStateIndex = releaseTxStateUpdateSequence.indexOf(
    dbState as BurnState
  );
  const stateIndex = releaseTxStateUpdateSequence.indexOf(state as BurnState);
  if (stateIndex <= 0) {
    //dont update for created (updated during creation) or not supported states
    return false;
  }
  return stateIndex > dbStateIndex;
};

export const useReleaseTransactionPersistence = (
  tx: GatewaySession | DbGatewaySession,
  state: BurnMachineSchemaState
) => {
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("release tx/state", state);
    if (!state) {
      return;
    }
    db.getTx(tx)
      .then((dbTx) => {
        console.log("release data", dbTx);
        if (shouldUpdateReleaseTx(tx, dbTx, state)) {
          const newDbTx = { ...tx, meta: { state } };
          db.updateTx(newDbTx).then(() => {
            console.log("release updated", newDbTx, state);
            dispatch(updateTransaction(newDbTx));
          });
        }
      })
      .catch((err) => {
        console.warn("Release Tx synchronization failed", err);
      });
  }, [dispatch, tx, state]);
};
