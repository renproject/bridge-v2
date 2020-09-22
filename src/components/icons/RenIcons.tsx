import { SvgIcon } from "@material-ui/core";
import React from "react";
import { ReactComponent as TxHistory } from "./../../assets/icons/txhistory.svg";
import { ReactComponent as Bitcoin } from "./../../assets/icons/bitcoin.svg";
import { ReactComponent as Github } from "./../../assets/icons/github.svg";
import { ReactComponent as MetamaskFox } from "./../../assets/icons/metamask-fox.svg";
import { ReactComponent as Reddit } from "./../../assets/icons/reddit.svg";
import { ReactComponent as Telegram } from "./../../assets/icons/telegram.svg";
import { ReactComponent as Twitter } from "./../../assets/icons/twitter.svg";

export const TxHistoryIcon = () => (
  <SvgIcon component={TxHistory} viewBox="0 0 14 10" />
);

export const BitcoinIcon = () => (
  <SvgIcon component={Bitcoin} viewBox="0 0 64 64" />
);

export const MetamaskFoxIcon = () => (
  <SvgIcon component={MetamaskFox} viewBox="0 0 34 32" />
);

export const GithubIcon = () => (
  <SvgIcon component={Github} viewBox="0 0 14 13" />
);

export const RedditIcon = () => (
  <SvgIcon component={Reddit} viewBox="0 0 14 13" />
);

export const TelegramIcon = () => (
  <SvgIcon component={Telegram} viewBox="0 0 14 13" />
);

export const TwitterIcon = () => (
  <SvgIcon component={Twitter} viewBox="0 0 14 13" />
);

