import { Box, Typography, useTheme } from "@material-ui/core";
import { GatewaySession } from "@renproject/rentx";
import React, { FunctionComponent, useCallback } from "react";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import { MetamaskFullIcon } from "../../../components/icons/RenIcons";
import { Link } from "../../../components/links/Links";
import {
  BigDoneIcon,
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusInfo,
} from "../../../components/progress/ProgressHelpers";
import { useSetPaperTitle } from "../../../pages/MainPage";
import { getChainExplorerLink } from "../../transactions/transactionsUtils";
import { getBurnAndReleaseParams } from "../releaseUtils";

export const a = 1;

type ReleaseProgressStatusProps = {
  tx: GatewaySession;
  onSubmit?: () => void;
  submitting?: boolean;
  pending?: boolean;
};

export const ReleaseProgressStatus: FunctionComponent<ReleaseProgressStatusProps> = ({
  tx,
  onSubmit,
  submitting = false,
  pending = false,
}) => {
  useSetPaperTitle("Submit");
  const theme = useTheme();
  const { burnChainConfig, burnTxHash, burnTxLink } = getBurnAndReleaseParams(
    tx
  );

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit();
    }
  }, [onSubmit]);

  const buttonSubmitting = pending || submitting;

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={theme.customColors.skyBlue} processing>
          {pending ? (
            <TransactionStatusInfo
              status="Pending"
              chain={burnChainConfig.full}
              address={
                <Link
                  color="primary"
                  underline="hover"
                  href={burnTxLink}
                  target="_blank"
                >
                  {burnTxHash}
                </Link>
              }
            />
          ) : (
            <MetamaskFullIcon fontSize="inherit" color="inherit" />
          )}
        </ProgressWithContent>
      </ProgressWrapper>
      {!pending && (
        <Typography variant="body1" align="center" gutterBottom>
          To receive your BTC, submit a release transaction to Ethereum via your
          Web3 Wallet.
        </Typography>
      )}
      <ActionButtonWrapper>
        <ActionButton onClick={handleSubmit} disabled={buttonSubmitting}>
          {buttonSubmitting ? "Submitting" : "Submit"} to {burnChainConfig.full}
          {buttonSubmitting && "..."}
        </ActionButton>
      </ActionButtonWrapper>
    </>
  );
};

type ReleaseCompletedStatusProps = {
  tx: GatewaySession;
  onReturn?: () => void;
};

export const ReleaseCompletedStatus: FunctionComponent<ReleaseCompletedStatusProps> = ({
  tx,
  onReturn = () => {},
}) => {
  useSetPaperTitle("Complete");
  const theme = useTheme();
  const {
    releaseChainConfig,
    burnChainConfig,
    networkConfig,
  } = getBurnAndReleaseParams(tx);

  const burnTxLink = getChainExplorerLink(
    burnChainConfig.symbol,
    networkConfig.symbol,
    "0x12313123131"
  ); // TODO
  const releaseTxLink = getChainExplorerLink(
    releaseChainConfig.symbol,
    networkConfig.symbol,
    "0x12313123131"
  );

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={theme.palette.primary.main}>
          <BigDoneIcon />
        </ProgressWithContent>
      </ProgressWrapper>
      <ActionButtonWrapper>
        <ActionButton onClick={onReturn}>Return</ActionButton>
      </ActionButtonWrapper>
      <Box display="flex" justifyContent="space-between" py={2}>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={releaseTxLink}
          target="_blank"
        >
          {releaseChainConfig.full} transaction
        </Link>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={burnTxLink}
          target="_blank"
        >
          {burnChainConfig.full} transaction
        </Link>
      </Box>
    </>
  );
};
