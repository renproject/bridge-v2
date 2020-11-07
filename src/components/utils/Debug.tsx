import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    background: "lightgray",
  },
});

const off = process.env.NODE_ENV === "production";

type DebugProps = {
  it: any;
  force?: boolean;
  disable?: boolean;
};

export const Debug: FunctionComponent<DebugProps> = ({
  it,
  force,
  disable,
  children,
}) => {
  const classes = useStyles();
  const target = it || children;
  const show = !off || force;
  return show && !disable ? (
    <pre className={classes.root}>{JSON.stringify(target, null, 2)}</pre>
  ) : null;
};
