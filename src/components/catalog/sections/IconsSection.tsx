import React, { FunctionComponent } from "react";
import {
  BitcoinIcon,
  BitcoinInCircleIcon,
  BrowserNotificationsIcon,
  EthereumIcon,
  MetamaskFoxIcon,
  TxHistoryIcon,
} from "../../icons/RenIcons";
import { Section, SeparationWrapper } from "../PresentationHelpers";
import TwitterIcon from "@material-ui/icons/Twitter";
import RedditIcon from "@material-ui/icons/Reddit";
import TelegramIcon from "@material-ui/icons/Telegram";
import GitHubIcon from "@material-ui/icons/GitHub";
import MoreVertIcon from "@material-ui/icons/MoreVert";

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
        <BrowserNotificationsIcon />
        <TxHistoryIcon />
        <MoreVertIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <BitcoinIcon />
        <EthereumIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <BitcoinInCircleIcon />
        <MetamaskFoxIcon />
      </SeparationWrapper>
    </Section>
  );
};
