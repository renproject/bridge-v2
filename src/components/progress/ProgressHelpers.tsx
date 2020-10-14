import { CircularProgress, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { EthereumIcon } from "../icons/RenIcons";

const SIZE = 166;
const THICKNESS = 10;
const RELATIVE_THICKNESS = Math.floor((THICKNESS / 2 / SIZE) * 100);

type ProgressIconSize = "big" | "medium" | number;

type ProgressWithContentProps = {
  color: string;
  fontSize?: ProgressIconSize;
  processing?: boolean;
  value?: number;
};

const useProgressWithContentStyles = makeStyles<
  Theme,
  ProgressWithContentProps
>(() => ({
  root: {
    display: "inline-flex",
    position: "relative",
    fontSize: ({ fontSize = "inherit" }) => fontSize,
    color: ({ color = "inherit" }) => color,
  },
  rootBig: {
    fontSize: 70,
  },
  rootMedium: {
    fontSize: 24,
  },
  content: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export const ProgressWithContent: FunctionComponent<ProgressWithContentProps> = ({
  color,
  fontSize,
  value = 100,
  processing,
  children,
  ...rest
}) => {
  const styles = useProgressWithContentStyles({ color, fontSize });
  const rootClassName = classNames(styles.root, {
    [styles.rootBig]: fontSize === "big",
    [styles.rootMedium]: fontSize === "medium",
  });
  return (
    <div className={rootClassName}>
      <CircularProgress
        variant={processing ? "indeterminate" : "static"}
        value={value}
        size={`${SIZE}px`}
        thickness={RELATIVE_THICKNESS}
        color="inherit"
      />
      <div className={styles.content}>{children}</div>
    </div>
  );
};

const useTransactionStatusInfoStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: theme.palette.common.black,
  },
  status: {
    fontWeight: theme.typography.fontWeightBold,
    textTransform: "uppercase",
  },
  txLink: {
    maxWidth: 80,
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "center",
    color: theme.palette.primary.main,
  },
}));

type TransactionStatusInfoProps = {
  chain: string;
  address: string;
  status?: string;
};

export const TransactionStatusInfo: FunctionComponent<TransactionStatusInfoProps> = ({
  status = "Pending",
  chain,
  address,
}) => {
  const styles = useTransactionStatusInfoStyles();
  return (
    <div className={styles.root}>
      <Typography variant="body1" className={styles.status}>
        {status}
      </Typography>
      <Typography variant="body1">{chain} Tx:</Typography>
      <Typography variant="body1" className={styles.txLink}>
        <span>{address}</span>
      </Typography>
    </div>
  );
};

const useTransactionStatusIndicatorStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
  },
  iconWrapper: {},
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {},
  indicator: {},
}));

export type TransactionStatusIndicatorProps = {
  status?: string;
  chain?: string;
};

export const TransactionStatusIndicator: FunctionComponent<TransactionStatusIndicatorProps> = ({
  status = "Pending",
  chain,
}) => {
  const styles = useTransactionStatusIndicatorStyles();
  return (
    <div className={styles.root}>
      <div className={styles.iconWrapper}>
        <div className={styles.iconCircle}>
          <ProgressWithContent color="inherit">
            <EthereumIcon color="inherit" />
          </ProgressWithContent>
        </div>
      </div>
    </div>
  );
};
