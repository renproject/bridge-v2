import { Chip, styled, Tooltip, Typography } from "@material-ui/core";
import React, { FunctionComponent, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { SmallActionButton } from "../../../components/buttons/Buttons";
import {
  CompletedIcon,
  EmptyIcon,
  TooltipIcon,
} from "../../../components/icons/RenIcons";
import { Link } from "../../../components/links/Links";
import { SimplestPagination } from "../../../components/pagination/SimplePagination";
import { TransactionStatusIndicator } from "../../../components/progress/ProgressHelpers";
import { useTransactionEntryStyles } from "../../../components/transactions/TransactionsGrid";
import { Debug } from "../../../components/utils/Debug";
import { paths } from "../../../pages/routes";
import { getFormattedDateTime } from "../../../utils/dates";
import { TransactionItemProps } from "../../transactions/components/TransactionsHelpers";
import { setTxHistoryOpened } from "../../transactions/transactionsSlice";
import {
  createTxQueryString,
  isTransactionCompleted,
  TxEntryStatus,
  TxPhase,
} from "../../transactions/transactionsUtils";
import { setChain } from "../../wallet/walletSlice";
import {
  DepositMachineSchemaState,
  useDepositPagination,
  useMintMachine,
  useMintTransactionPersistence,
} from "../mintHooks";
import { resetMint } from "../mintSlice";
import { getLockAndMintParams, isMintTransactionCompleted } from "../mintUtils";

export const MintTransactionEntryResolver: FunctionComponent<TransactionItemProps> = ({
  tx,
  isActive,
}) => {
  if (isMintTransactionCompleted(tx) || isActive) {
    return <MintTransactionEntry tx={tx} isActive={isActive} />;
  }
  return <MintTransactionEntryMachine tx={tx} />;
};

export const MintTransactionEntryMachine: FunctionComponent<TransactionItemProps> = ({
  tx,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [current, , service] = useMintMachine(tx);
  useEffect(
    () => () => {
      service.stop();
    },
    [service]
  );

  const deposit = Object.values(current.context.depositMachines || {})[0];
  useMintTransactionPersistence(
    current.context.tx,
    (deposit?.state.value || "") as DepositMachineSchemaState
  );

  const handleFinish = useCallback(
    (depositHash = "") => {
      const txWithDepositHash = { ...tx, depositHash };
      history.push({
        pathname: paths.MINT_TRANSACTION,
        search: "?" + createTxQueryString(txWithDepositHash),
        state: {
          txState: {
            reloadTx: true,
          },
        },
      });
      dispatch(setTxHistoryOpened(false));
    },
    [dispatch, history, tx]
  );

  return (
    <MintTransactionEntry tx={current.context.tx} onContinue={handleFinish} />
  );
};

const WarningChip = styled(Chip)(({ theme }) => ({
  color: theme.customColors.alertWarning,
  backgroundColor: theme.customColors.alertWarningBackground,
}));

export const MintTransactionEntry: FunctionComponent<TransactionItemProps> = ({
  tx,
  isActive,
  onContinue,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const styles = useTransactionEntryStyles();

  const {
    handleNext,
    handlePrev,
    currentIndex,
    currentHash,
    total,
  } = useDepositPagination(tx);

  const {
    lockChainConfig,
    lockConfirmations,
    lockTargetConfirmations,
    lockTxLink,
    lockTxAmount,
    mintCurrencyConfig,
    mintChainConfig,
    mintTxLink,
    meta: { status, phase, createdTimestamp, transactionsCount },
  } = getLockAndMintParams(tx, currentHash);

  const handleRestart = useCallback(() => {
    const {
      lockCurrencyConfig,
      mintChainConfig,
      suggestedAmount,
    } = getLockAndMintParams(tx, currentHash);
    dispatch(setTxHistoryOpened(false));
    dispatch(
      resetMint({
        currency: lockCurrencyConfig.symbol,
        amount: suggestedAmount,
      })
    );
    dispatch(setChain(mintChainConfig.symbol));
    history.push({
      pathname: paths.MINT,
    });
  }, [dispatch, history, tx, currentHash]);

  const { date, time } = getFormattedDateTime(createdTimestamp);

  let StatusIcon = EmptyIcon;
  if (status === TxEntryStatus.COMPLETED) {
    StatusIcon = CompletedIcon;
  } else if (phase === TxPhase.LOCK) {
    StatusIcon = lockChainConfig.Icon;
  } else if (phase === TxPhase.MINT) {
    StatusIcon = mintChainConfig.Icon;
  }

  const handlePageChange = useCallback(
    (event: any, newPage: number) => {
      console.log("pge");
      newPage > currentIndex ? handleNext() : handlePrev();
    },
    [currentIndex, handleNext, handlePrev]
  );

  const handleContinue = useCallback(() => {
    if (onContinue) {
      onContinue(currentHash);
    }
  }, [currentHash, onContinue]);

  const params = getLockAndMintParams(tx, currentHash);
  return (
    <>
      <Debug
        wrapper
        it={{
          currentHash,
          currentIndex,
          tx,
          params,
          completed: isTransactionCompleted(tx),
        }}
      />
      <div className={styles.root}>
        <div className={styles.details}>
          <div className={styles.datetime}>
            <Chip size="small" label={date} className={styles.date} />
            <Chip size="small" label={time} className={styles.time} />
            {transactionsCount > 1 && (
              <div className={styles.multiple}>
                <WarningChip
                  size="small"
                  className={styles.multipleLabel}
                  label="Multiple deposits"
                />
                <SimplestPagination
                  className={styles.multiplePagination}
                  count={total}
                  rowsPerPage={1}
                  page={currentIndex}
                  onChangePage={handlePageChange}
                />
              </div>
            )}
          </div>
          <div className={styles.description}>
            <Typography variant="body2" className={styles.title}>
              Mint {lockTxAmount || tx.targetAmount} {mintCurrencyConfig.short}{" "}
              on {mintChainConfig.full}
            </Typography>
          </div>
          <div className={styles.links}>
            {lockTxLink && (
              <Link
                href={lockTxLink}
                external
                color="primary"
                underline="hover"
                className={styles.link}
              >
                {lockChainConfig.full} transaction
              </Link>
            )}
            {status === TxEntryStatus.EXPIRED && (
              <>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  display="inline"
                  className={styles.expired}
                >
                  <Tooltip title="This Gateway Address has expired. Gateway Addresses are only valid for 24 hours. If you have sent funds to this Gateway Address but have not submitted them to the destination chain then they are lost forever.">
                    <span>
                      <TooltipIcon
                        fontSize="inherit"
                        color="inherit"
                        className={styles.tooltipIcon}
                      />
                    </span>
                  </Tooltip>
                  Expired
                </Typography>
                <Link
                  color="primary"
                  underline="hover"
                  className={styles.link}
                  onClick={handleRestart}
                >
                  Restart transaction
                </Link>
              </>
            )}
            {mintTxLink && (
              <Link
                href={mintTxLink}
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
          {isActive && (
            <Typography color="primary" variant="body2">
              Currently viewing
            </Typography>
          )}
          {!isActive && status === TxEntryStatus.ACTION_REQUIRED && (
            <SmallActionButton onClick={handleContinue}>
              {phase === TxPhase.LOCK ? "Continue" : "Finish"} mint
            </SmallActionButton>
          )}
          {!isActive &&
            status === TxEntryStatus.PENDING &&
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
