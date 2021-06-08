import { SvgIcon, SvgIconProps } from "@material-ui/core";
import { SvgIconComponent } from "@material-ui/icons";
import React, { FunctionComponent } from "react";
import { getScalingProps } from "../../utils/icons";
import { ReactComponent as AvalancheChain } from "./../../assets/icons/avalanche-chain.svg";
import { ReactComponent as AvaCircle } from "./../../assets/icons/avalanche-circle-icon.svg";
import { ReactComponent as Ava } from "./../../assets/icons/avalanche-colour-icon.svg";
import { ReactComponent as AvaFull } from "./../../assets/icons/avalanche-icon.svg";
import { ReactComponent as BackArrow } from "./../../assets/icons/back-arrow.svg";
import { ReactComponent as Beta } from "./../../assets/icons/icon-beta.svg";
import { ReactComponent as BchGrey } from "./../../assets/icons/bch-icon-grey.svg";
import { ReactComponent as Bch } from "./../../assets/icons/bch-icon-nocolour.svg";
import { ReactComponent as BchFull } from "./../../assets/icons/bch-icon.svg";
import { ReactComponent as BinanceChainFull } from "./../../assets/icons/binancesmartchain-circle-icon.svg";
import { ReactComponent as BinanceChainColor } from "./../../assets/icons/binancesmartchain-colour-icon.svg";
import { ReactComponent as BinanceChain } from "./../../assets/icons/binancesmartchain-icon.svg";
import { ReactComponent as BitcoinInCircle } from "./../../assets/icons/bitcoin-in-circle.svg";
import { ReactComponent as BrowserNotifications } from "./../../assets/icons/browser-notifications.svg";
import { ReactComponent as BtcGrey } from "./../../assets/icons/btc-icon-grey.svg";
import { ReactComponent as Btc } from "./../../assets/icons/btc-icon-nocolour.svg";
import { ReactComponent as Bitcoin } from "./../../assets/icons/btc-icon-only.svg";
import { ReactComponent as BtcFull } from "./../../assets/icons/btc-icon.svg";
import { ReactComponent as EmptyCircle } from "./../../assets/icons/empty-circle-icon.svg";
import { ReactComponent as Empty } from "./../../assets/icons/empty-icon.svg";
import { ReactComponent as DgbGrey } from "./../../assets/icons/dgb-icon-grey.svg";
import { ReactComponent as Dgb } from "./../../assets/icons/dgb-icon-nocolour.svg";
import { ReactComponent as DgbFull } from "./../../assets/icons/dgb-icon.svg";
import { ReactComponent as DogeGrey } from "./../../assets/icons/doge-icon-grey.svg";
import { ReactComponent as Doge } from "./../../assets/icons/doge-icon-nocolour.svg";
import { ReactComponent as DogeFull } from "./../../assets/icons/doge-icon.svg";
import { ReactComponent as DotsGrey } from "./../../assets/icons/dots-icon-grey.svg";
import { ReactComponent as Dots } from "./../../assets/icons/dots-icon-nocolour.svg";
import { ReactComponent as DotsFull } from "./../../assets/icons/dots-icon.svg";
import { ReactComponent as Ethereum } from "./../../assets/icons/eth-icon-only.svg";
import { ReactComponent as EthereumChainFull } from "./../../assets/icons/ethereum-circle-icon.svg";
import { ReactComponent as EthereumChainColor } from "./../../assets/icons/ethereum-colour-icon.svg";
import { ReactComponent as FilGrey } from "./../../assets/icons/fil-icon-grey.svg";
import { ReactComponent as Fil } from "./../../assets/icons/fil-icon-nocolour.svg";
import { ReactComponent as FilFull } from "./../../assets/icons/fil-icon.svg";
import { ReactComponent as Fantom } from "./../../assets/icons/fantom-icon.svg";
import { ReactComponent as FantomFull } from "./../../assets/icons/fantom-colour-icon.svg";
import { ReactComponent as FantomCircle } from "./../../assets/icons/fantom-circle-icon.svg";
import { ReactComponent as Gateway } from "./../../assets/icons/gateway-icon.svg";
import { ReactComponent as LunaGrey } from "./../../assets/icons/luna-icon-grey.svg";
import { ReactComponent as Luna } from "./../../assets/icons/luna-icon-nocolour.svg";
import { ReactComponent as LunaFull } from "./../../assets/icons/luna-icon.svg";
import { ReactComponent as MetamaskFox } from "./../../assets/icons/metamask-fox.svg";
import { ReactComponent as MetamaskFull } from "./../../assets/icons/metamask-icon-colour.svg";
import { ReactComponent as MewFull } from "./../../assets/icons/mew-icon.svg";
import { ReactComponent as NavigateNext } from "./../../assets/icons/chevron-icon-right.svg";
import { ReactComponent as NavigatePrev } from "./../../assets/icons/chevron-icon-left.svg";
import { ReactComponent as QrCode } from "./../../assets/icons/qr-code.svg";
import { ReactComponent as RenLogo } from "./../../assets/icons/ren-logo.svg";
import { ReactComponent as RenLogo3F } from "./../../assets/icons/ren-logo-3f.svg";
import { ReactComponent as RenVMLogo } from "./../../assets/icons/renvm-logo.svg";
import { ReactComponent as RenBridgeLogo } from "./../../assets/icons/renbridge-logo.svg";
import { ReactComponent as Success } from "./../../assets/icons/success-icon.svg";
import { ReactComponent as SpecialAlert } from "./../../assets/icons/specialalert-icon.svg";
import { ReactComponent as Tooltip } from "./../../assets/icons/tooltip.svg";
import { ReactComponent as TxHistory } from "./../../assets/icons/tx-history.svg";
import { ReactComponent as TxSettings } from "./../../assets/icons/tx-settings.svg";
import { ReactComponent as WalletConnectFull } from "./../../assets/icons/walletconnect-icon-colour.svg";
import { ReactComponent as Wallet } from "./../../assets/icons/wallet-icon.svg";
import { ReactComponent as WalletConnect } from "./../../assets/icons/walletconnect-icon.svg";
import { ReactComponent as ZecGrey } from "./../../assets/icons/zec-icon-grey.svg";
import { ReactComponent as Zec } from "./../../assets/icons/zec-icon-nocolour.svg";
import { ReactComponent as ZecFull } from "./../../assets/icons/zec-icon.svg";

import { ReactComponent as Polygon } from "./../../assets/icons/polygon-icon.svg";
import { ReactComponent as PolygonFull } from "./../../assets/icons/polygon-colour-icon.svg";

import AddIcon from "@material-ui/icons/Add";
import BlockIcon from "@material-ui/icons/Block";
import CompletedIcon from "@material-ui/icons/Done";
import DeleteIcon from "@material-ui/icons/Delete";
import HomeIcon from "@material-ui/icons/Home";
import WarningIcon from "@material-ui/icons/Warning";

export { CompletedIcon, BlockIcon, AddIcon, DeleteIcon, WarningIcon, HomeIcon };

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

export const BitcoinIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Bitcoin} {...props} />
);

export const EthereumIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Ethereum} {...props} />
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

export const BitcoinInCircleIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BitcoinInCircle} viewBox="0 0 64 64" {...props} />
);

export const MetamaskFoxIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={MetamaskFox} viewBox="0 0 34 32" {...props} />
);

export const MetamaskFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={MetamaskFull} {...props} />
);

export const MewFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={MewFull} viewBox="0 0 86 104" {...props} />
);

export const WalletConnectFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={WalletConnectFull} {...props} />
);

export const WalletConnectIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={WalletConnect} {...props} />
);

export const AvalancheChainIcon: CustomSvgIconComponent = (props) => {
  const scalingProps = getScalingProps(693.26, 257.79);
  return <SvgIcon component={AvalancheChain} {...scalingProps} {...props} />;
};

export const BinanceChainIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BinanceChain} {...props} />
);

export const BinanceChainFullIcon: CustomSvgIconComponent = (props) => {
  return <SvgIcon component={BinanceChainFull} {...props} />;
};

export const BinanceChainColorIcon: CustomSvgIconComponent = (props) => {
  return <SvgIcon component={BinanceChainColor} {...props} />;
};

export const EthereumChainIcon: CustomSvgIconComponent = (props) => {
  return <SvgIcon component={EthereumIcon} {...props} />;
};

export const EthereumChainFullIcon: CustomSvgIconComponent = (props) => {
  return <SvgIcon component={EthereumChainFull} {...props} />;
};

export const EthereumChainColorIcon: CustomSvgIconComponent = (props) => {
  return <SvgIcon component={EthereumChainColor} {...props} />;
};

export const BtcIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Btc} {...props} />
);
export const BtcFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BtcFull} {...props} />
);

export const BtcGreyIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BtcGrey} {...props} />
);

export const BchFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BchFull} {...props} />
);

export const BchIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Bch} {...props} />
);
export const BchGreyIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={BchGrey} {...props} />
);

export const DogeFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={DogeFull} {...props} />
);

export const DogeIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Doge} {...props} />
);

export const DogeGreyIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={DogeGrey} {...props} />
);

export const ZecIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Zec} {...props} />
);

export const ZecFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={ZecFull} {...props} />
);

export const ZecGreyIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={ZecGrey} {...props} />
);

export const DgbIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Dgb} {...props} />
);

export const DgbFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={DgbFull} {...props} />
);

export const DgbGreyIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={DgbGrey} {...props} />
);

export const DotsIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Dots} {...props} />
);

export const DotsFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={DotsFull} {...props} />
);

export const DotsGreyIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={DotsGrey} {...props} />
);

export const LunaIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Luna} {...props} />
);

export const LunaFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={LunaFull} {...props} />
);

export const LunaGreyIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={LunaGrey} {...props} />
);

export const FilIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Fil} {...props} />
);

export const FilFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={FilFull} {...props} />
);

export const FilGreyIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={FilGrey} {...props} />
);

export const PolygonGreyIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Polygon} {...props} />
);

export const PolygonFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={PolygonFull} {...props} />
);

export const FantomGreyIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Fantom} {...props} />
);

export const FantomFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={FantomFull} {...props} />
);

export const FantomCircleIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={FantomCircle} {...props} />
);

export const AvaIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Fantom} {...props} />
);

export const AvaGreyIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={AvaFull} {...props} />
);

export const AvaFullIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={Ava} {...props} />
);

export const AvaCircleIcon: CustomSvgIconComponent = (props) => (
  <SvgIcon component={AvaCircle} {...props} />
);
