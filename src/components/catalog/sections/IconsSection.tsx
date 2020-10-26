import { Box } from '@material-ui/core'
import GitHubIcon from '@material-ui/icons/GitHub'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import RedditIcon from '@material-ui/icons/Reddit'
import TelegramIcon from '@material-ui/icons/Telegram'
import TwitterIcon from '@material-ui/icons/Twitter'
import React, { FunctionComponent } from 'react'
import { IconWithLabel } from '../../icons/IconHelpers'
import {
  BackArrowIcon,
  BchFullIcon,
  BchGreyIcon,
  BinanceChainColorIcon,
  BinanceChainFullIcon,
  BitcoinIcon,
  BitcoinInCircleIcon,
  BrowserNotificationsIcon,
  BtcFullIcon,
  BtcGreyIcon,
  DgbFullIcon,
  DgbGreyIcon,
  DogeFullIcon,
  DogeGreyIcon,
  DotsFullIcon,
  EthereumChainColorIcon,
  EthereumChainFullIcon,
  EthereumIcon,
  MetamaskFoxIcon,
  RenBridgeLogoIcon,
  RenLogoIcon,
  SuccessIcon,
  TxHistoryIcon,
  ZecFullIcon,
  ZecGreyIcon,
} from '../../icons/RenIcons'
import { Section, SeparationWrapper } from '../PresentationHelpers'

export const IconsSection: FunctionComponent = () => {
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
        <TxHistoryIcon />
        <MoreVertIcon />
        <SuccessIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <BitcoinIcon />
        <EthereumIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <BinanceChainColorIcon />
        <EthereumChainColorIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <BinanceChainFullIcon />
        <EthereumChainFullIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <BtcFullIcon />
        <BchFullIcon />
        <DogeFullIcon />
        <ZecFullIcon />
        <DgbFullIcon />
        <DotsFullIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <BtcGreyIcon />
        <BchGreyIcon />
        <DogeGreyIcon />
        <ZecGreyIcon />
        <DgbGreyIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <RenBridgeLogoIcon />
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
