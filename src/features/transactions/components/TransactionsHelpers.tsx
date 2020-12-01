import { Button, Chip, styled, Typography, useTheme } from "@material-ui/core";
import { GatewaySession } from "@renproject/ren-tx";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
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
import { usePaperTitle } from "../../../pages/MainPage";
import { getLockAndMintParams } from "../../mint/mintUtils";

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
};

export const MintTransactionEntry: FunctionComponent<TransactionItemProps> = ({
  tx,
}) => {
  const styles = useTransactionEntryStyles();
  const {
    lockChainConfig,
    lockConfirmations,
    lockTxAmount,
    lockTxLink,
    lockTargetConfirmations,
    mintCurrencyConfig,
    mintChainConfig,
    mintTxLink,
  } = getLockAndMintParams(tx);
  const chainSymbol = mintChainConfig.symbol;
  return (
    <div className={styles.root}>
      <div className={styles.details}>
        <div className={styles.datetime}>
          <Chip size="small" label="04/02/20" className={styles.date} />
          <Chip size="small" label="23:45:32 UTC" />
        </div>
        <div className={styles.description}>
          <Typography variant="body2">
            Mint {lockTxAmount} {mintCurrencyConfig.short} on{" "}
            {mintChainConfig.full}
          </Typography>
        </div>
        <div className={styles.links}>
          <Link
            href={lockTxLink}
            target="_blank"
            external
            color="primary"
            className={styles.link}
          >
            {lockChainConfig.full} transaction
          </Link>
          <Link
            href={mintTxLink}
            target="_blank"
            external
            color="primary"
            className={styles.link}
          >
            {mintChainConfig.full} transaction
          </Link>
        </div>
      </div>
      <div className={styles.status}>
        <TransactionStatusIndicator
          chain={chainSymbol}
          status={"completed"}
          confirmations={lockConfirmations}
          targetConfirmations={lockTargetConfirmations}
        />
      </div>
    </div>
  );
};
