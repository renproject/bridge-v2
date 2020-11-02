import { Box, MenuItem, Select, SelectProps, styled, Typography, } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import React, { FunctionComponent, useMemo } from 'react'
import { getChainFullLabel, getCurrencyFullLabel, } from '../../utils/labels'
import {
  BchFullIcon,
  BinanceChainFullIcon,
  BtcFullIcon,
  CustomSvgIconComponent,
  DogeFullIcon,
  DotsFullIcon,
  EthereumChainFullIcon,
  ZecFullIcon,
} from '../icons/RenIcons'
import { BridgeChain, ChainType, CurrencySymbols, CurrencyType, } from '../utils/types'

type AssetConfig = {
  symbol: string;
  name: string;
  Icon: CustomSvgIconComponent;
};

const currencyOptions: Array<AssetConfig> = [
  {
    symbol: CurrencySymbols.BTC,
    name: getCurrencyFullLabel(CurrencySymbols.BTC),
    Icon: BtcFullIcon,
  },
  {
    symbol: CurrencySymbols.BCH,
    name: getCurrencyFullLabel(CurrencySymbols.BCH),
    Icon: BchFullIcon,
  },
  {
    symbol: CurrencySymbols.DOTS,
    name: getCurrencyFullLabel(CurrencySymbols.DOTS),
    Icon: DotsFullIcon,
  },
  {
    symbol: CurrencySymbols.DOGE,
    name: getCurrencyFullLabel(CurrencySymbols.DOGE),
    Icon: DogeFullIcon,
  },
  {
    symbol: CurrencySymbols.ZEC,
    name: getCurrencyFullLabel(CurrencySymbols.ZEC),
    Icon: ZecFullIcon,
  },
];

const chainOptions: Array<AssetConfig> = [
  {
    symbol: BridgeChain.BNCC,
    name: getChainFullLabel(BridgeChain.BNCC),
    Icon: BinanceChainFullIcon,
  },
  {
    symbol: BridgeChain.ETHC,
    name: getChainFullLabel(BridgeChain.ETHC),
    Icon: EthereumChainFullIcon,
  },
];

const getOptions = (mode: AssetDropdownMode) =>
  mode === "chain" ? chainOptions : currencyOptions;

const getOptionBySymbol = (symbol: string, mode: AssetDropdownMode) =>
  getOptions(mode).find((option) => option.symbol === symbol);

const createAvailabilityFilter = (available: Array<string> | undefined) => (
  option: AssetConfig
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

type AssetDropdownMode = "send" | "receive" | "chain";

type AssetDropdownProps = SelectProps & {
  mode: AssetDropdownMode;
  available?: Array<CurrencyType | ChainType>;
};

export const AssetDropdown: FunctionComponent<AssetDropdownProps> = ({
  mode,
  available,
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
      const { Icon, name, symbol } = selected;
      return (
        <Box display="flex" alignItems="center" width="100%">
          <Box width="40%">
            <Typography variant="body2" className={styles.supplementalText}>
              {mode === "send" && "Send"}
              {mode === "receive" && "Receive"}
              {mode === "chain" && "Destination Chain"}
            </Typography>
          </Box>
          <Box width="45px" display="flex" alignItems="center">
            <Icon className={styles.listIcon} />
          </Box>
          <Box flexGrow={1}>
            <Typography variant="body1">
              {mode === "chain" ? name : symbol}
            </Typography>
          </Box>
        </Box>
      );
    },
    [mode, styles]
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
          .map(({ symbol, Icon, name }) => {
            return (
              <MenuItem key={symbol} value={symbol}>
                <Box display="flex" alignItems="center" width="100%">
                  <Box width="45px">
                    <Icon className={styles.listIcon} />
                  </Box>
                  <Box flexGrow={1}>
                    <Typography variant="body1">{symbol}</Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      {name}
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
