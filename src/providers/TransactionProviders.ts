import { InputChainTransaction } from "@renproject/utils";
import { createStateContext } from "react-use";

export type UpdateTransactionFn = (inputTx: InputChainTransaction) => void;

export type TransactionUpdater = UpdateTransactionFn | null;

const [useTransactionUpdater, TransactionUpdaterProvider] =
  createStateContext<TransactionUpdater>(null);

export { useTransactionUpdater, TransactionUpdaterProvider };
