import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { SvgIconComponent } from "@material-ui/icons";
import React, { FunctionComponent } from "react";
import { BridgeChain, BridgeCurrency } from '../../utils/assetConfigs'
import {
  BchGreyIcon,
  BinanceChainIcon,
  BitcoinIcon,
  BtcGreyIcon,
  CustomSvgIconComponent,
  DgbGreyIcon,
  DogeGreyIcon,
  DotsFullIcon,
  EthereumIcon,
  ZecFullIcon,
  ZecGreyIcon,
} from "./RenIcons";

const useStyles = makeStyles(() => ({
  root: {
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: 50,
  },
  icon: {
    fontSize: 66,
    height: 62,
    lineHeight: 1,
  },
  label: {
    marginTop: 12,
    lineHeight: 1,
  },
}));

type IconWithLabelProps = {
  label: string;
  Icon: CustomSvgIconComponent | SvgIconComponent;
};

export const IconWithLabel: FunctionComponent<IconWithLabelProps> = ({
  label,
  Icon,
}) => {
  const styles = useStyles();
  return (
    <span className={styles.root}>
      <span className={styles.icon}>
        <Icon fontSize="inherit" />
      </span>
      <Typography variant="overline" className={styles.label}>
        {label}
      </Typography>
    </span>
  );
};

export const getCurrencyGreyIcon = (symbol: BridgeCurrency) => {
  switch (symbol) {
    case BridgeCurrency.BTC:
      return BtcGreyIcon;
    case BridgeCurrency.BCH:
      return BchGreyIcon;
    case BridgeCurrency.DOTS:
      return DotsFullIcon; // add
    case BridgeCurrency.DOGE:
      return DogeGreyIcon;
    case BridgeCurrency.ZEC:
      return ZecGreyIcon;
    case BridgeCurrency.RENBTC:
      return BtcGreyIcon;
    case BridgeCurrency.RENBCH:
      return BchGreyIcon;
    case BridgeCurrency.RENDOGE:
      return DogeGreyIcon;
    case BridgeCurrency.RENZEC:
      return ZecGreyIcon;
    case BridgeCurrency.RENDGB:
      return DgbGreyIcon;
    default:
      return BtcGreyIcon;
  }
};

export const getChainIcon = (symbol: BridgeChain) => {
  switch (symbol) {
    case BridgeChain.BTCC:
      return BitcoinIcon;
    case BridgeChain.BSCC:
      return BinanceChainIcon;
    case BridgeChain.ETHC:
      return EthereumIcon;
    case BridgeChain.ZECC:
      return ZecFullIcon; // TODO: add dedicated ZEC chain icon
    case BridgeChain.UNKNOWNC:
      return BitcoinIcon;
  }
};
