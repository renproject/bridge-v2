import {
  Box,
  MenuItem,
  Select,
  SelectProps,
  styled,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent, useMemo } from "react";
import {
  ChainConfig,
  chainsConfig,
  currenciesConfig,
  CurrencyConfig,
} from "../../utils/assetConfigs";
import { BridgeChain, BridgeCurrency } from "../utils/types";

const getOptions = (mode: AssetDropdownMode) => {
  const options =
    mode === "chain"
      ? Object.values(chainsConfig)
      : Object.values(currenciesConfig);
  return options as Array<ChainConfig | CurrencyConfig>;
};

const getOptionBySymbol = (symbol: string, mode: AssetDropdownMode) =>
  getOptions(mode).find((option) => option.symbol === symbol);

const createAvailabilityFilter = (available: Array<string> | undefined) => (
  option: ChainConfig | CurrencyConfig
) => {
  if (!available) {
    return true;
  }
  return available.includes(option.symbol);
};

const iconStyles = {
  width: 32,
  height: 32,
};

const useAssetDropdownStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  select: {
    width: "100%",
  },
  listIcon: iconStyles,
  supplementalText: {
    fontSize: 12,
  },
}));

type AssetDropdownMode = "send" | "receive" | "chain"; // TODO: remove recaive

type AssetDropdownProps = SelectProps & {
  mode: AssetDropdownMode;
  available?: Array<BridgeCurrency | BridgeChain>;
  label: string;
};

export const AssetDropdown: FunctionComponent<AssetDropdownProps> = ({
  mode,
  available,
  label,
  ...rest
}) => {
  const styles = useAssetDropdownStyles();
  const availabilityFilter = useMemo(
    () => createAvailabilityFilter(available),
    [available]
  );
  const valueRenderer = useMemo(
    () => (value: any) => {
      const selected = getOptionBySymbol(value, mode);
      if (!selected) {
        return <span>empty</span>;
      }
      const { FullIcon, full, short } = selected;
      return (
        <Box display="flex" alignItems="center" width="100%">
          <Box width="40%">
            <Typography variant="body2" className={styles.supplementalText}>
              {label}
            </Typography>
          </Box>
          <Box width="45px" display="flex" alignItems="center">
            <FullIcon className={styles.listIcon} />
          </Box>
          <Box flexGrow={1}>
            <Typography variant="body1">
              {mode === "chain" ? full : short}
            </Typography>
          </Box>
        </Box>
      );
    },
    [mode, styles, label]
  );
  return (
    <div>
      <Select
        variant="outlined"
        className={styles.select}
        renderValue={valueRenderer}
        {...rest}
      >
        {getOptions(mode)
          .filter(availabilityFilter)
          .map(({ symbol, FullIcon, GreyIcon, full, short }) => {
            return (
              <MenuItem key={symbol} value={symbol}>
                <Box display="flex" alignItems="center" width="100%">
                  <Box width="45px">
                    <FullIcon className={styles.listIcon} />
                  </Box>
                  <Box flexGrow={1}>
                    <Typography variant="body1">{short}</Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      {full}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            );
          })}
      </Select>
    </div>
  );
};

export const AssetDropdownWrapper = styled("div")({
  marginTop: 10,
});
