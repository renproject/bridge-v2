import { makeStyles } from "@material-ui/core/styles";
import { Alert } from "@material-ui/lab";
import { useSnackbar } from "notistack";
import React, { FunctionComponent } from "react";

const useStyles = makeStyles({
  root: {
    width: 300,
  },
});
export const NotificationMessage: FunctionComponent<any> = React.forwardRef(
  (props, ref) => {
    const styles = useStyles();
    const { id, message, variant } = props;
    const { closeSnackbar } = useSnackbar();
    const handleClose = () => {
      closeSnackbar(id);
    };
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
