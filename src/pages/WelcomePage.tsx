import { Container, styled, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DynamicTokenIcon } from "@renproject/icons";
import { ChainType } from "@renproject/icons/lib/components/DynamicTokenIcon";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { ActionButton } from "../components/buttons/Buttons";
import { IconWithLabel } from "../components/icons/IconHelpers";
import { EmptyCircleIcon, WarningIcon } from "../components/icons/RenIcons";
import { NarrowCenteredWrapper } from "../components/layout/LayoutHelpers";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Link } from "../components/links/Links";
import { UnstyledList } from "../components/typography/TypographyHelpers";
import { links, storageKeys } from "../constants/constants";
import { useNotifications } from "../providers/Notifications";
import { usePageTitle } from "../providers/TitleProviders";
import {
  getAssetConfig,
  getRenAssetName,
  supportedAssets,
} from "../utils/assetsConfig";
import { getChainConfig, supportedContractChains } from "../utils/chainsConfig";
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
    maxWidth: "40vw",
    display: "flex",
    flexWrap: "wrap",
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
  renAssetsLabel: {
    marginTop: 40,
    color: theme.customColors.textLight,
    fontWeight: "bold",
    textAlign: "center",
  },
  renAssets: {
    marginTop: -50,
    marginBottom: 60,
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  renAssetItem: {
    margin: `4px`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    "& > div": {
      marginTop: -60,
    },
  },
  avalancheIcon: {
    display: "flex",
    alignItems: "center",
    fontSize: 24,
  },
}));

const AdjustedWarningIcon = styled(WarningIcon)({
  marginBottom: -5,
});

export const WelcomePage: FunctionComponent<RouteComponentProps> = ({
  history,
}) => {
  const { t } = useTranslation();
  usePageTitle(t("welcome.title"));
  const { showNotification } = useNotifications();
  const styles = useStyles();
  useEffect(() => {
    showNotification(
      <Typography variant="caption">
        <AdjustedWarningIcon fontSize="small" />{" "}
        {t("welcome.warning-message-1")}{" "}
        <Link
          href={links.SECURITY_AUDITS}
          target="_blank"
          color="primary"
          underline="hover"
        >
          {t("welcome.warning-link-text")}
        </Link>{" "}
        {t("welcome.warning-message-2")}
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
  }, [showNotification, t]);
  const handleAgree = useCallback(() => {
    localStorage.setItem(storageKeys.TERMS_AGREED, "1");
    history.replace(paths.HOME);
  }, [history]);

  return (
    <MobileLayout withBackground>
      <Container maxWidth="sm">
        <Typography variant="h1" className={styles.heading}>
          {t("welcome.header")}
        </Typography>
        <Typography variant="body1" className={styles.description}>
          {t("welcome.subheader")}
        </Typography>
        <NarrowCenteredWrapper>
          <ActionButton className={styles.button} onClick={handleAgree}>
            {t("common.continue-label")}
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
              {t("common.assets-label")}
            </Typography>
            <UnstyledList className={styles.assetsList}>
              {supportedAssets.map((asset) => {
                const assetConfig = getAssetConfig(asset);
                return (
                  <li className={styles.assetListItem}>
                    <IconWithLabel
                      label={assetConfig.fullName}
                      Icon={assetConfig.Icon}
                    />
                  </li>
                );
              })}
              <li className={styles.assetListItem}>
                <IconWithLabel
                  label={t("welcome.more-soon")}
                  Icon={EmptyCircleIcon}
                />
              </li>
            </UnstyledList>
          </div>
          <div className={styles.chains}>
            <Typography
              variant="overline"
              component="h2"
              className={styles.label}
            >
              {t("common.destination-label")}
            </Typography>
            <UnstyledList className={styles.assetsList}>
              {supportedContractChains.map((chain) => {
                const chainConfig = getChainConfig(chain);
                return (
                  <li className={styles.assetListItem}>
                    <IconWithLabel
                      label={chainConfig.fullName}
                      Icon={chainConfig.Icon}
                    />
                  </li>
                );
              })}
              <li className={styles.assetListItem}>
                <IconWithLabel
                  label={t("welcome.more-soon")}
                  Icon={EmptyCircleIcon}
                />
              </li>
            </UnstyledList>
          </div>
        </div>
        <div>
          <Typography
            className={styles.renAssetsLabel}
            variant="overline"
            component="h2"
            align="center"
          >
            Ren {t("common.assets-label")}
          </Typography>
        </div>
        <div className={styles.renAssets}>
          {supportedAssets.map((asset, index) => {
            const assetConfig = getAssetConfig(asset);
            return (
              <ChainAssetRotator
                className={styles.renAssetItem}
                start={Math.min(supportedContractChains.length - 1, index)}
                Icon={assetConfig.Icon}
              >
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="div"
                >
                  {getRenAssetName(asset)}
                </Typography>
              </ChainAssetRotator>
            );
          })}
        </div>
      </Container>
    </MobileLayout>
  );
};

type ChainAssetRotatorProps = {
  Icon: FunctionComponent<any>;
  start?: number;
  className?: string;
};

const ChainAssetRotator: FunctionComponent<ChainAssetRotatorProps> = ({
  className,
  Icon,
  start = 0,
  children,
}) => {
  const [ci, setCi] = useState(start);

  useEffect(() => {
    const interval = setInterval(() => {
      setCi((c) => (c === supportedContractChains.length - 1 ? 0 : c + 1));
    }, 5000 + (-start / 2) * 300);
    return () => clearInterval(interval);
  }, [start]);

  const chain = supportedContractChains[ci];

  return (
    <div className={className}>
      <DynamicTokenIcon chain={chain as ChainType} Icon={Icon} size={99} />
      {children}
    </div>
  );
};
