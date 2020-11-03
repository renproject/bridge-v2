import {
  CircularProgress,
  styled,
  SvgIconProps,
  Theme,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CompletedIcon from "@material-ui/icons/Check";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { BinanceChainIcon, BitcoinIcon, EthereumIcon } from "../icons/RenIcons";
import { BridgeChain, TransactionStatusType } from "../utils/types";

type ProgressIconSize = "big" | "medium" | number;

type ProgressWithContentProps = {
  color: string;
  fontSize?: ProgressIconSize;
  processing?: boolean;
  value?: number;
  size?: number;
  confirmations?: number;
};

const useProgressWithContentStyles = makeStyles<
  Theme,
  ProgressWithContentProps
>((theme) => ({
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
  progressHidden: {
    visibility: "hidden",
  },
  sections: {
    position: "relative",
  },
  section: {
    position: "absolute",
    color: theme.customColors.skyBlue,
    "& > svg": {
      transformOrigin: "50% 50%",
    },
    "&:nth-child(2) svg": {
      transform: "rotate(60deg);",
    },
    "&:nth-child(3) svg": {
      transform: "rotate(120deg);",
    },
    "&:nth-child(4) svg": {
      transform: "rotate(180deg);",
    },
    "&:nth-child(5) svg": {
      transform: "rotate(240deg);",
    },
    "&:nth-child(6) svg": {
      transform: "rotate(300deg);",
    },
  },
  sectionCompleted: {
    color: "inherit",
  },
}));

export const ProgressWithContent: FunctionComponent<ProgressWithContentProps> = ({
  color,
  fontSize,
  value = 100,
  processing,
  confirmations,
  size = 166,
  children,
}) => {
  const styles = useProgressWithContentStyles({
    color,
    fontSize,
  });
  const rootClassName = classNames(styles.root, {
    [styles.rootBig]: fontSize === "big",
    [styles.rootMedium]: fontSize === "medium",
  });
  const shared = {
    size,
    thickness: 3,
  };
  return (
    <div className={rootClassName}>
      {typeof confirmations !== "undefined" && (
        <div className={styles.sections}>
          {new Array(6).fill(true).map((_, index) => {
            const value = 100 / 6 - 3;
            const sectionClassName = classNames(styles.section, {
              [styles.sectionCompleted]: index < confirmations,
            });
            return (
              <CircularProgress
                key={index}
                className={sectionClassName}
                variant="static"
                value={value}
                color="inherit"
                {...shared}
              />
            );
          })}
        </div>
      )}
      <CircularProgress
        variant={processing ? "indeterminate" : "static"}
        value={typeof confirmations !== "undefined" ? 0 : value}
        color="inherit"
        {...shared}
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

export const TransactionStatusCircleIndicator = styled("div")(({ theme }) => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  background: theme.palette.primary.main,
}));

const resolveIcon = (chain: BridgeChain, status: TransactionStatusType) => {
  const shared = { color: "inherit" } as SvgIconProps;
  if (status === "completed") {
    return <CompletedIcon {...shared} fontSize="large" />;
  }
  switch (chain) {
    case BridgeChain.BNCC:
      return <BinanceChainIcon {...shared} fontSize="large" />;
    case BridgeChain.BTCC:
      return <BitcoinIcon {...shared} fontSize="large" />;
    case BridgeChain.ETHC:
      return <EthereumIcon {...shared} fontSize="large" />;
    default:
      return <EthereumIcon {...shared} fontSize="large" />;
  }
};

const useTransactionStatusIndicatorStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
  },
  iconWrapper: {},
  iconCircle: {
    borderRadius: 25,
    background: theme.customColors.skyBlueLight,
    padding: 6,
    fontSize: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {},
  indicatorWrapper: {
    marginLeft: 10,
    minWidth: 10,
  },
}));

export type TransactionStatusIndicatorProps = {
  status: TransactionStatusType;
  chain: BridgeChain;
  confirmations?: number;
};

export const TransactionStatusIndicator: FunctionComponent<TransactionStatusIndicatorProps> = ({
  status,
  chain,
  confirmations,
}) => {
  const styles = useTransactionStatusIndicatorStyles();
  const Icon = resolveIcon(chain, status);
  return (
    <div className={styles.root}>
      <div className={styles.iconWrapper}>
        <div className={styles.iconCircle}>
          <ProgressWithContent
            color="inherit"
            size={42}
            confirmations={confirmations}
          >
            {Icon}
          </ProgressWithContent>
        </div>
      </div>
      <div className={styles.indicatorWrapper}>
        {status === "submitted" && <TransactionStatusCircleIndicator />}
      </div>
    </div>
  );
};
