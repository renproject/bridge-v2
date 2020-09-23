import React, { FunctionComponent } from "react";
import {
  BitcoinIcon,
  MetamaskFoxIcon,
  TxHistoryIcon,
} from "../../icons/RenIcons";
import { Section, SeparationWrapper } from "../PresentationHelpers";
import TwitterIcon from "@material-ui/icons/Twitter";
import RedditIcon from "@material-ui/icons/Reddit";
import TelegramIcon from "@material-ui/icons/Telegram";
import GitHubIcon from "@material-ui/icons/GitHub";
import NotificationsIcon from "@material-ui/icons/Notifications";

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
        <NotificationsIcon />
      </SeparationWrapper>
      <SeparationWrapper>
        <TxHistoryIcon />
        <BitcoinIcon />
        <MetamaskFoxIcon />
      </SeparationWrapper>
    </Section>
  );
};
