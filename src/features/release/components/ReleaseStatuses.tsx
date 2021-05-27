import { Box, Grow, Typography, useTheme } from "@material-ui/core";
import { BurnSession, ErroringBurnSession } from "@renproject/ren-tx";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
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
import {
  AnyBurnSession,
  GeneralErrorDialog,
  ProgressStatus,
  SubmitErrorDialog,
} from "../../transactions/components/TransactionsHelpers";
import { resetRelease } from "../releaseSlice";
import { getBurnAndReleaseParams } from "../releaseUtils";

export const a = 1;

type ReleaseProgressStatusProps = {
  tx: AnyBurnSession;
  onSubmit?: () => void;
  onReload?: () => void;
  submittingError?: boolean;
  generalError?: boolean;
  submitting?: boolean;
  pending?: boolean;
};

export const ReleaseProgressStatus: FunctionComponent<ReleaseProgressStatusProps> = ({
  tx,
  onSubmit,
  onReload,
  submitting = false,
  submittingError,
  generalError,
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
        <ProgressWithContent
          color={theme.customColors.skyBlue}
          processing={buttonSubmitting}
        >
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
      <SubmitErrorDialog
        open={Boolean(submittingError)}
        onAction={onReload}
        error={(tx as ErroringBurnSession<any, any>).error}
      />
      <GeneralErrorDialog
        open={Boolean(generalError)}
        onAction={onReload}
        error={(tx as ErroringBurnSession<any, any>).error}
      />
    </>
  );
};

type ReleaseCompletedStatusProps = {
  tx: BurnSession<any, any>;
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
    releaseAddressLink,
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
        <Link external href={releaseTxLink || releaseAddressLink}>
          View {releaseChainConfig.full}{" "}
          {releaseTxLink ? "transaction" : "address"}
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
        <ActionButton onClick={handleReturn}>Back to start</ActionButton>
      </ActionButtonWrapper>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" py={2}>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={releaseTxLink || releaseAddressLink}
        >
          {releaseChainConfig.full} {releaseTxLink ? "transaction" : "address"}
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

type ReleaseAcceptedStatusProps = {
  tx: BurnSession<any, any>;
};

export const ReleaseAcceptedStatus: FunctionComponent<ReleaseAcceptedStatusProps> = ({
  tx,
}) => {
  const { burnChainConfig } = getBurnAndReleaseParams(tx);
  const [show, setShow] = useState(false);
  useEffect(() => {
    let timer = setTimeout(() => setShow(true), 20 * 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    <>
      <ProgressStatus reason="Releasing from RenVM" />
      <Grow in={show}>
        <Typography variant="body2" color="textSecondary" align="center">
          Processing a transaction on {burnChainConfig.full} can sometimes take
          longer due to heavier network load (congestion), please wait
          patiently.
        </Typography>
      </Grow>
    </>
  );
};
