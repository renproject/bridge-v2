import { makeStyles, styled } from "@material-ui/core/styles";
import React, { FunctionComponent, ReactNode } from "react";
import { TooltipWithIcon } from "../tooltips/TooltipWithIcon";

type LabelWithValueProps = {
  label: string;
  labelTooltip?: string;
  value: string | number | ReactNode;
  valueEquivalent?: string | number;
};

const useLabelWithValueStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    marginBottom: 8,
  },
  labelWrapper: {
    color: theme.palette.grey[500],
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
    color: theme.palette.common.black,
  },
  value: {},
  valueEquivalent: {
    color: theme.palette.grey[500],
    marginLeft: 4,
  },
}));

export const LabelWithValue: FunctionComponent<LabelWithValueProps> = ({
  label,
  labelTooltip,
  value,
  valueEquivalent,
}) => {
  const styles = useLabelWithValueStyles();
  return (
    <div className={styles.root}>
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
    padding: 10,
  },
  wrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {},
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
  value: {},
  valueEquivalent: {
    fontSize: 13,
    color: theme.palette.grey[500],
  },
}));

type ReceivingAssetInfoProps = LabelWithValueProps & {
  Icon: ReactNode;
};

export const AssetInfo: FunctionComponent<ReceivingAssetInfoProps> = ({
  label,
  value,
  valueEquivalent,
  Icon,
}) => {
  const styles = useReceivingAssetInfoStyle();
  return (
    <div className={styles.root}>
      <div className={styles.wrapper}>
        <span className={styles.label}>{label}</span>
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
