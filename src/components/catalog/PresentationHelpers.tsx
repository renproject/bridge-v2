import { makeStyles } from "@material-ui/core/styles";
import React, { Fragment, FunctionComponent } from "react";
import { cartesianProps, PropVariants } from "../../utils/cartesian";
import Lorem from "react-lorem-component";

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

type RandomTextProps = {
  words?: number;
  sentences?: number;
};

export const RandomText: FunctionComponent<RandomTextProps> = ({
  words = 7,
  sentences = 1,
}) => {
  return (
    <Lorem
      sentenceLowerBound={words}
      sentenceUpperBound={words}
      paragraphLowerBound={sentences}
      paragraphUpperBound={sentences}
      format="plain"
    />
  );
};

type ContentFn = (props: any) => string;

type CartesianProps = {
  Component: FunctionComponent;
  propVariants: PropVariants;
  content?: ContentFn | string;
  Wrapper?: FunctionComponent;
};

export const Cartesian: FunctionComponent<CartesianProps> = ({
  propVariants,
  Component,
  Wrapper = Fragment,
  content,
  children,
}) => {
  const combinations = cartesianProps(propVariants);
  return (
    <Wrapper>
      {combinations.map((props: any, index: number) => {
        let resolvedContent: string | null = null;
        if (typeof content === "string") {
          resolvedContent = content;
        } else if (typeof content === "function") {
          resolvedContent = content(props);
        }
        const title = JSON.stringify(props, null, 2);
        return (
          <span key={index} title={title}>
            <Component {...props}>
              {resolvedContent}
              {children}
            </Component>
          </span>
        );
      })}
    </Wrapper>
  );
};
