import React, { FunctionComponent } from "react";
import NumberFormat, { NumberFormatProps } from "react-number-format";
import { numberFormatOptions } from "../../utils/formatters";

type NumberFormatTextProps = NumberFormatProps & {
  spacedSuffix?: string;
};
export const NumberFormatText: FunctionComponent<NumberFormatTextProps> = ({
  spacedSuffix,
  suffix,
  ...props
}) => {
  const resolvedSuffix = spacedSuffix ? ` ${spacedSuffix}` : suffix;
  return (
    <NumberFormat
      {...numberFormatOptions}
      displayType="text"
      suffix={resolvedSuffix}
      {...props}
    />
  );
};
