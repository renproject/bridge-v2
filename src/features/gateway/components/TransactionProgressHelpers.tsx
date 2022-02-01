import { Box, Fade, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { TransactionStatusInfo } from "../../../components/progress/ProgressHelpers";
import { maxConfirmations } from "../gatewayTransactionUtils";

type TransactionProgressInfoProps = {
  confirmations: number;
  target: number;
  averageConfirmationTime?: number;
};

export const TransactionProgressInfo: FunctionComponent<
  TransactionProgressInfoProps
> = ({ confirmations, target, averageConfirmationTime }) => {
  const { t } = useTranslation();
  let minutesRemaining = null;
  if (averageConfirmationTime && target) {
    const secondsRemaining =
      (target - Math.min(confirmations, target)) * averageConfirmationTime;
    minutesRemaining = Math.ceil(secondsRemaining / 60);
  }
  return (
    <Box mb={2} textAlign="center">
      <Typography variant="body1">
        {t("tx.confirmations-target-counter-message", {
          confirmations: maxConfirmations(confirmations, target),
          target,
        })}
      </Typography>
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
