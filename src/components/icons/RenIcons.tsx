import { SvgIcon } from "@material-ui/core";
import React from "react";
import { ReactComponent as Bitcoin } from "./../../assets/icons/bitcoin.svg";
import { ReactComponent as MetamaskFox } from "./../../assets/icons/metamask-fox.svg";
import { ReactComponent as TxHistory } from "./../../assets/icons/txhistory.svg";

export const TxHistoryIcon = () => (
  <SvgIcon component={TxHistory} viewBox="0 0 14 10" />
);

export const BitcoinIcon = () => (
  <SvgIcon component={Bitcoin} viewBox="0 0 64 64" />
);

export const MetamaskFoxIcon = () => (
  <SvgIcon component={MetamaskFox} viewBox="0 0 34 32" />
);
