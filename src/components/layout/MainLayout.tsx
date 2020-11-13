import {
  Container,
  Divider,
  Drawer,
  Grid,
  ListItem,
  useTheme,
} from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import CloseIcon from "@material-ui/icons/Close";
import MenuIcon from "@material-ui/icons/Menu";
import { RenNetwork } from "@renproject/interfaces";
import {
  WalletPickerModal,
  WalletPickerProps,
} from "@renproject/multiwallet-ui";
import classNames from "classnames";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { useWindowSize } from "react-use";
import { env } from "../../constants/environmentVariables";
import {
  $multiwalletChain,
  $walletPickerOpened,
  setWalletPickerOpened,
} from "../../features/wallet/walletSlice";
import { paths } from "../../pages/routes";
import { walletPickerModalConfig } from "../../providers/multiwallet/Multiwallet";
import {
  useSelectedChainWallet,
  useWallet,
} from "../../providers/multiwallet/multiwalletHooks";
import { TransactionHistoryMenuIconButton } from "../buttons/Buttons";
import { RenBridgeLogoIcon } from "../icons/RenIcons";
import { Debug } from "../utils/Debug";
import {
  useWalletPickerStyles,
  WalletConnectingInfo,
  WalletConnectionIndicator,
  WalletConnectionStatusButton,
  WalletEntryButton,
  WalletWrongNetworkInfo,
} from "../wallet/WalletHelpers";
import { Footer } from "./Footer";

const headerHeight = 64;
const footerHeight = 25;

const useStyles = makeStyles((theme: Theme) => ({
  bodyWelcome: {
    backgroundImage: "url(/background.svg)",
  },
  grow: {
    flexGrow: 1,
  },
  main: {
    paddingTop: 1,
    marginTop: -1,
    minHeight: `calc(100vh - ${headerHeight + footerHeight}px)`,
  },
  logo: {
    display: "flex",
    alignItems: "center",
  },
  desktopMenu: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "flex",
    },
  },
  desktopTxHistory: {
    marginRight: 20,
  },
  mobileMenu: {
    display: "flex",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  drawerLogo: {
    fontSize: 20,
  },
  drawerPaper: {
    minWidth: 300,
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  drawerClose: {
    cursor: "pointer",
    fontSize: 26,
  },
  drawerListItem: {
    padding: `16px 0`,
  },
  drawerFooterListItem: {
    paddingBottom: 0,
    flexGrow: 2,
    alignItems: "flex-end",
  },
  drawerListItemIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
    marginRight: 16,
  },
}));

const useBackroundReplacer = (variant: string | undefined) =>
  useEffect(() => {
    if (variant === "intro") {
      document.body.style.backgroundImage = "url(/background.svg)";
    } else {
      document.body.style.backgroundImage = "";
    }
  }, [variant]);

type MainLayoutProps = {
  variant?: "intro";
};

export const MainLayout: FunctionComponent<MainLayoutProps> = ({
  variant,
  children,
}) => {
  const history = useHistory();
  const styles = useStyles();
  const dispatch = useDispatch();
  useBackroundReplacer(variant);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);
  const handleMobileMenuOpen = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);
  const { width } = useWindowSize();
  const theme = useTheme();
  useEffect(() => {
    if (width > theme.breakpoints.values["sm"]) {
      setMobileMenuOpen(false);
    }
  }, [width, theme.breakpoints]);

  const handleTxHistoryClick = useCallback(() => {
    history.push(paths.CATALOG);
  }, [history]);

  const multiwalletChain = useSelector($multiwalletChain);
  const walletPickerOpen = useSelector($walletPickerOpened);
  const pickerClasses = useWalletPickerStyles();
  const { status, account } = useSelectedChainWallet();
  const handleWalletPickerClose = useCallback(() => {
    dispatch(setWalletPickerOpened(false));
  }, [dispatch]);
  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setWalletPickerOpened(true));
  }, [dispatch]);
  const walletPickerOptions = useMemo(() => {
    const options: WalletPickerProps<any, any> = {
      targetNetwork: RenNetwork.Testnet, // env.NETWORK, // TODO: pass from env before prod
      chain: multiwalletChain,
      onClose: handleWalletPickerClose,
      pickerClasses,
      // DefaultInfo: () => <span>default</span>,
      ConnectingInfo: WalletConnectingInfo,
      WrongNetworkInfo: WalletWrongNetworkInfo,
      WalletEntryButton,
      config: walletPickerModalConfig,
    };
    return options;
  }, [multiwalletChain, handleWalletPickerClose, pickerClasses]);

  const debugWallet = useWallet(multiwalletChain); //remove

  const drawerId = "main-menu-mobile";
  const withMenu = variant !== "intro";

  return (
    <Container maxWidth="lg">
      <Grid container item>
        <Container maxWidth="lg">
          <header className={styles.grow}>
            <AppBar position="static" color="transparent">
              <Toolbar>
                <div className={styles.logo}>
                  <Link to="/">
                    <RenBridgeLogoIcon />
                  </Link>
                </div>
                <div className={styles.grow} />
                {withMenu && (
                  <>
                    <div className={styles.desktopMenu}>
                      <TransactionHistoryMenuIconButton
                        className={styles.desktopTxHistory}
                        onClick={handleTxHistoryClick}
                      />
                      <WalletConnectionStatusButton
                        onClick={handleWalletPickerOpen}
                        status={status}
                        account={account}
                      />
                      <WalletPickerModal
                        open={walletPickerOpen}
                        options={walletPickerOptions}
                      />
                    </div>
                    <div className={styles.mobileMenu}>
                      <IconButton
                        aria-label="show more"
                        aria-controls={drawerId}
                        aria-haspopup="true"
                        onClick={handleMobileMenuOpen}
                        color="inherit"
                      >
                        <MenuIcon />
                      </IconButton>
                    </div>
                  </>
                )}
              </Toolbar>
            </AppBar>
            {withMenu && (
              <Drawer
                anchor="right"
                id={drawerId}
                keepMounted
                open={mobileMenuOpen}
                onClose={handleMobileMenuClose}
                PaperProps={{ className: styles.drawerPaper }}
              >
                <div className={styles.drawerHeader}>
                  <RenBridgeLogoIcon className={styles.drawerLogo} />
                  <CloseIcon
                    className={styles.drawerClose}
                    onClick={handleMobileMenuClose}
                  />
                </div>
                <Divider />
                <ListItem divider className={styles.drawerListItem} button>
                  <div className={styles.drawerListItemIcon}>
                    <WalletConnectionIndicator status={status} />
                  </div>
                  <p>Connect a Wallet</p>
                </ListItem>
                <ListItem divider className={styles.drawerListItem} button>
                  <div className={styles.drawerListItemIcon}>
                    <TransactionHistoryMenuIconButton
                      onClick={handleTxHistoryClick}
                    />
                  </div>
                  <p>View Transactions</p>
                </ListItem>
                <ListItem
                  className={classNames(
                    styles.drawerListItem,
                    styles.drawerFooterListItem
                  )}
                >
                  <Footer mobile />
                </ListItem>
              </Drawer>
            )}
          </header>
          <main className={styles.main}>
            {children}
            <Debug it={{ debugWallet, env }} />
          </main>
          <Footer />
        </Container>
      </Grid>
    </Container>
  );
};
