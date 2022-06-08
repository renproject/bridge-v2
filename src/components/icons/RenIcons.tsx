import { SvgIcon, SvgIconProps } from "@material-ui/core";
import { SvgIconComponent } from "@material-ui/icons";

import AccountIcon from "@material-ui/icons/AccountBalanceWallet";
import AddIcon from "@material-ui/icons/Add";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import BlockIcon from "@material-ui/icons/Block";
import CheckedIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";
import CompletedIcon from "@material-ui/icons/Done";
import HomeIcon from "@material-ui/icons/Home";
import LanguageIcon from "@material-ui/icons/Language";
import TxRecoveryIcon from "@material-ui/icons/Receipt";
import RemoveIcon from "@material-ui/icons/RemoveCircleOutline";
import IssueResolverIcon from "@material-ui/icons/SyncProblem";
import WarningIcon from "@material-ui/icons/Warning";
import React, { FunctionComponent } from "react";
import { getScalingProps } from "../../utils/icons";
import { ReactComponent as BackArrow } from "./../../assets/icons/back-arrow.svg";
import { ReactComponent as BrowserNotifications } from "./../../assets/icons/browser-notifications.svg";
import { ReactComponent as NavigatePrev } from "./../../assets/icons/chevron-icon-left.svg";
import { ReactComponent as NavigateNext } from "./../../assets/icons/chevron-icon-right.svg";
import { ReactComponent as EmptyCircle } from "./../../assets/icons/empty-circle-icon.svg";
import { ReactComponent as Empty } from "./../../assets/icons/empty-icon.svg";
import { ReactComponent as Gateway } from "./../../assets/icons/gateway-icon.svg";
import { ReactComponent as Beta } from "./../../assets/icons/icon-beta.svg";
import { ReactComponent as QrCode } from "./../../assets/icons/qr-code.svg";
import { ReactComponent as RenLogo3F } from "./../../assets/icons/ren-logo-3f.svg";
import { ReactComponent as RenLogo } from "./../../assets/icons/ren-logo.svg";
import { ReactComponent as RenBridgeLogo } from "./../../assets/icons/renbridge-logo.svg";
import { ReactComponent as RenVMLogo } from "./../../assets/icons/renvm-logo.svg";
import { ReactComponent as SpecialAlert } from "./../../assets/icons/specialalert-icon.svg";
import { ReactComponent as Success } from "./../../assets/icons/success-icon.svg";
import { ReactComponent as Tooltip } from "./../../assets/icons/tooltip.svg";
import { ReactComponent as TxHistory } from "./../../assets/icons/tx-history.svg";
import { ReactComponent as TxSettings } from "./../../assets/icons/tx-settings.svg";
import { ReactComponent as Wallet } from "./../../assets/icons/wallet-icon.svg";

export {
  AccountIcon,
  ArrowRightIcon,
  CompletedIcon,
  BlockIcon,
  AddIcon,
  DeleteIcon,
  RemoveIcon,
  WarningIcon,
  HomeIcon,
  LanguageIcon,
  CheckedIcon,
  IssueResolverIcon,
  TxRecoveryIcon,
};

export type CustomSvgIconComponent =
  | FunctionComponent<SvgIconProps>
  | SvgIconComponent;

export const EmptyCircleIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={EmptyCircle} {...props} />
);

export const EmptyIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Empty} {...props} />
);

export const TxHistoryIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={TxHistory} {...props} />
);

export const TxSettingsIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={TxSettings} {...props} />
);

export const TooltipIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Tooltip} {...props} />
);

export const WalletIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Wallet} {...props} />
);

export const BackArrowIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BackArrow} {...props} />
);

export const NavigatePrevIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={NavigatePrev} {...props} />
);

export const NavigateNextIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={NavigateNext} {...props} />
);

export const SuccessIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Success} {...props} />
);

export const SpecialAlertIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={SpecialAlert} {...props} />
);

export const QrCodeIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={QrCode} {...props} />
);

export const GatewayIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Gateway} {...props} />
);

export const BrowserNotificationsIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BrowserNotifications} {...props} />
);

export const BetaIcon: CustomSvgIconComponent = (props) => {
  const scalingProps = getScalingProps(47, 24);
  return <SvgIcon component={Beta} {...scalingProps} {...props} />;
};

export const RenBridgeLogoIcon: CustomSvgIconComponent = (props) => {
  const scalingProps = getScalingProps(115, 23);
  return <SvgIcon component={RenBridgeLogo} {...scalingProps} {...props} />;
};

export const RenLogoIcon: CustomSvgIconComponent = (props) => {
  const scalingProps = getScalingProps(24, 27);
  return <SvgIcon component={RenLogo} {...scalingProps} {...props} />;
};

export const RenVMLogoIcon: CustomSvgIconComponent = (props) => {
  const scalingProps = getScalingProps(124, 29);
  return <SvgIcon component={RenVMLogo} {...scalingProps} {...props} />;
};

export const RenLogoFullIcon: CustomSvgIconComponent = (props) => {
  const scalingProps = getScalingProps(121, 52);
  return <SvgIcon component={RenLogo3F} {...scalingProps} {...props} />;
};
