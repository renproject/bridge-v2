import { SvgIcon, SvgIconProps } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { ReactComponent as BitcoinInCircle } from "./../../assets/icons/bitcoin-in-circle.svg";
import { ReactComponent as BrowserNotifications } from "./../../assets/icons/browser-notifications.svg";
import { ReactComponent as Bitcoin } from "./../../assets/icons/btc-icon-only.svg";
import { ReactComponent as Ethereum } from "./../../assets/icons/eth-icon-only.svg";
import { ReactComponent as MetamaskFox } from "./../../assets/icons/metamask-fox.svg";
import { ReactComponent as TxHistory } from "./../../assets/icons/tx-history.svg";

type CustomSvgIconComponent = FunctionComponent<SvgIconProps>;

export const TxHistoryIcon: CustomSvgIconComponent = () => (
  <SvgIcon component={TxHistory} />
);

export const BrowserNotificationsIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BrowserNotifications} {...props} />
);

export const BitcoinIcon: CustomSvgIconComponent = () => (
  <SvgIcon component={Bitcoin} />
);

export const EthereumIcon: CustomSvgIconComponent = () => (
  <SvgIcon component={Ethereum} />
);

export const BitcoinInCircleIcon: CustomSvgIconComponent = () => (
  <SvgIcon component={BitcoinInCircle} viewBox="0 0 64 64" />
);

export const MetamaskFoxIcon: CustomSvgIconComponent = () => (
  <SvgIcon component={MetamaskFox} viewBox="0 0 34 32" />
);
