import { makeStyles, styled } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { FunctionComponent } from "react";

export const NarrowCenteredWrapper = styled("div")({
  marginLeft: "auto",
  marginRight: "auto",
  maxWidth: 400,
});

export const CenteringSpacedBox = styled("div")({
  display: "flex",
  justifyContent: "center",
  marginBottom: 20,
});

export const SmallWrapper = styled("div")({
  marginBottom: 10,
});

export const MediumWrapper = styled("div")({
  marginBottom: 20,
});

export const BigWrapper = styled("div")({
  marginBottom: 40,
});

export const SmallTopWrapper = styled("div")({
  marginTop: 10,
});

export const MediumTopWrapper = styled("div")({
  marginTop: 20,
});

export const BigTopWrapper = styled("div")({
  marginTop: 40,
});

export const SmallHorizontalUnpadder = styled("div")({
  marginLeft: -8,
  marginRight: -8,
});

export const SmallHorizontalPadder = styled("div")({
  paddingLeft: 8,
  paddingRight: 8,
});

export const HorizontalPadder = styled("div")({
  paddingLeft: 16,
  paddingRight: 16,
});

export const PaperSpacerWrapper = styled("div")({
  marginTop: 40,
  marginBottom: 40,
});

const useHideStyles = makeStyles({
  hidden: {
    display: "none",
  },
});

type HideProps = {
  when: boolean;
  className?: string;
};

export const Hide: FunctionComponent<HideProps> = ({
  when,
  className,
  children,
}) => {
  const styles = useHideStyles();
  const resolvedClassName = classNames(className, {
    [styles.hidden]: when,
  });
  return <div className={resolvedClassName}>{children}</div>;
};
