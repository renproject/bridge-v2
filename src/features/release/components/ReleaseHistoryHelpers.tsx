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
import { CompletedIcon, EmptyIcon } from "../../../components/icons/RenIcons";
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
  BurnMachineSchemaState,
  getBurnAndReleaseParams,
  useBurnMachine,
  useReleaseTransactionPersistence,
} from "../releaseUtils";

export const ReleaseTransactionEntryResolver: FunctionComponent<TransactionItemProps> = ({
  tx,
}) => {
  const { meta } = getBurnAndReleaseParams(tx);
  if (meta.status === TxEntryStatus.COMPLETED) {
    console.log("release rendering completed");
    return <ReleaseTransactionEntry tx={tx} />;
  }
  return <ReleaseTransactionEntryMachine tx={tx} />;
};

export const ReleaseTransactionEntryMachine: FunctionComponent<TransactionItemProps> = ({
  tx,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [initialTx] = useState(cloneTx(tx)); // TODO: release machine is mutating tx
  const [current, , service] = useBurnMachine(initialTx);
  useEffect(
    () => () => {
      service.stop();
    },
    [service]
  );
  useEffect(() => {
    console.log("release tx changed", current.context.tx);
  }, [current.context.tx]);

  useEffect(() => {
    console.log("release cv", current.value);
  }, [current.value]);

  useReleaseTransactionPersistence(tx, current.value as BurnMachineSchemaState);

  const handleFinish = useCallback(() => {
    history.push({
      pathname: paths.RELEASE_TRANSACTION,
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
    <ReleaseTransactionEntry tx={current.context.tx} onAction={handleFinish} />
  );
};

export const ReleaseTransactionEntry: FunctionComponent<TransactionItemProps> = ({
  tx,
  onAction,
}) => {
  const styles = useTransactionEntryStyles();
  const {
    burnChainConfig,
    burnTxLink,
    releaseCurrencyConfig,
    releaseChainConfig,
    releaseTxLink,
    meta: { status, phase, createdTimestamp },
  } = getBurnAndReleaseParams(tx);

  const { date, time } = getFormattedDateTime(createdTimestamp);

  let StatusIcon = EmptyIcon;
  if (status === TxEntryStatus.COMPLETED) {
    StatusIcon = CompletedIcon;
  } else if (phase === TxPhase.BURN) {
    StatusIcon = burnChainConfig.Icon;
  }

  const params = getBurnAndReleaseParams(tx);
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
              Release {tx.targetAmount} {releaseCurrencyConfig.short} on{" "}
              {releaseChainConfig.full}
            </Typography>
          </div>
          <div className={styles.links}>
            {status === TxEntryStatus.EXPIRED && phase === TxPhase.BURN && (
              <Typography variant="body2" color="error" className={styles.link}>
                Transaction expired
              </Typography>
            )}
            {burnTxLink && (
              <Link
                href={burnTxLink}
                target="_blank"
                external
                color="primary"
                underline="hover"
                className={styles.link}
              >
                {burnChainConfig.full} transaction
              </Link>
            )}
            {releaseTxLink && (
              <Link
                href={releaseTxLink}
                target="_blank"
                external
                color="primary"
                underline="hover"
                className={styles.link}
              >
                {releaseChainConfig.full} transaction
              </Link>
            )}
          </div>
        </div>
        <div className={styles.actions}>
          {status === TxEntryStatus.ACTION_REQUIRED && (
            <SmallActionButton onClick={onAction}>
              Finish release
            </SmallActionButton>
          )}
        </div>
        <div className={styles.status}>
          <TransactionStatusIndicator
            needsAction={status === TxEntryStatus.ACTION_REQUIRED}
            Icon={StatusIcon}
            showConfirmations={phase === TxPhase.BURN}
          />
        </div>
      </div>
    </>
  );
};
