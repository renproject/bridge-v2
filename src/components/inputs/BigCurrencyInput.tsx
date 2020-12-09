import { makeStyles, styled } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { FunctionComponent, useRef } from "react";
import NumberFormat, { NumberFormatValues } from "react-number-format";
import { generatePlaceholderStyles } from "../../theme/themeUtils";
import { numberFormatOptions, toUsdFormat } from "../../utils/formatters";

const useStyles = makeStyles((theme) => ({
  container: {
    width: "100%",
    textAlign: "center",
    "& input": {
      fontFamily: "inherit",
      color: theme.customColors.textDark,
    },
  },
  large: {
    "& input": {
      fontSize: 52,
    },
  },
  medium: {
    "& input": {
      fontSize: 42,
    },
  },
  small: {
    "& input": {
      fontSize: 32,
    },
  },
  smallest: {
    "& input": {
      fontSize: 22,
    },
  },
  input: {
    fontSize: 52,
    width: "100%",
    outline: "none",
    textAlign: "center",
    border: "0px solid transparent",
    ...generatePlaceholderStyles(theme.customColors.grayPlaceholder),
  },
  equivalent: {
    marginTop: 0,
    color: "#3F3F48",
  },
}));

type NumberChange = (values: NumberFormatValues) => void;

type BigCurrencyInputProps = {
  onChange: (value: any) => void;
  symbol: string;
  usdValue: string | number;
  value: string | number;
  placeholder?: string;
};

export const BigCurrencyInput: FunctionComponent<BigCurrencyInputProps> = ({
  onChange,
  symbol,
  usdValue,
  value,
  placeholder = `0 ${symbol}`,
}) => {
  const styles = useStyles();
  const inputRef = useRef(null);
  const val = value ? String(value) : "";
  const handleChange: NumberChange = (formatValues) => {
    onChange(formatValues.value);
  };

  const chars = val.replace(".", "") + " " + symbol
  let size = "large";
  if (chars.length > 10 && chars.length <= 12) {
    size = "medium";
  } else if (chars.length > 12 && chars.length <= 14) {
    size = "small";
  } else if (chars.length > 14) {
    size = "smallest";
  }

  const rootClassName = classNames(styles.container, {
    [styles.large]: size === "large",
    [styles.medium]: size === "medium",
    [styles.small]: size === "small",
    [styles.smallest]: size === "smallest",
  });
  return (
    <div className={rootClassName}>
      <NumberFormat
        value={val}
        ref={inputRef}
        {...numberFormatOptions}
        suffix={" " + symbol}
        onValueChange={handleChange}
        getInputRef={(input: any) => {
          inputRef.current = input;
        }}
        className={styles.input}
        placeholder={placeholder}
      />

      {<p className={styles.equivalent}>= {toUsdFormat(usdValue)}</p>}
    </div>
  );
};

export const BigCurrencyInputWrapper = styled("div")({
  marginTop: 40,
});
