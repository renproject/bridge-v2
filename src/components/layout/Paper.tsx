import { Paper, PaperProps, styled } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { useShakingStyles } from "../../theme/animationUtils";

type BridgePaperProps = PaperContentProps & PaperProps;

const useBridgePaperStyles = makeStyles((theme) => {
  return {
    root: {
      maxWidth: 400,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden",
    },
  };
});

type BridgePurePaperProps = PaperProps & {
  shaking?: boolean;
};

export const BridgePurePaper: FunctionComponent<BridgePurePaperProps> = ({
  shaking,
  className,
  ...props
}) => {
  const classes = useBridgePaperStyles();
  const shakingStyles = useShakingStyles();
  const resolvedClassName = classNames(className, {
    [shakingStyles.shaking]: !shaking,
  });
  return <Paper className={resolvedClassName} classes={classes} {...props} />;
};

export const BridgePaper: FunctionComponent<BridgePaperProps> = ({
  topPadding,
  bottomPadding = true,
  children,
  ...rest
}) => {
  return (
    <BridgePurePaper {...rest}>
      <PaperContent topPadding={topPadding} bottomPadding={bottomPadding}>
        {children}
      </PaperContent>
    </BridgePurePaper>
  );
};

export const BridgePaperWrapper = styled("div")({
  marginTop: 40,
});

const SMALL_PADDING = 10;
// const PADDING = 20;
const BIG_PADDING = 40;

const usePaperContentStyles = makeStyles((theme) => ({
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
  darker: {
    backgroundColor: theme.customColors.whiteDarker,
  },
}));

export type PaperContentProps = {
  darker?: boolean;
  topPadding?: boolean;
  bottomPadding?: boolean;
};

export const PaperContent: FunctionComponent<PaperContentProps> = ({
  topPadding,
  bottomPadding,
  darker,
  children,
}) => {
  const styles = usePaperContentStyles();
  const className = classNames(styles.root, {
    [styles.darker]: darker,
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
