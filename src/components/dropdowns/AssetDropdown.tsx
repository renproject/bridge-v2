import { Box, MenuItem, Select, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  BchFullIcon,
  BtcFullIcon,
  CustomSvgIconComponent,
  DogeFullIcon,
  DotsFullIcon,
  ZecFullIcon,
} from "../icons/RenIcons";

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

const getOptionBySymbol = (symbol: string) =>
  options.find((option) => option.symbol === symbol);

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
}));

const createValueRenderer = (mode: AssetDropdownMode) => (value: any) => {
  const selected = getOptionBySymbol(value);
  if (!selected) {
    return <span>empty</span>;
  }
  const { Icon, symbol } = selected;
  return (
    <Box display="flex" alignItems="center" width="100%">
      <Box width="40%">
        <Typography variant="body2">
          {mode === "send" ? "Send" : "Receive"}
        </Typography>
      </Box>
      <Box width="45px" display="flex" alignItems="center">
        <Icon style={iconStyles} />
      </Box>
      <Box flexGrow={1}>
        <Typography variant="body1">{symbol}</Typography>
      </Box>
    </Box>
  );
};

type AssetDropdownMode = "send" | "receive";

type AssetDropdownProps = {
  mode: AssetDropdownMode;
};

export const AssetDropdown: FunctionComponent<AssetDropdownProps> = ({
  mode,
}) => {
  const styles = useAssetDropdownStyles();
  const [asset, setAsset] = useState("BTC");
  const handleChange = useCallback((event) => {
    setAsset(event.target.value);
  }, []);
  const valueRenderer = useMemo(() => createValueRenderer(mode), [mode]);
  return (
    <div>
      <Select
        value={asset}
        onChange={handleChange}
        variant="outlined"
        className={styles.select}
        renderValue={valueRenderer}
      >
        {options.map(({ symbol, Icon, name }) => {
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
