import Dialog, { DialogProps } from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import React, { FunctionComponent } from "react";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  titleWrapper: {
    flexGrow: 1,
    paddingLeft: 30, // compensating close icon for visual text centering
    textAlign: "center",
  },
  title: {},
  closeButtonWrapper: {},
  closeButton: {
    color: theme.palette.grey[500],
  },
}));

export const BridgeModal: FunctionComponent<DialogProps> = ({
  title,
  open,
  onClose,
  children,
}) => {
  const styles = useStyles();
  const onCustomClose = () => {
    if (onClose) {
      onClose({}, "backdropClick");
    }
  };

  return (
    <Dialog onClose={onClose} aria-labelledby="dialog-title" open={open}>
      <MuiDialogTitle disableTypography className={styles.dialogTitle}>
        <div className={styles.titleWrapper}>
          <Typography variant="body1" className={styles.title}>
            {title}
          </Typography>
        </div>
        <div className={styles.closeButtonWrapper}>
          {onClose ? (
            <IconButton
              aria-label="close"
              className={styles.closeButton}
              onClick={onCustomClose}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          ) : null}
        </div>
      </MuiDialogTitle>
      {children}
    </Dialog>
  );
};
