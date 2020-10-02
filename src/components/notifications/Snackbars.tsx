import { Alert } from "@material-ui/lab";
import { useSnackbar } from "notistack";
import React, { FunctionComponent } from "react";
import { Debug } from "../utils/Debug";

export const CustomSnackMessage: FunctionComponent<any> = React.forwardRef(
  (props, ref) => {
    const { id, message } = props;
    const { closeSnackbar } = useSnackbar();
    const handleClose = () => {
      closeSnackbar(id);
    };
    // const [expanded, setExpanded] = useState(false);
    return (
      <Alert onClose={handleClose} ref={ref}>
        {message} <Debug it={{ props }} />
      </Alert>
    );
  }
);
