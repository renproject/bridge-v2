import { Box, MenuItem, Select, Typography, } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import React, { FunctionComponent, useCallback, useState } from 'react'
import {
  BchFullIcon,
  BtcFullIcon,
  CustomSvgIconComponent,
  DogeFullIcon,
  DotsFullIcon,
  ZecFullIcon,
} from '../icons/RenIcons'

enum AssetSymbols {
  BTC = "BTC",
  BCH = "BCH",
  DOTS = "DOTS",
  DOGE = "DOGE",
  ZEC = "ZEC",
}

type AssetConfig = {
  symbol: string;
  name: string;
  Icon: CustomSvgIconComponent;
};

const options: Array<AssetConfig> = [
  {
    symbol: AssetSymbols.BTC,
    name: "Bitcoin",
    Icon: BtcFullIcon,
  },
  {
    symbol: AssetSymbols.BCH,
    name: "Bitcoin Cash",
    Icon: BchFullIcon,
  },
  {
    symbol: AssetSymbols.DOTS,
    name: "Polkadot",
    Icon: DotsFullIcon,
  },
  {
    symbol: AssetSymbols.DOGE,
    name: "Dogecoin",
    Icon: DogeFullIcon,
  },
  {
    symbol: AssetSymbols.ZEC,
    name: "Zcash",
    Icon: ZecFullIcon,
  },
];


const useAssetDropdownStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    padding: 15,
  },
  select: {
    width: "100%",
  },
  icon: {
    width: 30,
    height: 30,
  },
}));

export const AssetDropdown: FunctionComponent = () => {
  const [asset, setAsset] = useState("BTC");
  const handleChange = useCallback((event) => {
    setAsset(event.target.value);
  }, []);
  const styles = useAssetDropdownStyles();
  return (
    <div>
      <Select
        value={asset}
        onChange={handleChange}
        variant="outlined"
        className={styles.select}
      >
        {options.map((option) => {
          const { symbol, Icon, name } = option;
          return (
            <MenuItem key={symbol} value={symbol}>
              <Box display="flex" alignItems="center" width="100%">
                <Box width="45px">
                  <Icon className={styles.icon} />
                </Box>
                <Box flexGrow={1}>
                  <Typography variant="body1">{symbol}</Typography>
                  <Typography variant="subtitle2" color="textSecondary">{name}</Typography>
                </Box>
              </Box>
            </MenuItem>
          );
        })}
      </Select>
    </div>
  );
};
