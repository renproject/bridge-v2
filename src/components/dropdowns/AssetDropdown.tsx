import {
  Box,
  MenuItem,
  Select,
  SelectProps,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  BchFullIcon,
  BinanceChainFullIcon,
  BtcFullIcon,
  CustomSvgIconComponent,
  DogeFullIcon,
  DotsFullIcon,
  EthereumChainFullIcon,
  ZecFullIcon,
} from "../icons/RenIcons";

enum CurrencySymbols {
  BTC = "BTC",
  BCH = "BCH",
  DOTS = "DOTS",
  DOGE = "DOGE",
  ZEC = "ZEC",
}

enum ChainSymbols {
  BNCC = "BNCC",
  ETHC = "ETHC",
}

type AssetConfig = {
  symbol: string;
  name: string;
  Icon: CustomSvgIconComponent;
};

const currencyOptions: Array<AssetConfig> = [
  {
    symbol: CurrencySymbols.BTC,
    name: "Bitcoin",
    Icon: BtcFullIcon,
  },
  {
    symbol: CurrencySymbols.BCH,
    name: "Bitcoin Cash",
    Icon: BchFullIcon,
  },
  {
    symbol: CurrencySymbols.DOTS,
    name: "Polkadot",
    Icon: DotsFullIcon,
  },
  {
    symbol: CurrencySymbols.DOGE,
    name: "Dogecoin",
    Icon: DogeFullIcon,
  },
  {
    symbol: CurrencySymbols.ZEC,
    name: "Zcash",
    Icon: ZecFullIcon,
  },
];

const chainOptions: Array<AssetConfig> = [
  {
    symbol: ChainSymbols.BNCC,
    name: "Binance Smartchain",
    Icon: BinanceChainFullIcon,
  },
  {
    symbol: ChainSymbols.ETHC,
    name: "Ethereum",
    Icon: EthereumChainFullIcon,
  },
];

const getOptions = (mode: AssetDropdownMode) =>
  mode === "chain" ? chainOptions : currencyOptions;

const getOptionBySymbol = (symbol: string, mode: AssetDropdownMode) =>
  getOptions(mode).find((option) => option.symbol === symbol);

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
};

export const AssetDropdown: FunctionComponent<AssetDropdownProps> = ({
  mode,
  defaultValue,
}) => {
  const styles = useAssetDropdownStyles();
  const [asset, setAsset] = useState(defaultValue);
  const handleChange = useCallback((event) => {
    setAsset(event.target.value);
  }, []);
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
        value={asset}
        onChange={handleChange}
        variant="outlined"
        className={styles.select}
        renderValue={valueRenderer}
      >
        {getOptions(mode).map(({ symbol, Icon, name }) => {
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
