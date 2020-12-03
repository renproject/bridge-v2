import { Button, Chip, styled, Typography, useTheme } from "@material-ui/core";
import { GatewaySession } from "@renproject/ren-tx";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import { EmptyIcon } from "../../../components/icons/RenIcons";
import { PaperContent } from "../../../components/layout/Paper";
import { Link } from "../../../components/links/Links";
import { NestedDrawer } from "../../../components/modals/BridgeModal";
import {
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusIndicator,
  TransactionStatusInfo,
} from "../../../components/progress/ProgressHelpers";
import { useTransactionEntryStyles } from "../../../components/transactions/TransactionsGrid";
import { Debug } from "../../../components/utils/Debug";
import { usePaperTitle } from "../../../pages/MainPage";
import { paths } from "../../../pages/routes";
import { getFormattedDateTime } from "../../../utils/dates";
import { getLockAndMintParams, useMintMachine } from "../../mint/mintUtils";
import { setTxHistoryOpened } from "../transactionsSlice";
import {
  cloneTx,
  createTxQueryString,
  mintUpdateableEvents,
  TxActionChain,
  TxEntryStatus,
} from "../transactionsUtils";

export const ProcessingTimeWrapper = styled("div")({
  marginTop: 5,
  marginBottom: 5,
});

export const SpacedPaperContent = styled(PaperContent)({
  minHeight: 200,
});

type BookmarkPageWarningProps = {
  onClosed?: () => void;
};

export const BookmarkPageWarning: FunctionComponent<BookmarkPageWarningProps> = ({
  onClosed,
}) => {
  const [open, setOpen] = useState(true);
  const handleClose = useCallback(() => {
    if (onClosed) {
      onClosed();
    }
    setOpen(false);
  }, [onClosed]);
  return (
    <NestedDrawer title="Warning" open={open} onClose={handleClose}>
      <SpacedPaperContent topPadding bottomPadding>
        <Typography variant="h5" align="center" gutterBottom>
          Bookmark this page
        </Typography>
        <Typography variant="body2" align="center" gutterBottom>
          To ensure you don’t lose track of your transaction, please bookmark
          this page.
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <ActionButton onClick={handleClose}>I understand</ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </NestedDrawer>
  );
};

type EnableNotificationsWarningProps = {
  onClosed?: () => void;
};

export const EnableNotificationsWarning: FunctionComponent<EnableNotificationsWarningProps> = ({
  onClosed,
}) => {
  const [open, setOpen] = useState(true);
  const handleClose = useCallback(() => {
    if (onClosed) {
      onClosed();
    }
    setOpen(false);
  }, [onClosed]);
  return (
    <NestedDrawer title="Warning" open={open} onClose={handleClose}>
      <SpacedPaperContent topPadding bottomPadding>
        <Typography variant="h5" align="center" gutterBottom>
          Bookmark this page
        </Typography>
        <Typography variant="body2" align="center" gutterBottom>
          To ensure you don’t lose track of your transaction, please bookmark
          this page.
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <Button variant="text" color="primary">
          Do not enable
        </Button>
        <ActionButtonWrapper>
          <ActionButton onClick={handleClose}>
            Enable Browser Notifications
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </NestedDrawer>
  );
};

type ProgressStatusProps = {
  reason?: string;
  processing?: boolean;
};

export const ProgressStatus: FunctionComponent<ProgressStatusProps> = ({
  reason = "Loading...",
  processing = true,
}) => {
  const theme = useTheme();
  const [, setTitle] = usePaperTitle();
  useEffect(() => {
    setTitle(reason);
  }, [setTitle, reason]);
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent
          processing={processing}
          color={theme.palette.primary.main}
        >
          <TransactionStatusInfo status={reason} />
        </ProgressWithContent>
      </ProgressWrapper>
    </>
  );
};

type TransactionItemProps = {
  tx: GatewaySession;
  onAction?: () => void;
};

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
  onAction,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [initialTx] = useState(cloneTx(tx)); // TODO: mint machine is mutating tx
  const [current, , service] = useMintMachine(initialTx);
  console.log("rerendering");
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
    if (mintUpdateableEvents.indexOf(current.value as string) > -1) {
      console.log("saving here"); //TODO: update Tx in db
    }
  }, [current.value]);

  useEffect(() => {
    console.log(current.value);
  }, [current.value]);

  const handleNextAction = useCallback(() => {
    history.push({
      pathname: paths.MINT_TRANSACTION,
      search: "?" + createTxQueryString(tx),
    });
    dispatch(setTxHistoryOpened(false));
  }, [dispatch, history, tx]);

  return (
    <MintTransactionEntry tx={current.context.tx} onAction={handleNextAction} />
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
    lockTxLink,
    lockTargetConfirmations,
    mintCurrencyConfig,
    mintChainConfig,
    mintTxLink,
    meta: { status, actionChain },
  } = getLockAndMintParams(tx);

  const { date, time } = getFormattedDateTime(tx.expiryTime - 24 * 3600);

  let StatusIcon = EmptyIcon;
  if (actionChain === TxActionChain.LOCK) {
    StatusIcon = lockChainConfig.MainIcon;
  } else if (actionChain === TxActionChain.RELEASE) {
    StatusIcon = mintChainConfig.MainIcon;
  }

  return (
    <>
      <Debug disable it={{ tx, params: getLockAndMintParams(tx) }} />
      <div className={styles.root}>
        <div className={styles.details}>
          <div className={styles.datetime}>
            <Chip size="small" label={date} className={styles.date} />
            <Chip size="small" label={time} />
          </div>
          <div className={styles.description}>
            <Typography variant="body2">
              Mint {tx.targetAmount} {mintCurrencyConfig.short} on{" "}
              {mintChainConfig.full}
            </Typography>
          </div>
          <div className={styles.links}>
            {status === TxEntryStatus.EXPIRED && (
              <Typography variant="body2" color="error">
                Transaction expired
              </Typography>
            )}
            {status === TxEntryStatus.ACTION_REQUIRED &&
              actionChain === TxActionChain.LOCK &&
              onAction && (
                <Link
                  onClick={onAction}
                  target="_blank"
                  color="primary"
                  className={styles.link}
                >
                  Submit to {lockChainConfig.full}
                </Link>
              )}
            {lockTxLink && (
              <Link
                href={lockTxLink}
                target="_blank"
                external
                color="primary"
                className={styles.link}
              >
                {lockChainConfig.full} transaction
              </Link>
            )}
            {status === TxEntryStatus.ACTION_REQUIRED &&
              actionChain === TxActionChain.MINT &&
              onAction && (
                <Link
                  onClick={onAction}
                  target="_blank"
                  color="primary"
                  className={styles.link}
                >
                  Submit to {mintChainConfig.full}
                </Link>
              )}
            {mintTxLink && (
              <Link
                href={mintTxLink}
                target="_blank"
                external
                color="primary"
                className={styles.link}
              >
                {mintChainConfig.full} transaction
              </Link>
            )}
          </div>
        </div>
        <div className={styles.status}>
          <TransactionStatusIndicator
            needsAction={status === TxEntryStatus.ACTION_REQUIRED}
            Icon={StatusIcon}
            confirmations={lockConfirmations}
            targetConfirmations={lockTargetConfirmations}
          />
        </div>
      </div>
    </>
  );
};
