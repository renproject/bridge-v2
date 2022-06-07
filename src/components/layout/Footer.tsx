import { LinkProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GitHubIcon from "@material-ui/icons/GitHub";
import RedditIcon from "@material-ui/icons/Reddit";
import TelegramIcon from "@material-ui/icons/Telegram";
import TwitterIcon from "@material-ui/icons/Twitter";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { links } from "../../constants/constants";
import { featureFlags } from "../../constants/featureFlags";
import { LanguageSelector } from "../../features/i18n/components/I18nHelpers";
import { SystemMonitorFooterButton } from "../../features/ui/SystemMonitor";
import { paths } from "../../pages/routes";
import { CustomLinkProps, Link } from "../links/Links";

export const FooterTextLink: FunctionComponent<CustomLinkProps> = (props) => (
  <Link color="textSecondary" underline="hover" {...props} />
);

const useFooterIconLinkStyles = makeStyles(() => ({
  root: {
    fontSize: 18,
  },
}));

const FooterIconLink: FunctionComponent<LinkProps> = (props) => {
  const styles = useFooterIconLinkStyles();
  return (
    <Link
      className={styles.root}
      color="textSecondary"
      underline="none"
      {...props}
    />
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "flex",
      justifyContent: "space-between",
      paddingTop: 20,
      paddingBottom: 10,
    },
  },
  rootMobile: {
    display: "block",
  },
  textLinks: {
    display: "block",
    listStyleType: "none",
    margin: 0,
    paddingLeft: 0,
    [theme.breakpoints.up("sm")]: {
      display: "flex",
      flexDirection: "row",
    },
    "& > li": {
      margin: `0 0 8px`,
      [theme.breakpoints.up("sm")]: {
        margin: `0 8px`,
        "&:first-child": {
          marginLeft: 0,
        },
        "&:last-child": {
          marginRight: 0,
        },
      },
    },
  },
  iconLinks: {
    display: "flex",
    flexDirection: "row",
    listStyleType: "none",
    margin: 0,
    paddingLeft: 0,
    "& > li": {
      margin: `0 8px`,
      "&:first-child": {
        marginLeft: 0,
      },
      "&:last-child": {
        marginRight: 0,
      },
    },
  },
}));

type FooterProps = { mobile?: boolean };

export const Footer: FunctionComponent<FooterProps> = ({ mobile }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const rootClassName = classNames(styles.root, {
    [styles.rootMobile]: mobile,
  });
  return (
    <footer className={rootClassName}>
      <ul className={styles.textLinks}>
        <li>
          <FooterTextLink to={paths.ABOUT}>
            {t("navigation.about-label")}
          </FooterTextLink>
        </li>
        <li>
          <FooterTextLink href={links.DOCS} target="_blank">
            {t("navigation.docs-label")}
          </FooterTextLink>
        </li>
        <li>
          <FooterTextLink href={links.FAQ} target="_blank">
            {t("navigation.faqs-label")}
          </FooterTextLink>
        </li>
        <li>
          <FooterTextLink href={links.WIKI} target="_blank">
            {t("navigation.wiki-label")}
          </FooterTextLink>
        </li>
        {featureFlags.godMode && (
          <li>
            <SystemMonitorFooterButton />
          </li>
        )}
        <li>
          <LanguageSelector />
        </li>
      </ul>
      <ul className={styles.iconLinks}>
        <li>
          <FooterIconLink href={links.SOCIAL_TWITTER} target="_blank">
            <TwitterIcon fontSize="inherit" />
          </FooterIconLink>
        </li>
        <li>
          <FooterIconLink href={links.SOCIAL_GITHUB} target="_blank">
            <GitHubIcon fontSize="inherit" />
          </FooterIconLink>
        </li>
        <li>
          <FooterIconLink href={links.SOCIAL_TELEGRAM} target="_blank">
            <TelegramIcon fontSize="inherit" />
          </FooterIconLink>
        </li>
        <li>
          <FooterIconLink href={links.SOCIAL_REDDIT} target="_blank">
            <RedditIcon fontSize="inherit" />
          </FooterIconLink>
        </li>
      </ul>
    </footer>
  );
};
