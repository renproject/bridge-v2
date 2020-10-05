import { makeStyles } from '@material-ui/core/styles'
import React, { FunctionComponent } from 'react'
import { SuccessIcon } from '../icons/RenIcons'

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
    fontSize: 14,
    marginBottom: 8,
  },
  labelWrapper: {
    color: theme.palette.grey[500],
  },
  labelTooltip: {},
  valueWrapper: {
    color: theme.palette.common.black,
  },
  value: {},
  valueEquivalent: {
    color: theme.palette.grey[500],
    marginLeft: 8,
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
            <SuccessIcon color="inherit" />
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
