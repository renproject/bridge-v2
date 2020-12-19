import { Box, Typography, useTheme } from "@material-ui/core";
import { GatewaySession } from "@renproject/ren-tx";
import React, { FunctionComponent, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { useEffectOnce } from "react-use";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
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
import { useBrowserNotifications } from "../../notifications/notificationsUtils";
import { resetRelease } from "../releaseSlice";
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
  const {
    burnChainConfig,
    releaseCurrencyConfig,
    burnTxHash,
    burnTxLink,
  } = getBurnAndReleaseParams(tx);
  const { MainIcon } = burnChainConfig;

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit();
    }
  }, [onSubmit]);

  const buttonSubmitting = pending || submitting;

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={theme.customColors.skyBlue} processing={buttonSubmitting}>
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
            <MainIcon fontSize="inherit" color="inherit" />
          )}
        </ProgressWithContent>
      </ProgressWrapper>
      {!pending && (
        <Typography variant="body1" align="center" gutterBottom>
          To receive your {releaseCurrencyConfig.short}, submit a release
          transaction to {burnChainConfig.full} via your Web3 Wallet.
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
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    releaseChainConfig,
    releaseCurrencyConfig,
    burnChainConfig,
    burnTxLink,
    releaseTxLink,
  } = getBurnAndReleaseParams(tx);
  const handleReturn = useCallback(() => {
    history.push(paths.RELEASE);
    dispatch(resetRelease());
  }, [dispatch, history]);

  const notificationMessage = `Successfully released ${tx.targetAmount} ${releaseCurrencyConfig.short}`;
  const { showNotification } = useNotifications();
  const { showBrowserNotification } = useBrowserNotifications();
  useEffectOnce(() => {
    showNotification(
      <span>
        {notificationMessage}{" "}
        <Link external href={releaseTxLink}>
          View {releaseChainConfig.full} transaction
        </Link>
      </span>
    );
    showBrowserNotification(notificationMessage);
  });

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
        >
          {releaseChainConfig.full} transaction
        </Link>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={burnTxLink}
        >
          {burnChainConfig.full} transaction
        </Link>
      </Box>
      <Debug it={{ tx }} />
    </>
  );
};
