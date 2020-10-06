import { Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import { TooltipIcon } from "../icons/RenIcons";

type LabelWithValueProps = {
  label: string;
  labelTooltip?: string;
  value: string | number;
  valueEquivalent?: string | number;
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    marginBottom: 8,
  },
  labelWrapper: {
    color: theme.palette.common.black,
  },
  labelTooltip: {
    marginLeft: 4,
    color: theme.palette.grey[600]
  },
  labelTooltipIcon: {
    fontSize: 12,
    verticalAlign: "middle",
  },
  valueWrapper: {
    color: theme.palette.grey[500],
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
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div className={styles.labelWrapper}>
        {label}
        {labelTooltip && (
          <span className={styles.labelTooltip}>
            <Tooltip title={labelTooltip}>
              <span>
                <TooltipIcon
                  className={styles.labelTooltipIcon}
                  color="inherit"
                />
              </span>
            </Tooltip>
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
