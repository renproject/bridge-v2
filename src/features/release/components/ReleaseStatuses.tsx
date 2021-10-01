import { Box, Grow, Typography, useTheme } from "@material-ui/core";
import { BurnSession, ErroringBurnSession } from "@renproject/ren-tx";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
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

const enableResubmitting = false;

type ReleaseProgressStatusProps = {
  tx: AnyBurnSession;
  onSubmit?: () => void;
  onResubmit?: () => void;
  onReload?: () => void;
  submittingError?: boolean;
  generalError?: boolean;
  submitting?: boolean;
  pending?: boolean;
};

export const ReleaseProgressStatus: FunctionComponent<ReleaseProgressStatusProps> = ({
  tx,
  onSubmit,
  onResubmit,
  onReload,
  submitting = false,
  submittingError,
  generalError,
  pending = false,
}) => {
  const { t } = useTranslation();
  useSetPaperTitle(t("release.submit-title"));
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
              status={t("release.pending-confirmations-message", {
                confirmations: tx.transaction?.sourceTxConfs,
                targetConrifmations: tx.transaction?.sourceTxConfTarget,
              })}
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
          {t("release.submit-tx-message", {
            currency: releaseCurrencyConfig.short,
            chain: burnChainConfig.full,
          })}
        </Typography>
      )}
      <ActionButtonWrapper>
        <ActionButton onClick={handleSubmit} disabled={buttonSubmitting}>
          {buttonSubmitting
            ? t("release.submitting-label")
            : t("release.submit-label")}{" "}
          {t("release.submit-to-label")} {burnChainConfig.full}
          {buttonSubmitting && "..."}
        </ActionButton>
      </ActionButtonWrapper>
      <SubmitErrorDialog
        open={Boolean(submittingError)}
        onAction={onReload}
        onAlternativeAction={enableResubmitting ? onResubmit : undefined}
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
  const { t } = useTranslation();
  useSetPaperTitle(t("release.completed-title"));
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

  const notificationMessage = t("release.success-notification-message", {
    amount: tx.targetAmount,
    currency: releaseCurrencyConfig.short,
  });
  const { showNotification } = useNotifications();
  const { showBrowserNotification } = useBrowserNotifications();
  useEffectOnce(() => {
    showNotification(
      <span>
        {notificationMessage}{" "}
        <Link external href={releaseTxLink || releaseAddressLink}>
          View {releaseChainConfig.full}{" "}
          {releaseTxLink ? t("common.transaction") : t("common.address")}
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
          {releaseChainConfig.full}{" "}
          {releaseTxLink ? t("common.transaction") : t("common.address")}
        </Link>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={burnTxLink}
        >
          {burnChainConfig.full} {t("common.transaction")}
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
  const { t } = useTranslation();
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
      <ProgressStatus reason={t("release.status-releasing-title")} />
      <Grow in={show}>
        <Typography variant="body2" color="textSecondary" align="center">
          {t("release.status-releasing-message", {
            chain: burnChainConfig.full,
          })}
        </Typography>
      </Grow>
    </>
  );
};
