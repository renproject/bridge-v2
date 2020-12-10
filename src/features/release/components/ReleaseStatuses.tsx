import { Box, Typography, useTheme } from "@material-ui/core";
import { GatewaySession } from "@renproject/ren-tx";
import React, { FunctionComponent, useCallback, useEffect } from "react";
import { useHistory } from "react-router-dom";
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
import { Debug } from "../../../components/utils/Debug";
import { paths } from "../../../pages/routes";
import { useNotifications } from "../../../providers/Notifications";
import { useSetPaperTitle } from "../../../providers/TitleProviders";
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
}) => {
  useSetPaperTitle("Completed");
  const history = useHistory();
  const {
    releaseChainConfig,
    burnChainConfig,
    burnTxLink,
    releaseTxLink,
  } = getBurnAndReleaseParams(tx);
  const handleReturn = useCallback(() => {
    history.push(paths.RELEASE);
  }, [history]);
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent>
          <BigDoneIcon />
        </ProgressWithContent>
      </ProgressWrapper>
      <ActionButtonWrapper>
        <ActionButton onClick={handleReturn}>Return</ActionButton>
      </ActionButtonWrapper>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" py={2}>
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
      <Debug it={{ tx }} />
    </>
  );
};
