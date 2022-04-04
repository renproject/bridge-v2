import { Backdrop } from "@material-ui/core";
import Dialog, { DialogProps } from "@material-ui/core/Dialog";
import MuiDialogTitle, {
  DialogTitleProps,
} from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles, styled } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { BackArrowIcon } from "../icons/RenIcons";
import { BridgePurePaper } from "../layout/Paper";

export const useBridgeModalTitleStyles = makeStyles((theme) => ({
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  titleWrapper: {
    flexGrow: 1,
    paddingLeft: 30, // compensating icons for visual text centering
    paddingRight: 30,
    textAlign: "center",
  },
  title: {},
  customContentWrapper: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonWrapper: {
    minWidth: 30,
  },
  closeButton: {
    color: theme.palette.grey[600],
  },
  prevButtonWrapper: {
    minWidth: 30,
  },
  prevButton: {
    color: theme.palette.grey[600],
  },
}));

type BridgeModalTitleProps = DialogTitleProps &
  Pick<DialogProps, "onClose"> & {
    onPrev?: () => void;
  };

export const BridgeModalTitle: FunctionComponent<BridgeModalTitleProps> = ({
  title,
  onClose,
  onPrev,
  className,
  children,
}) => {
  const styles = useBridgeModalTitleStyles();
  const handleClose = () => {
    if (onClose) {
      onClose({}, "backdropClick");
    }
  };
  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    }
  };

  return (
    <MuiDialogTitle
      disableTypography
      className={classNames(className, styles.dialogTitle)}
    >
      <div className={styles.prevButtonWrapper}>
        {onPrev ? (
          <IconButton
            aria-label="prev"
            className={styles.prevButton}
            onClick={handlePrev}
          >
            <BackArrowIcon fontSize="inherit" />
          </IconButton>
        ) : null}
      </div>
      {title && (
        <div className={styles.titleWrapper}>
          <Typography variant="body1" className={styles.title}>
            {title}
          </Typography>
        </div>
      )}
      {children && (
        <div className={styles.customContentWrapper}>{children}</div>
      )}
      <div className={styles.closeButtonWrapper}>
        {onClose ? (
          <IconButton
            aria-label="close"
            className={styles.closeButton}
            onClick={handleClose}
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
  maxWidth,
}) => {
  return (
    <Dialog onClose={onClose} open={open} maxWidth={maxWidth}>
      <BridgeModalTitle onClose={onClose} title={title} />
      {children}
    </Dialog>
  );
};

const useNestedDrawerStyles = makeStyles((theme) => ({
  backdrop: {
    overflow: "hidden",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    // zIndex: "auto",
    zIndex: 1,
    borderRadius: 20,
  },
  positioner: {
    position: "relative",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  paper: {
    margin: "auto 0 0 0",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  paperFixed: {
    position: "absolute",
    top: 160,
    bottom: 0,
  },
}));

type NestedDrawerProps = DialogProps & {
  open: boolean;
  fixed?: boolean;
};

const stopPropagation = (event: any) => {
  event.stopPropagation();
};

export const NestedDrawerWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  flexGrow: 2,
  justifyContent: "space-between",
});

export const NestedDrawerContent = styled("div")({});
export const NestedDrawerActions = styled("div")({});

export const NestedDrawer: FunctionComponent<NestedDrawerProps> = ({
  open,
  onClose,
  title,
  fixed = true,
  className,
  children,
}) => {
  const styles = useNestedDrawerStyles();
  const resolvedClassName = classNames(className, styles.paper, {
    [styles.paperFixed]: fixed,
  });

  return (
    <Backdrop className={styles.backdrop} open={open} onClick={onClose as any}>
      <BridgePurePaper className={resolvedClassName} onClick={stopPropagation}>
        {title && <BridgeModalTitle onClose={onClose} title={title} />}
        {children}
      </BridgePurePaper>
    </Backdrop>
  );
};
