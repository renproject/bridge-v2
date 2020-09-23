import { Paper, PaperProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { FunctionComponent } from "react";

type BridgePaperProps = PaperContentProps & PaperProps;

const useBridgePaperStyles = makeStyles({
  root: {
    maxWidth: 400,
    margin: "0 auto",
  },
});
export const BridgePaper: FunctionComponent<BridgePaperProps> = ({
  topPadding,
  bottomPadding,
  children,
}) => {
  const styles = useBridgePaperStyles();
  return (
    <Paper className={styles.root}>
      <PaperContent topPadding={topPadding} bottomPadding={bottomPadding}>
        {children}
      </PaperContent>
    </Paper>
  );
};

const PADDING = 20;
const usePaperContentStyles = makeStyles({
  root: {
    paddingLeft: PADDING,
    paddingRight: PADDING,
    paddingBottom: PADDING,
  },
  top: {
    paddingTop: PADDING,
  },
});

export type PaperContentProps = {
  topPadding?: boolean;
  bottomPadding?: boolean;
};

export const PaperContent: FunctionComponent<PaperContentProps> = ({
  topPadding,
  bottomPadding,
  children,
}) => {
  const styles = usePaperContentStyles();
  const className = classNames(styles.root, {
    [styles.top]: topPadding,
  });
  return <div className={className}>{children}</div>;
};
