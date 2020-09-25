import { SvgIcon, SvgIconProps } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { ReactComponent as BitcoinInCircle } from "./../../assets/icons/bitcoin-in-circle.svg";
import { ReactComponent as BrowserNotifications } from "./../../assets/icons/browser-notifications.svg";
import { ReactComponent as Bitcoin } from "./../../assets/icons/btc-icon-only.svg";
import { ReactComponent as Ethereum } from "./../../assets/icons/eth-icon-only.svg";
import { ReactComponent as MetamaskFox } from "./../../assets/icons/metamask-fox.svg";
import { ReactComponent as TxHistory } from "./../../assets/icons/tx-history.svg";
import { ReactComponent as TxSettings } from "./../../assets/icons/tx-settings.svg";
import { ReactComponent as QrCode } from "./../../assets/icons/qr-code.svg";

type CustomSvgIconComponent = FunctionComponent<SvgIconProps>;

export const TxHistoryIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={TxHistory} {...props} />
);

export const TxSettingsIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={TxSettings} {...props} />
);

export const QrCodeIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={QrCode} {...props} />
);

export const BrowserNotificationsIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BrowserNotifications} {...props} />
);

export const BitcoinIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Bitcoin} {...props} />
);

export const EthereumIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Ethereum} {...props} />
);

export const BitcoinInCircleIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BitcoinInCircle} viewBox="0 0 64 64" {...props} />
);

export const MetamaskFoxIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={MetamaskFox} viewBox="0 0 34 32" {...props} />
);
