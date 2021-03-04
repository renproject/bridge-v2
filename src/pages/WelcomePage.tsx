import { Container, styled, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent, useCallback, useEffect } from "react";
import { RouteComponentProps } from "react-router";
import { ActionButton } from "../components/buttons/Buttons";
import { IconWithLabel } from "../components/icons/IconHelpers";
import {
  BchFullIcon,
  BinanceChainFullIcon,
  BtcFullIcon,
  DogeFullIcon,
  EmptyCircleIcon,
  EthereumChainFullIcon,
  WarningIcon,
  ZecFullIcon,
} from "../components/icons/RenIcons";
import { NarrowCenteredWrapper } from "../components/layout/LayoutHelpers";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Link } from "../components/links/Links";
import { UnstyledList } from "../components/typography/TypographyHelpers";
import { links, storageKeys } from "../constants/constants";
import { useNotifications } from "../providers/Notifications";
import { usePageTitle } from "../providers/TitleProviders";
import { paths } from "./routes";

const useStyles = makeStyles((theme) => ({
  root: {},
  heading: {
    marginTop: 112,
    textAlign: "center",
    color: theme.palette.text.primary,
  },
  description: {
    marginTop: 24,
    textAlign: "center",
    color: theme.customColors.textLight,
  },
  continuation: {
    marginTop: 48,
    textAlign: "center",
  },
  button: {
    maxWidth: 400,
    marginTop: 20,
  },
  supported: {
    marginTop: 82,
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("md")]: {
      flexDirection: "row",
      justifyContent: "stretch",
    },
  },
  assets: {
    [theme.breakpoints.up("md")]: {
      paddingRight: 42,
      flexGrow: 5,
      borderRight: `2px solid ${theme.customColors.grayDisabled}`,
    },
  },
  chains: {
    // width: "20%",
    [theme.breakpoints.up("md")]: {
      paddingLeft: 40,
      flexGrow: 1,
    },
  },
  label: {
    color: theme.customColors.textLight,
    fontWeight: "bold",
    textAlign: "center",
    [theme.breakpoints.up("md")]: {
      textAlign: "left",
    },
  },
  assetsList: {
    margin: "12px auto",
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.up("md")]: {
      justifyContent: "space-between",
    },
  },
  assetListItem: {
    padding: `0px 4px 0px 4px`,
    [theme.breakpoints.up("sm")]: {
      padding: `0px 12px 0px 12px`,
    },
    [theme.breakpoints.up("md")]: {
      padding: 0,
    },
  },
  legacy: {
    marginTop: 70,
    textAlign: "center",
  },
}));

const AdjustedWarningIcon = styled(WarningIcon)({
  marginBottom: -5,
});

export const WelcomePage: FunctionComponent<RouteComponentProps> = ({
  history,
}) => {
  usePageTitle("Welcome");
  const { showNotification } = useNotifications();
  const styles = useStyles();
  useEffect(() => {
    showNotification(
      <Typography variant="caption">
        <AdjustedWarningIcon fontSize="small" /> RenVM is new technology, and{" "}
        <Link
          href={links.SECURITY_AUDITS}
          target="_blank"
          color="primary"
          underline="hover"
        >
          security audits
        </Link>{" "}
        don't completely eliminate risks. Please don’t supply assets you can’t
        afford to lose.
      </Typography>,
      {
        variant: "specialInfo",
        persist: true,
        anchorOrigin: {
          horizontal: "center",
          vertical: "top",
        },
      }
    );
  }, [showNotification]);
  const handleAgree = useCallback(() => {
    localStorage.setItem(storageKeys.TERMS_AGREED, "1");
    history.replace(paths.HOME);
  }, [history]);

  return (
    <MobileLayout withBackground>
      <Container maxWidth="sm">
        <Typography variant="h1" className={styles.heading}>
          Transfer assets between blockchains
        </Typography>
        <Typography variant="body1" className={styles.description}>
          An easy way to bridge cross-chain assets between blockchains.
        </Typography>
        <Typography variant="body1" className={styles.continuation}>
          To continue, read and agree to the{" "}
          <Link
            color="primary"
            underline="hover"
            target="_blank"
            href={links.TERMS_OF_SERVICE}
          >
            Terms of Service
          </Link>
        </Typography>
        <NarrowCenteredWrapper>
          <ActionButton className={styles.button} onClick={handleAgree}>
            Agree & Continue
          </ActionButton>
        </NarrowCenteredWrapper>
      </Container>
      <Container maxWidth="md">
        <div className={styles.supported}>
          <div className={styles.assets}>
            <Typography
              variant="overline"
              component="h2"
              className={styles.label}
            >
              Assets
            </Typography>
            <UnstyledList className={styles.assetsList}>
              <li className={styles.assetListItem}>
                <IconWithLabel label="Bitcoin" Icon={BtcFullIcon} />
              </li>
              <li className={styles.assetListItem}>
                <IconWithLabel label="Bitcoin Cash" Icon={BchFullIcon} />
              </li>
              <li className={styles.assetListItem}>
                <IconWithLabel label="ZCash" Icon={ZecFullIcon} />
              </li>
              <li className={styles.assetListItem}>
                <IconWithLabel label="Doge" Icon={DogeFullIcon} />
              </li>
              <li className={styles.assetListItem}>
                <IconWithLabel label="+ more soon" Icon={EmptyCircleIcon} />
              </li>
            </UnstyledList>
          </div>
          <div className={styles.chains}>
            <Typography
              variant="overline"
              component="h2"
              className={styles.label}
            >
              Destination
            </Typography>
            <UnstyledList className={styles.assetsList}>
              <li className={styles.assetListItem}>
                <IconWithLabel label="Ethereum" Icon={EthereumChainFullIcon} />
              </li>
              <li className={styles.assetListItem}>
                <IconWithLabel label="Binance Smart Chain" Icon={BinanceChainFullIcon} />
              </li>
            </UnstyledList>
          </div>
        </div>
        <div className={styles.legacy}>
          <Typography variant="body1">
            If you'd rather use the old version of RenBridge,{" "}
            <Link
              external
              href={links.LEGACY_BRIDGE}
              color="primary"
              underline="hover"
            >
              head here
            </Link>
            .
          </Typography>
        </div>
      </Container>
    </MobileLayout>
  );
};
