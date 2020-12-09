import { Backdrop } from '@material-ui/core'
import Dialog, { DialogProps } from '@material-ui/core/Dialog'
import MuiDialogTitle, { DialogTitleProps, } from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import React, { FunctionComponent } from 'react'
import { BridgePurePaper } from '../layout/Paper'

export const useBridgeModalTitleStyles = makeStyles((theme) => ({
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
    color: theme.palette.grey[600],
  },
}));

type BridgeModalTitleProps = DialogTitleProps & Pick<DialogProps, "onClose">;

export const BridgeModalTitle: FunctionComponent<BridgeModalTitleProps> = ({
  title,
  onClose,
}) => {
  const styles = useBridgeModalTitleStyles();
  const onCustomClose = () => {
    if (onClose) {
      onClose({}, "backdropClick");
    }
  };
  return (
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
  );
};

export const BridgeModal: FunctionComponent<DialogProps> = ({
  title,
  open,
  onClose,
  children,
}) => {
  return (
    <Dialog onClose={onClose} open={open}>
      <BridgeModalTitle onClose={onClose} title={title} />
      {children}
    </Dialog>
  );
};

const useNestedDrawerStyles = makeStyles((theme) => ({
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: "auto",
  },
  positioner: {
    position: "relative",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  paper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
}));

type NestedDrawerProps = DialogProps & {
  open: boolean;
};

export const NestedDrawer: FunctionComponent<NestedDrawerProps> = ({
  open,
  onClose,
  title,
  children,
}) => {
  const styles = useNestedDrawerStyles();

  return (
    <Backdrop id="x" className={styles.backdrop} open={open}>
      <BridgePurePaper className={styles.paper}>
        <BridgeModalTitle onClose={onClose} title={title} />
        {children}
      </BridgePurePaper>
    </Backdrop>
  );
};
