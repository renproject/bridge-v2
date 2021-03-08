import { Chip, Dialog, makeStyles, styled } from "@material-ui/core";
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

export const WarningChip = styled(Chip)(({ theme }) => ({
  color: theme.customColors.alertWarning,
  backgroundColor: theme.customColors.alertWarningBackground,
}));

export const ExpiresChip = styled(Chip)(({ theme }) => ({
  color: theme.customColors.alertSuccess,
  backgroundColor: theme.customColors.alertSuccessBackground,
}));
