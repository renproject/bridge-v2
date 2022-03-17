import { Container, Fade, styled, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
// import { useLottie } from "lottie-react";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
// import bridgeLanding from "../assets/animations/bridge_landing.json";
import { ActionButton } from "../components/buttons/Buttons";
import { WarningIcon } from "../components/icons/RenIcons";
import { NarrowCenteredWrapper } from "../components/layout/LayoutHelpers";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Link } from "../components/links/Links";
import { UnstyledList } from "../components/typography/TypographyHelpers";
import { links, storageKeys } from "../constants/constants";
import { useNotifications } from "../providers/Notifications";
import { usePageTitle } from "../providers/TitleProviders";
import { getAssetConfig, supportedAssets } from "../utils/assetsConfig";
import { getChainConfig, supportedContractChains } from "../utils/chainsConfig";
import { paths } from "./routes";

// const Animation = () => {
//   const options = {
//     animationData: bridgeLanding,
//     loop: true,
//     autoplay: true,
//   };
//
//   const { View } = useLottie(options);
//
//   return View;
// };

const useStyles = makeStyles((theme) => ({
  root: {},
  container: {
    marginBottom: 40,
  },
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
      borderRight: `2px solid #737478`,
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
    fontWeight: "bold",
    textAlign: "center",
    [theme.breakpoints.up("md")]: {
      textAlign: "left",
    },
  },
  rotator: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 50,
    marginTop: 40,
  },
  more: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "2px solid #737478",
    color: "#737478",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  assetsList: {
    margin: "12px auto",
    maxWidth: "40vw",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    [theme.breakpoints.up("md")]: {
      // justifyContent: "space-between",
    },
  },
  assetListItem: {
    display: "inline-flex",
    alignItems: "center",
    margin: "10px",
    // padding: `0px 4px 0px 4px`,
    [theme.breakpoints.up("sm")]: {
      // padding: `0px 12px 0px 12px`,
    },
    [theme.breakpoints.up("md")]: {
      padding: 0,
    },
  },
  renAssetsLabel: {
    // marginTop: 40,
    color: theme.customColors.textLight,
    fontWeight: "bold",
    textAlign: "center",
  },
  assetIcon: {
    fontSize: 52,
    // marginRight: 35,
  },
  chainIcon: {
    fontSize: 50,
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
        <NarrowCenteredWrapper className={styles.rotator}>
          <ChainAssetRotator />
        </NarrowCenteredWrapper>
        <NarrowCenteredWrapper>
          <ActionButton className={styles.button} onClick={handleAgree}>
            Start Bridging
          </ActionButton>
        </NarrowCenteredWrapper>
      </Container>
      <Container maxWidth="md" className={styles.container}>
        <div className={styles.supported}>
          <div className={styles.assets}>
            <Typography variant="h6" component="h2" className={styles.label}>
              {t("common.assets-label")}
            </Typography>
            <UnstyledList className={styles.assetsList}>
              {supportedAssets.map((asset) => {
                const assetConfig = getAssetConfig(asset);
                const { RenIcon } = assetConfig;
                return (
                  <li
                    className={styles.assetListItem}
                    key={assetConfig.shortName}
                  >
                    <RenIcon className={styles.assetIcon} />
                  </li>
                );
              })}
              <li className={styles.assetListItem}>
                <span className={styles.more}>
                  <span>+more</span>
                </span>
              </li>
            </UnstyledList>
          </div>
          <div className={styles.chains}>
            <Typography variant="h6" component="h2" className={styles.label}>
              Chains
            </Typography>
            <UnstyledList className={styles.assetsList}>
              {supportedContractChains.map((chain) => {
                const chainConfig = getChainConfig(chain);
                const { Icon } = chainConfig;
                return (
                  <li
                    className={styles.assetListItem}
                    key={chainConfig.shortName}
                  >
                    <Icon width={46} height={46} className={styles.chainIcon} />
                  </li>
                );
              })}
              <li className={styles.assetListItem}>
                <span className={styles.more}>
                  <span>+more</span>
                </span>
              </li>
            </UnstyledList>
          </div>
        </div>
      </Container>
    </MobileLayout>
  );
};

type ChainAssetRotatorProps = {
  className?: string;
};

const useChainAssetRotatorStyles = makeStyles(() => ({
  root: {
    fontSize: 200,
  },
}));

const timeout = 5000;
const offset = timeout / 3;

const ChainAssetRotator: FunctionComponent<ChainAssetRotatorProps> = ({
  className,
  children,
}) => {
  const styles = useChainAssetRotatorStyles();
  // const [ci, setCi] = useState(0);
  const [ai, setAi] = useState(0);
  const [show, setShow] = useState(false);
  // const chainsCount = supportedContractChains.length;
  const assetsCount = supportedAssets.length;

  useEffect(() => {
    setShow(true);
    // const switchCiTick = setInterval(() => {
    //   setCi((i) => (i === chainsCount - 1 ? 0 : i + 1));
    // }, timeout);

    const hideTick = setTimeout(() => {
      setShow(false);
    }, timeout - offset);

    const switchAiTick = setTimeout(() => {
      setAi(ai === assetsCount - 1 ? 0 : ai + 1);
    }, timeout);

    // const showTick = setTimeout(() => {
    //   setShow(true);
    // }, timeout * chainsCount + offset);

    return () => {
      // clearInterval(switchCiTick);
      clearTimeout(switchAiTick);
      clearTimeout(hideTick);
      // clearTimeout(showTick);
    };
  }, [assetsCount, ai]);

  // const chain = supportedContractChains[ci];
  const asset = supportedAssets[ai];
  const assetConfig = getAssetConfig(asset);
  const { RenIcon } = assetConfig;
  return (
    <div className={className}>
      <Fade in={show} timeout={{ enter: 500, exit: 100 }}>
        <RenIcon className={styles.root} />
      </Fade>
      {children}
    </div>
  );
};
