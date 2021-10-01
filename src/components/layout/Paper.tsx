import {
  makeStyles,
  Paper,
  PaperProps,
  styled,
  Theme,
} from "@material-ui/core";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { useShakingStyles } from "../../theme/animationUtils";

export const depositNavigationBreakpoint = "md";

const useBridgePaperStyles = makeStyles((theme) => {
  return {
    root: {
      maxWidth: 400,
      margin: "70px auto 0",
      position: "relative",
      transition: "margin 1s ease-out",
      [theme.breakpoints.up(depositNavigationBreakpoint)]: {
        marginTop: 0,
      },
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
    [shakingStyles.shaking]: shaking,
  });
  return <Paper className={resolvedClassName} classes={classes} {...props} />;
};

type BridgePaperProps = PaperContentProps & BridgePurePaperProps;

// deprecated - used only in catalog - remove gradually
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
const MEDIUM_PADDING = 20;
const BIG_PADDING = 40;

const getPadding = (variant: PaddingVariant = "big") => {
  switch (variant) {
    case "small":
      return SMALL_PADDING;
    case "medium":
      return MEDIUM_PADDING;
    case "big":
    default:
      return BIG_PADDING;
  }
};

const usePaperContentStyles = makeStyles<Theme, PaperContentProps>((theme) => ({
  root: {
    paddingLeft: ({ paddingVariant }) => getPadding(paddingVariant),
    paddingRight: ({ paddingVariant }) => getPadding(paddingVariant),
  },
  top: {
    paddingTop: ({ paddingVariant }) => getPadding(paddingVariant),
  },
  bottom: {
    paddingBottom: ({ paddingVariant }) => getPadding(paddingVariant),
  },
  darker: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: theme.customColors.whiteDarker,
  },
}));

type PaddingVariant = "big" | "medium" | "small";

export type PaperContentProps = {
  darker?: boolean;
  topPadding?: boolean;
  bottomPadding?: boolean;
  paddingVariant?: PaddingVariant;
  className?: string;
};

export const PaperContent: FunctionComponent<PaperContentProps> = ({
  topPadding,
  bottomPadding,
  darker,
  paddingVariant,
  className,
  children,
}) => {
  const styles = usePaperContentStyles({ paddingVariant: paddingVariant });
  const resolvedClassName = classNames(styles.root, className, {
    [styles.top]: topPadding,
    [styles.bottom]: bottomPadding,
    [styles.darker]: darker,
  });
  return <div className={resolvedClassName}>{children}</div>;
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

const useSpacedContentStyles = makeStyles({
  root: {
    minHeight: 200, // this causes shifting
  },
  rootSmaller: {
    minHeight: 130,
  },
  rootFixedHeight: {
    height: 392 - 2 * 40,
  },
  autoOverflow: {
    overflowY: "auto",
  },
});

type SpacedPaperContentProps = PaperContentProps & {
  smaller?: boolean;
  fixedHeight?: boolean;
  autoOverflow?: boolean;
};
export const SpacedPaperContent: FunctionComponent<SpacedPaperContentProps> = ({
  smaller,
  fixedHeight,
  autoOverflow,
  ...rest
}) => {
  const styles = useSpacedContentStyles();
  const className = classNames(styles.root, {
    [styles.rootSmaller]: smaller,
    [styles.rootFixedHeight]: fixedHeight,
    [styles.autoOverflow]: autoOverflow,
  });
  return <PaperContent className={className} {...rest} />;
};
