import { Chip, Typography } from "@material-ui/core";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { SmallActionButton } from "../../../components/buttons/Buttons";
import { EmptyIcon } from "../../../components/icons/RenIcons";
import { Link } from "../../../components/links/Links";
import { TransactionStatusIndicator } from "../../../components/progress/ProgressHelpers";
import { useTransactionEntryStyles } from "../../../components/transactions/TransactionsGrid";
import { Debug } from "../../../components/utils/Debug";
import { paths } from "../../../pages/routes";
import { getFormattedDateTime } from "../../../utils/dates";
import { TransactionItemProps } from "../../transactions/components/TransactionsHelpers";
import { setTxHistoryOpened } from "../../transactions/transactionsSlice";
import {
  cloneTx,
  createTxQueryString,
  TxEntryStatus,
  TxPhase,
} from "../../transactions/transactionsUtils";
import {
  DepositMachineSchemaState,
  getLockAndMintParams,
  useMintMachine,
  useMintTransactionPersistence,
} from "../mintUtils";

export const MintTransactionEntryResolver: FunctionComponent<TransactionItemProps> = ({
  tx,
}) => {
  const { meta } = getLockAndMintParams(tx);
  if (meta.status === TxEntryStatus.COMPLETED) {
    console.log("rendering completed");
    return <MintTransactionEntry tx={tx} />;
  }
  return <MintTransactionEntryMachine tx={tx} />;
};

export const MintTransactionEntryMachine: FunctionComponent<TransactionItemProps> = ({
  tx,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [initialTx] = useState(cloneTx(tx)); // TODO: mint machine is mutating tx
  const [current, , service] = useMintMachine(initialTx);
  useEffect(
    () => () => {
      service.stop();
    },
    [service]
  );
  useEffect(() => {
    console.log("tx changed", current.context.tx);
  }, [current.context.tx]);

  useEffect(() => {
    console.log("cv", current.value);
  }, [current.value]);

  useMintTransactionPersistence(tx, current.value as DepositMachineSchemaState);

  const handleFinish = useCallback(() => {
    history.push({
      pathname: paths.MINT_TRANSACTION,
      search: "?" + createTxQueryString(tx),
      state: {
        txState: {
          reloadTx: true,
        },
      },
    });
    dispatch(setTxHistoryOpened(false));
  }, [dispatch, history, tx]);

  return (
    <MintTransactionEntry tx={current.context.tx} onAction={handleFinish} />
  );
};

export const MintTransactionEntry: FunctionComponent<TransactionItemProps> = ({
  tx,
  onAction,
}) => {
  const styles = useTransactionEntryStyles();
  const {
    lockChainConfig,
    lockConfirmations,
    lockTargetConfirmations,
    lockTxLink,
    mintCurrencyConfig,
    mintChainConfig,
    mintTxLink,
    meta: { status, phase, createdTimestamp },
  } = getLockAndMintParams(tx);

  const { date, time } = getFormattedDateTime(createdTimestamp);

  let StatusIcon = EmptyIcon;
  if (phase === TxPhase.LOCK) {
    StatusIcon = lockChainConfig.Icon;
  } else if (phase === TxPhase.MINT) {
    StatusIcon = mintChainConfig.Icon;
  }

  const params = getLockAndMintParams(tx);
  return (
    <>
      <Debug wrapper it={{ tx, params }} />
      <Debug disable it={{ meta: params.meta }} />
      <div className={styles.root}>
        <div className={styles.details}>
          <div className={styles.datetime}>
            <Chip size="small" label={date} className={styles.date} />
            <Chip size="small" label={time} />
          </div>
          <div className={styles.description}>
            <Typography variant="body2" className={styles.title}>
              Mint {tx.targetAmount} {mintCurrencyConfig.short} on{" "}
              {mintChainConfig.full}
            </Typography>
          </div>
          <div className={styles.links}>
            {status === TxEntryStatus.EXPIRED && phase === TxPhase.LOCK && (
              <Typography variant="body2" color="error" className={styles.link}>
                Transaction expired
              </Typography>
            )}
            {lockTxLink && (
              <Link
                href={lockTxLink}
                target="_blank"
                external
                color="primary"
                underline="hover"
                className={styles.link}
              >
                {lockChainConfig.full} transaction
              </Link>
            )}
            {status === TxEntryStatus.EXPIRED && phase === TxPhase.MINT && (
              <Typography variant="body2" color="error" className={styles.link}>
                Transaction expired
              </Typography>
            )}
            {mintTxLink && (
              <Link
                href={mintTxLink}
                target="_blank"
                external
                color="primary"
                underline="hover"
                className={styles.link}
              >
                {mintChainConfig.full} transaction
              </Link>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          {status === TxEntryStatus.ACTION_REQUIRED && (
            <SmallActionButton onClick={onAction}>
              Finish mint
            </SmallActionButton>
          )}
          {status === TxEntryStatus.PENDING &&
            lockConfirmations < lockTargetConfirmations && (
              <Typography color="primary" variant="body2">
                {lockConfirmations}/{lockTargetConfirmations} Confirmations
              </Typography>
            )}
        </div>
        <div className={styles.status}>
          <TransactionStatusIndicator
            needsAction={status === TxEntryStatus.ACTION_REQUIRED}
            Icon={StatusIcon}
            showConfirmations={phase === TxPhase.LOCK}
            confirmations={lockConfirmations}
            targetConfirmations={lockTargetConfirmations}
          />
        </div>
      </div>
    </>
  );
};
