import {
  CircularProgress,
  fade,
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
  incompleteSectionColor?: string;
  fontSize?: ProgressIconSize;
  processing?: boolean;
  value?: number;
  size?: number;
  confirmations?: number;
  targetConfirmations?: number;
};

const getSectionMargin = (sections: number) => {
  return sections > 100 ? 1 : 2;
};

const generateSections = (all: number) => {
  let sections: any = {};
  const degreeStep = 360 / all;
  const margin = getSectionMargin(all);
  const initialRotation = margin / 2;
  for (let i = 0; i < all; i++) {
    const key = `&:nth-child(${i + 1}) svg`;
    sections[key] = {
      transform: `rotate(${i * degreeStep + margin}deg);`,
    };
  }
  return sections;
};

const useSectionStyles = makeStyles<Theme, number>((theme) => {
  return {
    dynamicSection: (num: number) => {
      return generateSections(num);
    },
  };
});

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
    color: ({ color }) => {
      if (color !== "inherit") {
        return fade(color, 0.2);
      }
      return theme.customColors.skyBlue;
    },
    "& > svg": {
      transformOrigin: "50% 50%",
    },
  },
  sectionCompleted: {
    color: () => "inherit",
  },
}));

export const ProgressWrapper = styled("div")({
  display: "flex",
  justifyContent: "center",
  marginTop: 20,
  marginBottom: 20,
});

export const ProgressWithContent: FunctionComponent<ProgressWithContentProps> = ({
  color,
  value = 100,
  processing,
  confirmations,
  targetConfirmations = 6,
  size = 166,
  fontSize = Math.floor(0.75 * size),
  children,
}) => {
  const styles = useProgressWithContentStyles({
    color,
    fontSize,
  });
  const sectionsStyles = useSectionStyles(targetConfirmations);
  const rootClassName = classNames(styles.root, {
    [styles.rootBig]: fontSize === "big",
    [styles.rootMedium]: fontSize === "medium",
  });
  const shared = {
    size,
    thickness: 3,
  };
  const margin = getSectionMargin(targetConfirmations);
  return (
    <div className={rootClassName}>
      {typeof confirmations !== "undefined" && (
        <div className={styles.sections}>
          {new Array(targetConfirmations).fill(true).map((_, index) => {
            const value = 100 / targetConfirmations - margin;
            const sectionClassName = classNames(
              styles.section,
              sectionsStyles.dynamicSection,
              {
                [styles.sectionCompleted]: index < confirmations,
              }
            );
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
  chain?: string;
  address?: string;
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
      {chain && <Typography variant="body1">{chain} Tx:</Typography>}
      {address && (
        <Typography variant="body1" className={styles.txLink}>
          <span>{address}</span>
        </Typography>
      )}
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
