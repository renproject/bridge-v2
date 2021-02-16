import { Dialog, makeStyles } from "@material-ui/core";
import { DialogProps } from "@material-ui/core/Dialog/Dialog";
import React, { FunctionComponent } from "react";

const useTransactionHistoryDialogStyles = makeStyles({
  paper: {
    marginTop: 0, // 82,
  },
  container: {
    paddingTop: 68
  }
});

export const TransactionHistoryDialog: FunctionComponent<DialogProps> = (
  props
) => {
  const classes = useTransactionHistoryDialogStyles();
  return <Dialog maxWidth="sm" fullWidth classes={classes} {...props} />;
};
