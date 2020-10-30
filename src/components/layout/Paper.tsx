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
  bottomPadding,
  children,
  ...rest
}) => (
  <BridgePurePaper {...rest}>
    <PaperContent topPadding={topPadding} bottomPadding={bottomPadding}>
      {children}
    </PaperContent>
  </BridgePurePaper>
);

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

export const PaperHeader = styled("header")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  minHeight: 48,
  paddingTop: 16,
  paddingBottom: 16,
  paddingLeft: PADDING,
  paddingRight: PADDING,
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
