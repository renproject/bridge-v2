import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import NumberFormat, { NumberFormatProps } from "react-number-format";
import { numberFormatOptions } from "../../utils/formatters";

const useNumberFormatStyles = makeStyles({
  root: {
    display: "flex",
  },
  rootInline: {
    display: "inline-flex",
  },
  value: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    flexShrink: 1,
  },
  // suffix: {}
});

type NumberFormatTextProps = NumberFormatProps & {
  inline?: boolean;
  spacedSuffix?: string;
};

export const NumberFormatText: FunctionComponent<NumberFormatTextProps> = ({
  inline,
  spacedSuffix,
  value,
  ...props
}) => {
  const styles = useNumberFormatStyles();
  // const resolvedSuffix = spacedSuffix ? ` ${spacedSuffix}` : suffix;
  return (
    <span className={inline ? styles.rootInline : styles.root}>
      <NumberFormat
        className={styles.value}
        {...numberFormatOptions}
        displayType="text"
        title={value ? value.toString() : undefined}
        value={value}
        {...props}
      />
      {Boolean(spacedSuffix) && <span>&nbsp;{spacedSuffix}</span>}
    </span>
  );
};
