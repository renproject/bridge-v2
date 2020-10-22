import { SvgIcon, SvgIconProps } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { getScalingProps } from "../../utils/icons";
import { ReactComponent as BchFull } from "./../../assets/icons/bch-icon.svg";
import { ReactComponent as BitcoinInCircle } from "./../../assets/icons/bitcoin-in-circle.svg";
import { ReactComponent as BrowserNotifications } from "./../../assets/icons/browser-notifications.svg";
import { ReactComponent as Bitcoin } from "./../../assets/icons/btc-icon-only.svg";
import { ReactComponent as BtcFull } from "./../../assets/icons/btc-icon.svg";
import { ReactComponent as DogeFull } from "./../../assets/icons/doge-icon.svg";
import { ReactComponent as DotsFull } from "./../../assets/icons/dots-icon.svg";
import { ReactComponent as Ethereum } from "./../../assets/icons/eth-icon-only.svg";
import { ReactComponent as MetamaskFox } from "./../../assets/icons/metamask-fox.svg";
import { ReactComponent as QrCode } from "./../../assets/icons/qr-code.svg";
import { ReactComponent as RenLogo } from "./../../assets/icons/ren-logo.svg";
import { ReactComponent as RenBridgeLogo } from "./../../assets/icons/renbridge-logo.svg";
import { ReactComponent as TxHistory } from "./../../assets/icons/tx-history.svg";
import { ReactComponent as TxSettings } from "./../../assets/icons/tx-settings.svg";
import { ReactComponent as Success } from "./../../assets/icons/success-icon.svg";
import { ReactComponent as ZecFull } from "./../../assets/icons/zec-icon.svg";
import { ReactComponent as BinanceChainFull } from "./../../assets/icons/binancesmartchain-circle-icon.svg";
import { ReactComponent as BinanceChain } from "./../../assets/icons/binancesmartchain-icon.svg";
import { ReactComponent as EthereumChainFull } from "./../../assets/icons/ethereum-circle-icon.svg";
import { ReactComponent as BinanceChainColor } from "./../../assets/icons/binancesmartchain-colour-icon.svg";
import { ReactComponent as EthereumChainColor } from "./../../assets/icons/ethereum-colour-icon.svg";
import { ReactComponent as Tooltip } from "./../../assets/icons/tooltip.svg";
import { ReactComponent as BackArrow } from "./../../assets/icons/back-arrow.svg";
import { ReactComponent as WalletConnectFull } from "./../../assets/icons/walletconnect-icon-colour.svg";
import { ReactComponent as WalletConnect } from "./../../assets/icons/walletconnect-icon.svg";

export type CustomSvgIconComponent = FunctionComponent<SvgIconProps>;

export const TxHistoryIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={TxHistory} {...props} />
);

export const TxSettingsIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={TxSettings} {...props} />
);

export const TooltipIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Tooltip} {...props} />
);

export const BackArrowIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BackArrow} {...props} />
);

export const SuccessIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Success} {...props} />
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

export const BtcFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BtcFull} {...props} />
);

export const BchFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BchFull} {...props} />
);

export const DogeFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={DogeFull} {...props} />
);

export const DotsFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={DotsFull} {...props} />
);

export const ZecFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={ZecFull} {...props} />
);

export const WalletConnectFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={WalletConnectFull} {...props} />
);

export const WalletConnectIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={WalletConnect} {...props} />
);

export const BinanceChainIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BinanceChain} {...props} />
);

export const BinanceChainFullIcon: CustomSvgIconComponent = (props) => {
  return <SvgIcon component={BinanceChainFull} {...props} />;
};

export const EthereumChainFullIcon: CustomSvgIconComponent = (props) => {
  return <SvgIcon component={EthereumChainFull} {...props} />;
};

export const BinanceChainColorIcon: CustomSvgIconComponent = (props) => {
  return <SvgIcon component={BinanceChainColor} {...props} />;
};

export const EthereumChainColorIcon: CustomSvgIconComponent = (props) => {
  return <SvgIcon component={EthereumChainColor} {...props} />;
};

export const RenBridgeLogoIcon: CustomSvgIconComponent = (props) => {
  const scalingProps = getScalingProps(115, 23);
  return <SvgIcon component={RenBridgeLogo} {...scalingProps} {...props} />;
};

export const RenLogoIcon: CustomSvgIconComponent = (props) => {
  const scalingProps = getScalingProps(24, 27);
  return <SvgIcon component={RenLogo} {...scalingProps} {...props} />;
};

export const BitcoinInCircleIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BitcoinInCircle} viewBox="0 0 64 64" {...props} />
);

export const MetamaskFoxIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={MetamaskFox} viewBox="0 0 34 32" {...props} />
);
