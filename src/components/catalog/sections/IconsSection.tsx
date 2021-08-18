import { Box, useTheme } from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import RedditIcon from "@material-ui/icons/Reddit";
import TelegramIcon from "@material-ui/icons/Telegram";
import TwitterIcon from "@material-ui/icons/Twitter";
import React, { FunctionComponent } from "react";
import { IconWithLabel } from "../../icons/IconHelpers";
import {
  ArbitrumBlackIcon,
  ArbitrumCircleIcon,
  ArbitrumColorIcon,
  AvaCircleIcon,
  AvaFullIcon,
  AvaGreyIcon,
  BackArrowIcon,
  BchFullIcon,
  BchGreyIcon,
  BchIcon,
  BinanceChainColorIcon,
  BinanceChainFullIcon,
  BinanceChainIcon,
  BitcoinIcon,
  BitcoinInCircleIcon,
  BrowserNotificationsIcon,
  BtcFullIcon,
  BtcGreyIcon,
  BtcIcon,
  DgbFullIcon,
  DgbGreyIcon,
  DgbIcon,
  DogeFullIcon,
  DogeGreyIcon,
  DogeIcon,
  DotsFullIcon,
  DotsGreyIcon,
  DotsIcon,
  EmptyCircleIcon,
  EthereumChainColorIcon,
  EthereumChainFullIcon,
  EthereumChainIcon,
  EthereumIcon,
  FantomCircleIcon,
  FantomFullIcon,
  FantomGreyIcon,
  FilFullIcon,
  FilGreyIcon,
  FilIcon,
  LunaFullIcon,
  LunaGreyIcon,
  LunaIcon,
  MetamaskFoxIcon,
  PolygonCircleIcon,
  PolygonFullIcon,
  PolygonGreyIcon,
  RenBridgeLogoIcon,
  RenLogoFullIcon,
  RenLogoIcon,
  RenVMLogoIcon,
  SpecialAlertIcon,
  SuccessIcon,
  TxSettingsIcon,
  WalletConnectFullIcon,
  WalletConnectIcon,
  WalletIcon,
  ZecFullIcon,
  ZecGreyIcon,
  ZecIcon,
} from "../../icons/RenIcons";
import { Section, SeparationWrapper } from "../PresentationHelpers";

export const IconsSection: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <Section header="Icons">
      <SeparationWrapper>
        <TwitterIcon />
        <RedditIcon />
        <TelegramIcon />
        <GitHubIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <BackArrowIcon />
        <BrowserNotificationsIcon />
        {/*<TxHistoryIcon />*/}
        <TxSettingsIcon />
        <MoreVertIcon />
        <WalletIcon />
        <SuccessIcon />
        <SpecialAlertIcon />
        <EmptyCircleIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <BitcoinIcon />
        <EthereumIcon />
        <WalletConnectIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <ArbitrumCircleIcon />
        <BinanceChainFullIcon />
        <EthereumChainFullIcon />
        <FantomCircleIcon />
        <PolygonCircleIcon />
        <AvaCircleIcon />
        <WalletConnectFullIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <ArbitrumColorIcon />
        <BinanceChainColorIcon />
        <EthereumChainColorIcon />
        <FantomFullIcon />
        <PolygonFullIcon />
        <AvaFullIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <ArbitrumBlackIcon />
        <BinanceChainIcon />
        <EthereumChainIcon />
        <FantomGreyIcon />
        <PolygonGreyIcon />
        <AvaGreyIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <ArbitrumBlackIcon style={{ color: theme.customColors.blue }} />
        <BinanceChainIcon style={{ color: theme.customColors.blue }} />
        <EthereumChainIcon style={{ color: theme.customColors.blue }} />
        <FantomGreyIcon style={{ color: theme.customColors.blue }} />
        <PolygonGreyIcon style={{ color: theme.customColors.blue }} />
        <AvaGreyIcon style={{ color: theme.customColors.blue }} />
      </SeparationWrapper>
      <SeparationWrapper>
        <BtcIcon />
        <BchIcon />
        <DogeIcon />
        <ZecIcon />
        <DgbIcon />
        <DotsIcon />
        <LunaIcon />
        <FilIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <BtcFullIcon />
        <BchFullIcon />
        <DogeFullIcon />
        <ZecFullIcon />
        <DgbFullIcon />
        <DotsFullIcon />
        <LunaFullIcon />
        <FilFullIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <BtcGreyIcon />
        <BchGreyIcon />
        <DogeGreyIcon />
        <ZecGreyIcon />
        <DgbGreyIcon />
        <DotsGreyIcon />
        <LunaGreyIcon />
        <FilGreyIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <RenBridgeLogoIcon />
        <RenLogoFullIcon />
        <RenVMLogoIcon />
        <Box bgcolor="gray" display="inline-block" p={1}>
          <RenLogoIcon />
        </Box>
      </SeparationWrapper>
      <SeparationWrapper>
        <BitcoinInCircleIcon />
        <MetamaskFoxIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <IconWithLabel label="BTC" Icon={BtcFullIcon} />
        <IconWithLabel label="BCH" Icon={BchFullIcon} />
        <IconWithLabel label="DOGE" Icon={DogeFullIcon} />
        <IconWithLabel label="ZEC" Icon={ZecFullIcon} />
        <IconWithLabel label="DGB" Icon={DgbFullIcon} />
      </SeparationWrapper>
    </Section>
  );
};
