import {
  alpha,
  CircularProgress,
  CircularProgressProps,
  styled,
  Theme,
  Typography,
  useTheme,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DoneIcon from "@material-ui/icons/Done";
import { Skeleton } from "@material-ui/lab";
import classNames from "classnames";
import React, { FunctionComponent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  createPulseAnimation,
  createPulseOpacityAnimation,
} from "../../theme/animationUtils";
import { CustomSvgIconComponent, EmptyIcon } from "../icons/RenIcons";
import { CenteringSpacedBox } from "../layout/LayoutHelpers";

export const CenteredProgress: FunctionComponent<CircularProgressProps> = ({
  size = 40,
  ...props
}) => {
  return (
    <CenteringSpacedBox>
      <CircularProgress size={size} {...props} />
    </CenteringSpacedBox>
  );
};

export const BigDoneIcon = styled(DoneIcon)({
  fontSize: 120,
  color: "inherit",
});

type ProgressIconSize = "big" | "medium" | number;

export type ProgressWithContentProps = {
  color?: string;
  incompleteSectionColor?: string;
  fontSize?: ProgressIconSize;
  processing?: boolean;
  value?: number;
  size?: number;
  confirmations?: number;
  targetConfirmations?: number | null;
};

const getSectionMargin = (sections: number) => {
  if (sections < 33) {
    return 2;
  }
  const space = 100 / sections;
  return 1 + (space - 1) / 100;
};

const generateSections = (all: number) => {
  let sections: any = {};
  if (all > 360) {
    all = 360;
  }
  const degreeStep = 360 / all;
  const margin = getSectionMargin(all);
  for (let i = 0; i < all; i++) {
    const key = `&:nth-child(${i + 1}) svg`;
    sections[key] = {
      transform: `rotate(${i * degreeStep + margin}deg);`,
    };
  }
  return sections;
};

// const useSectionAnimationStyles = makeStyles<Theme, any>(() => {
//   const { pulsingKeyframes, pulsingStyles } = createPulseAnimation(color);
// });

const useSectionStyles = makeStyles<Theme, any>((theme) => {
  return {
    dynamicSection: (num: number) => {
      return generateSections(num);
    },
  };
});

const defaultProgressWithContentSize = 166;

const useProgressWithContentStyles = makeStyles<
  Theme,
  ProgressWithContentProps
>((theme) => {
  const { pulsingStyles, pulsingKeyframes } = createPulseOpacityAnimation();
  return {
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
          return color;
        }
        return theme.customColors.skyBlue;
      },
      opacity: 0.2,
      "& > svg": {
        transformOrigin: "50% 50%",
      },
    },
    ...pulsingKeyframes,
    sectionProcessing: pulsingStyles,
    sectionCompleted: {
      color: "inherit",
      opacity: 1,
    },
  };
});

export const ProgressWrapper = styled("div")({
  display: "flex",
  justifyContent: "center",
  marginTop: 20,
  marginBottom: 20,
});

export const ProgressWithContent: FunctionComponent<
  ProgressWithContentProps
> = ({
  color,
  value = 100,
  processing,
  confirmations,
  targetConfirmations,
  size = defaultProgressWithContentSize,
  fontSize = Math.floor(0.75 * size),
  children,
}) => {
  const theme = useTheme();
  let resolvedTargetConfirmations = 1;
  if (
    typeof targetConfirmations === "number" ||
    targetConfirmations === undefined
  ) {
    resolvedTargetConfirmations = targetConfirmations || 6;
  } else if (targetConfirmations === null) {
    color = alpha(color || theme.palette.primary.main, 0.2);
  } else if (targetConfirmations > 360) {
    resolvedTargetConfirmations = 360;
  }
  const styles = useProgressWithContentStyles({
    color: color || theme.palette.primary.main,
    fontSize,
    size,
  });
  const sectionsStyles = useSectionStyles(resolvedTargetConfirmations);
  const rootClassName = classNames(styles.root, {
    [styles.rootBig]: fontSize === "big",
    [styles.rootMedium]: fontSize === "medium",
  });

  const margin = getSectionMargin(resolvedTargetConfirmations);
  return (
    <div className={rootClassName}>
      {typeof confirmations !== "undefined" && (
        <div className={styles.sections}>
          {new Array(resolvedTargetConfirmations || 0)
            .fill(true)
            .map((_, index) => {
              const value = 100 / resolvedTargetConfirmations - margin;
              const completed = index < confirmations;
              const processing = index === confirmations;
              const sectionClassName = classNames(
                styles.section,
                sectionsStyles.dynamicSection,
                styles.sectionAnimated,
                {
                  [styles.sectionCompleted]: completed,
                  [styles.sectionProcessing]: processing,
                }
              );
              return (
                <CircularProgress
                  key={index}
                  className={sectionClassName}
                  variant="determinate"
                  value={value}
                  color="inherit"
                  size={size}
                  thickness={3}
                />
              );
            })}
        </div>
      )}
      <CircularProgress
        variant={processing ? "indeterminate" : "determinate"}
        value={typeof confirmations !== "undefined" ? 0 : value}
        color="inherit"
        size={size}
        thickness={3}
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
    padding: 10,
  },
  status: {
    fontWeight: 700,
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
  address?: string | ReactNode;
  status?: string;
};

export const TransactionStatusInfo: FunctionComponent<
  TransactionStatusInfoProps
> = ({ status = "Pending", chain, address }) => {
  const styles = useTransactionStatusInfoStyles();
  return (
    <div className={styles.root}>
      <Typography variant="body1" className={styles.status} align="center">
        {status}
      </Typography>
      {chain && (
        <Typography variant="body1" align="center">
          {chain} Tx:
        </Typography>
      )}
      {address && (
        <Typography variant="body1" className={styles.txLink}>
          <span>{address}</span>
        </Typography>
      )}
    </div>
  );
};

// export const createPulseAnimation = makeStyles((theme) => ({
//   "@keyframes pulse": {
//     from: {
//       boxShadow: "0 0 0 0 rgba(204,169,44, 0.4)",
//     },
//     to: {
//       boxShadow: "0 0 0 0 rgba(204,169,44, 0);",
//     },
//   },
// }));

export const usePulseIndicatorStyles = makeStyles<Theme, PulseIndicatorProps>(
  (theme) => {
    const color = theme.palette.primary.main;
    const { pulsingKeyframes, pulsingStyles } = createPulseAnimation(color);
    return {
      ...pulsingKeyframes,
      root: {
        width: ({ size = 8 }) => size,
        height: ({ size = 8 }) => size,
        borderRadius: ({ size = 8 }) => size / 2,
        background: theme.palette.primary.main,
      },
      pulsing: pulsingStyles,
    };
  }
);

type PulseIndicatorProps = {
  pulsing?: boolean;
  size?: number;
  className?: string;
};

export const PulseIndicator: FunctionComponent<PulseIndicatorProps> = ({
  pulsing,
  className,
  size = 8,
}) => {
  const styles = usePulseIndicatorStyles({ size });
  const resolvedClassName = classNames(styles.root, className, {
    [styles.pulsing]: pulsing,
  });

  return <div className={resolvedClassName} />;
};

export const TransactionStatusCircleIndicator = styled("div")(({ theme }) => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  background: theme.palette.primary.main,
}));

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
    marginLeft: 20,
    minWidth: 10,
  },
}));

export type TransactionStatusIndicatorProps = {
  needsAction?: boolean;
  Icon?: CustomSvgIconComponent;
  showConfirmations?: boolean;
  confirmations?: number;
  targetConfirmations?: number;
};

export const TransactionStatusIndicator: FunctionComponent<
  TransactionStatusIndicatorProps
> = ({
  needsAction,
  showConfirmations = true,
  confirmations,
  targetConfirmations,
  Icon = EmptyIcon,
}) => {
  const styles = useTransactionStatusIndicatorStyles();
  const confirmationProps = showConfirmations
    ? {
        confirmations,
        targetConfirmations,
      }
    : {};
  return (
    <div className={styles.root}>
      <div className={styles.iconWrapper}>
        <div className={styles.iconCircle}>
          <ProgressWithContent color="inherit" size={42} {...confirmationProps}>
            <Icon fontSize="large" color="inherit" />
          </ProgressWithContent>
        </div>
      </div>
      <div className={styles.indicatorWrapper}>
        {needsAction && <PulseIndicator pulsing size={10} />}
      </div>
    </div>
  );
};

export const InlineSkeleton = styled(Skeleton)({
  display: "inline-block",
});

export const RenvmRevertedIndicator: FunctionComponent<{}> = () => {
  const { t } = useTranslation();
  return (
    <Typography variant="h3" align="center">
      RenVM {t("tx.reverted")}
    </Typography>
  );
};
