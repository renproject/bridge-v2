import {
  Box,
  ListSubheader,
  MenuItem,
  Select,
  SelectProps,
  styled,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent, useMemo } from "react";
import { AssetBalance } from "../../features/wallet/walletSlice";
import { getAssetBalance } from "../../features/wallet/walletUtils";
import {
  BridgeChain,
  BridgeCurrency,
  ChainConfig,
  chainsConfig,
  currenciesConfig,
  CurrencyConfig,
} from "../../utils/assetConfigs";
import { NumberFormatText } from "../formatting/NumberFormatText";

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
  supplementalText: {
    fontSize: 12,
  },
  iconWrapper: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
  },
  listIcon: iconStyles,
  assetName: {
    fontSize: 13,
  },
  assetFullName: {
    fontSize: 10,
  },
  balance: {
    fontSize: 12,
  },
  listSubheader: {
    fontSize: 10,
    lineHeight: 1,
  },
  listSubheaderLabel: {
    fontSize: 10,
  },
}));

type AssetDropdownMode = "send" | "receive" | "chain"; // TODO: remove recaive

type AssetDropdownProps = SelectProps & {
  mode: AssetDropdownMode;
  available?: Array<BridgeCurrency | BridgeChain>;
  balances?: Array<AssetBalance>;
  label: string;
};

export const AssetDropdown: FunctionComponent<AssetDropdownProps> = ({
  mode,
  available,
  label,
  balances,
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
      const { MainIcon, full, short } = selected;
      return (
        <Box display="flex" alignItems="center" width="100%">
          <Box width="40%">
            <Typography variant="body2" className={styles.supplementalText}>
              {label}
            </Typography>
          </Box>
          <Box width="45px" display="flex" alignItems="center">
            <MainIcon className={styles.listIcon} />
          </Box>
          <Box flexGrow={1}>
            <Typography variant="body2">
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
        MenuProps={{
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          getContentAnchorEl: null,
        }}
        {...rest}
      >
        <ListSubheader className={styles.listSubheader}>
          <Box display="flex" alignItems="center" width="100%">
            <Box width="45px" />
            <Box flexGrow={1}>
              <Typography
                variant="overline"
                className={styles.listSubheaderLabel}
              >
                {mode === "chain" ? "Blockchain" : "Asset"}
              </Typography>
            </Box>
            {balances && (
              <Box flexGrow={1} textAlign="right">
                <Typography
                  variant="overline"
                  className={styles.listSubheaderLabel}
                >
                  Your Balance
                </Typography>
              </Box>
            )}
          </Box>
        </ListSubheader>
        {getOptions(mode)
          .filter(availabilityFilter)
          .map(({ symbol, MainIcon, GreyIcon, full, short }) => {
            return (
              <MenuItem key={symbol} value={symbol}>
                <Box display="flex" alignItems="center" width="100%">
                  <Box width="45px" className={styles.iconWrapper}>
                    <MainIcon className={styles.listIcon} />
                  </Box>
                  <Box flexGrow={1}>
                    <Typography variant="body1" className={styles.assetName}>
                      {short}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      className={styles.assetFullName}
                    >
                      {full}
                    </Typography>
                  </Box>
                  {balances && (
                    <Box
                      flexGrow={1}
                      textAlign="right"
                      className={styles.balance}
                    >
                      <NumberFormatText
                        value={getAssetBalance(
                          balances,
                          symbol as BridgeCurrency
                        )}
                      />
                    </Box>
                  )}
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
