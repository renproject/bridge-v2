import { Box, Fade, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { TransactionStatusInfo } from "../../../components/progress/ProgressHelpers";
import { maxConfirmations } from "../gatewayTransactionUtils";

type TransactionProgressInfoProps = {
  confirmations: number | null;
  target: number | null;
  averageConfirmationTime?: number;
};

export const TransactionProgressInfo: FunctionComponent<
  TransactionProgressInfoProps
> = ({ confirmations, target, averageConfirmationTime }) => {
  const { t } = useTranslation();
  const hasConfirmations = confirmations !== null && target !== null;

  let minutesRemaining = null;
  if (averageConfirmationTime && target) {
    const secondsRemaining =
      (target - Math.min(confirmations || 0, target)) * averageConfirmationTime;
    minutesRemaining = Math.ceil(secondsRemaining / 60);
  }
  const showConfirmations = target !== null;

  return (
    <Box mb={2} textAlign="center">
      {showConfirmations && (
        <>
          {hasConfirmations ? (
            <Typography variant="body1">
              {t("tx.confirmations-target-counter-message", {
                confirmations: maxConfirmations(confirmations, target),
                target,
              })}
            </Typography>
          ) : (
            <Skeleton variant="text" width={120} height={14} />
          )}
        </>
      )}
      <Fade in={Boolean(minutesRemaining)}>
        <Typography variant="body2" color="textSecondary">
          {t("tx.progress-etr-counter-short-label") +
            ": " +
            minutesRemaining +
            t("common.minutes-abbr")}
        </Typography>
      </Fade>
    </Box>
  );
};

export const RenVMSubmittingInfo: FunctionComponent = () => {
  return <TransactionStatusInfo status="Submitting to RenVM..." />;
};

export const RenVMReleasingInfo: FunctionComponent = () => {
  return <TransactionStatusInfo status="Releasing from RenVM..." />;
};
