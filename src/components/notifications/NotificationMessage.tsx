import { makeStyles } from '@material-ui/core/styles'
import { Alert } from '@material-ui/lab'
import { useSnackbar } from 'notistack'
import React, { FunctionComponent } from 'react'

const useStyles = makeStyles((theme) => ({
  root: {
    width: 300,
  },
}));

const useSpecialInfoStyles = makeStyles((theme) => ({
  root: {
    width: "auto",
    color: theme.palette.text.primary,
    background: theme.palette.common.white,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: "none",
  },
  message: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  action: {
    paddingTop: 2,
  },
  icon: {
    display: 'none'
  }
}));

export const NotificationMessage: FunctionComponent<any> = React.forwardRef(
  (props, ref) => {
    const styles = useStyles();
    const specialInfoClasses = useSpecialInfoStyles();
    const { id, message, variant } = props;
    const { closeSnackbar } = useSnackbar();
    const handleClose = () => {
      closeSnackbar(id);
    };
    if (variant === "specialInfo") {
      return (
        <Alert
          classes={specialInfoClasses}
          severity="info"
          onClose={handleClose}
          ref={ref}
        >
          {message}
        </Alert>
      );
    }
    return (
      <Alert
        className={styles.root}
        severity={variant}
        onClose={handleClose}
        ref={ref}
      >
        {message}
      </Alert>
    );
  }
);
