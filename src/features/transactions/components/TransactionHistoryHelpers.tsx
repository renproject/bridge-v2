import {
  Chip,
  Dialog,
  makeStyles,
  styled,
  Typography,
} from "@material-ui/core";
import { DialogProps } from "@material-ui/core/Dialog/Dialog";
import React, { FunctionComponent } from "react";

const useTransactionHistoryDialogStyles = makeStyles((theme) => ({
  paper: {
    marginTop: 0, // 82,
    background: theme.customColors.greyHeaderBackground,
  },
  container: {
    paddingTop: 68,
  },
}));

export const TransactionHistoryDialog: FunctionComponent<DialogProps> = (
  props
) => {
  const classes = useTransactionHistoryDialogStyles();
  return <Dialog maxWidth="sm" fullWidth classes={classes} {...props} />;
};

export const WarningLabel = styled(Typography)(({ theme }) => ({
  color: theme.customColors.alertWarning,
  fontSize: 12,
}));

export const SuccessChip = styled(Chip)(({ theme }) => ({
  color: theme.customColors.alertSuccess,
  backgroundColor: theme.customColors.alertSuccessBackground,
}));

export const WarningChip = styled(Chip)(({ theme }) => ({
  color: theme.customColors.alertWarning,
  backgroundColor: theme.customColors.alertWarningBackground,
}));

export const ErrorChip = styled(Chip)(({ theme }) => ({
  color: theme.customColors.alertError,
  backgroundColor: theme.customColors.alertErrorBackground,
}));
