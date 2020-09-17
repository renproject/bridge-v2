import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";

const useStyles = makeStyles({
  root: {
    "& > *": {
      margin: 4,
      "&:first-child": {
        marginLeft: 0,
      },
      "&:last-child": {
        marginRight: 0,
      },
    },
  },
});

export const Wrapper: FunctionComponent = ({ children }) => {
  const styles = useStyles();
  return <div className={styles.root}>{children}</div>;
};
