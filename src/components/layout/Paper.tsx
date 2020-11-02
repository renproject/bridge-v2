import { Paper, PaperProps, styled } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { FunctionComponent } from "react";

type BridgePaperProps = PaperContentProps & PaperProps;

export const BridgePurePaper = styled(Paper)({
  maxWidth: 400,
  margin: "0 auto",
});

export const BridgePaper: FunctionComponent<BridgePaperProps> = ({
  topPadding,
  bottomPadding = true,
  children,
  ...rest
}) => (
  <BridgePurePaper {...rest}>
    <PaperContent topPadding={topPadding} bottomPadding={bottomPadding}>
      {children}
    </PaperContent>
  </BridgePurePaper>
);

const SMALL_PADDING = 10;
// const PADDING = 20;
const BIG_PADDING = 40;

const usePaperContentStyles = makeStyles({
  root: {
    paddingLeft: BIG_PADDING,
    paddingRight: BIG_PADDING,
  },
  top: {
    paddingTop: BIG_PADDING,
  },
  bottom: {
    paddingBottom: BIG_PADDING,
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
    [styles.bottom]: bottomPadding,
  });
  return <div className={className}>{children}</div>;
};

export const PaperHeader = styled("header")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: SMALL_PADDING,
  paddingBottom: SMALL_PADDING,
  paddingLeft: SMALL_PADDING,
  paddingRight: SMALL_PADDING,
});

export const PaperNav = styled("div")({
  justifySelf: "flex-start",
  minWidth: 72,
});

export const PaperActions = styled("div")({
  justifySelf: "flex-end",
  minWidth: 72,
  "& > *": {
    margin: "0 4px",
    "&:first-child": {
      marginLeft: 0,
    },
    "&:last-child": {
      marginRight: 0,
    },
  },
});

export const PaperTitle = styled("div")({
  justifySelf: "center",
  textAlign: "center",
  width: "100%",
});
