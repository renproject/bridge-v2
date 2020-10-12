import { Box, Divider, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import CopyIcon from '@material-ui/icons/FileCopyOutlined'
import React, { Fragment, FunctionComponent } from 'react'
import Lorem from 'react-lorem-component'
import { cartesianProps, PropVariants } from '../../utils/cartesian'
import { Link } from '../links/Links'

const useSeparationWrapperStyles = makeStyles({
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

export const SeparationWrapper: FunctionComponent = ({ children }) => {
  const styles = useSeparationWrapperStyles();
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

type SectionProps = {
  header?: string;
};

export const Section: FunctionComponent<SectionProps> = ({
  header = "",
  children,
}) => {
  const slug = header?.toLowerCase();
  return (
    <Box mb={2}>
      <Box mb={2}>
        <Typography id={slug} variant="h4" gutterBottom>
          {header}{" "}
          <Link href={`#${slug}`}>
            <CopyIcon fontSize="small" />
          </Link>
        </Typography>
        {children}
      </Box>
      <Divider />
    </Box>
  );
};

type ContentFn = (props: any) => string;

type CartesianProps = {
  Component: FunctionComponent;
  propVariants: PropVariants;
  Wrapper?: FunctionComponent;
  content?: ContentFn | string;
  elementWrapperStyle?: any;
};

const useCartesianStyles = makeStyles({
  elementWrapper: {
    display: "inline-block",
  },
});
export const Cartesian: FunctionComponent<CartesianProps> = ({
  propVariants,
  Component,
  Wrapper = Fragment,
  elementWrapperStyle = {},
  content,
  children,
}) => {
  const combinations = cartesianProps(propVariants);
  const styles = useCartesianStyles();
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
          <span
            key={index}
            className={styles.elementWrapper}
            title={title}
            style={elementWrapperStyle}
          >
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
