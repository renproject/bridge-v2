import { SvgIcon } from "@material-ui/core";
import React from "react";
import { ReactComponent as BitcoinInCircle } from "./../../assets/icons/bitcoin-in-circle.svg";
import { ReactComponent as MetamaskFox } from "./../../assets/icons/metamask-fox.svg";
import { ReactComponent as TxHistory } from "./../../assets/icons/tx-history.svg";
import { ReactComponent as BrowserNotifications } from "./../../assets/icons/browser-notifications.svg";
import { ReactComponent as Bitcoin } from "./../../assets/icons/btc-icon-only.svg";
import { ReactComponent as Ethereum } from "./../../assets/icons/eth-icon-only.svg";

export const TxHistoryIcon = () => (
  <SvgIcon component={TxHistory} />
);

export const BrowserNotificationsIcon = () => (
  <SvgIcon component={BrowserNotifications} />
);

export const BitcoinIcon = () => (
  <SvgIcon component={Bitcoin} />
);

export const EthereumIcon = () => (
  <SvgIcon component={Ethereum} />
);

export const BitcoinInCircleIcon = () => (
  <SvgIcon component={BitcoinInCircle} viewBox="0 0 64 64" />
);

export const MetamaskFoxIcon = () => (
  <SvgIcon component={MetamaskFox} viewBox="0 0 34 32" />
);
