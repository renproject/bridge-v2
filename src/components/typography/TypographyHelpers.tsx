import { Divider, Typography } from "@material-ui/core";
import { makeStyles, styled } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { FunctionComponent, ReactNode } from "react";
import { TooltipWithIcon } from "../tooltips/TooltipWithIcon";

type LabelWithValueProps = {
  label: string;
  labelTooltip?: string;
  value: string | number | ReactNode;
  valueEquivalent?: string | number | ReactNode;
};

const useLabelWithValueStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    marginBottom: 8,
  },
  labelWrapper: {
    flexShrink: 0,
    maxWidth: "50%",
    color: theme.palette.grey[600],
  },
  labelTooltip: {
    marginLeft: 4,
    color: theme.palette.grey[600],
  },
  labelTooltipIcon: {
    fontSize: 12,
    verticalAlign: "middle",
  },
  valueWrapper: {
    textAlign: "right",
    color: theme.palette.common.black,
  },
  value: {
    whiteSpace: "nowrap",
  },
  valueEquivalent: {
    color: theme.palette.grey[600],
    marginLeft: 4,
  },
}));

export const LabelWithValue: FunctionComponent<LabelWithValueProps> = ({
  label,
  labelTooltip,
  value,
  valueEquivalent,
  ...rest
}) => {
  const styles = useLabelWithValueStyles();
  return (
    <div className={styles.root} {...rest}>
      <div className={styles.labelWrapper}>
        {label}
        {labelTooltip && (
          <span className={styles.labelTooltip}>
            <TooltipWithIcon title={labelTooltip} />
          </span>
        )}
      </div>
      <div className={styles.valueWrapper}>
        <span className={styles.value}>{value}</span>
        {valueEquivalent && (
          <span className={styles.valueEquivalent}>({valueEquivalent})</span>
        )}
      </div>
    </div>
  );
};

const useReceivingAssetInfoStyle = makeStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 20,
    padding: "10px 20px",
  },
  wrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
  },
  icon: {
    paddingLeft: 10,
    paddingRight: 20,
    display: "flex",
    alignItems: "center",
    fontSize: 30,
  },
  valueWrapper: {
    flexGrow: 2,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  value: {
    fontSize: 14,
  },
  valueEquivalent: {
    fontSize: 13,
    color: theme.palette.grey[600],
  },
}));

type AssetInfoProps = LabelWithValueProps & {
  Icon: ReactNode;
};

export const AssetInfo: FunctionComponent<AssetInfoProps> = ({
  label,
  value,
  valueEquivalent,
  Icon,
}) => {
  const styles = useReceivingAssetInfoStyle();
  return (
    <div className={styles.root}>
      <div className={styles.wrapper}>
        <Typography variant="body2" className={styles.label} component="span">
          {label}
        </Typography>
        <span className={styles.icon}>{Icon}</span>
        <span className={styles.valueWrapper}>
          <span className={styles.value}>{value}</span>
          <span className={styles.valueEquivalent}>{valueEquivalent}</span>
        </span>
      </div>
    </div>
  );
};

export const UnstyledList = styled("ul")({
  padding: 0,
  margin: 0,
  listStyleType: "none",
});

export const SpacedDivider = styled(Divider)({
  marginTop: 20,
  marginBottom: 20,
});

export const BigAssetAmountWrapper = styled("div")({
  marginBottom: 40,
});

const useBigAssetAmountStyles = makeStyles({
  root: {
    fontSize: 32,
  },
});

type BigAssetAmountProps = {
  value: number | string | ReactNode;
};

export const BigAssetAmount: FunctionComponent<BigAssetAmountProps> = ({
  value,
}) => {
  const styles = useBigAssetAmountStyles();
  return (
    <Typography className={styles.root} variant="h2" align="center">
      {value}
    </Typography>
  );
};

const useMarkTextStyles = makeStyles((theme) => ({
  blue: {
    color: theme.palette.primary.main,
  },
  orange: {
    color: theme.customColors.orangeDark,
  },
  grey: {
    color: theme.palette.grey[600],
  },
}));

type MarkTextProps = {
  color?: "orange" | "blue" | "grey";
};

export const MarkText: FunctionComponent<MarkTextProps> = ({
  color = "blue",
  children,
}) => {
  const styles = useMarkTextStyles();
  const className = classNames({
    [styles.blue]: color === "blue",
    [styles.orange]: color === "orange",
    [styles.grey]: color === "grey",
  });
  return <span className={className}>{children}</span>;
};
