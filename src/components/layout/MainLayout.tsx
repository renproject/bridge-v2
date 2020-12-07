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
import {
  useMultiwallet,
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
import { Link } from "react-router-dom";
import { useWindowSize } from "react-use";
import { env } from "../../constants/environmentVariables";
import { $network } from "../../features/network/networkSlice";
import { useSetNetworkFromParam } from "../../features/network/networkUtils";
import { TransactionHistory } from "../../features/transactions/TransactionHistory";
import {
  $transactionsData,
  setTxHistoryOpened,
} from "../../features/transactions/transactionsSlice";
import {
  $multiwalletChain,
  $walletPickerOpened,
  $walletSignatures,
  setWalletPickerOpened,
} from "../../features/wallet/walletSlice";
import { walletPickerModalConfig } from "../../providers/multiwallet/Multiwallet";
import {
  useSelectedChainWallet,
  useWallet,
} from "../../providers/multiwallet/multiwalletHooks";
import { useWeb3Signatures } from "../../services/web3";
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

const headerHeight = 82;
const footerHeight = 45;

const useStyles = makeStyles((theme: Theme) => ({
  bodyWelcome: {
    backgroundImage: "url(/background.svg)",
  },
  grow: {
    minHeight: headerHeight,
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
    paddingTop: 0,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 0,
    minWidth: 300,
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
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
    paddingBottom: 15,
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

const useBackgroundReplacer = (variant: string | undefined) =>
  useEffect(() => {
    if (variant === "intro") {
      document.body.style.backgroundImage = "url(/background.svg)";
    } else {
      document.body.style.backgroundImage = "";
    }
  }, [variant]);

type MainLayoutProps = {
  variant?: "intro" | "about";
};

export const MainLayout: FunctionComponent<MainLayoutProps> = ({
  variant,
  children,
}) => {
  const styles = useStyles();
  const dispatch = useDispatch();
  useSetNetworkFromParam();
  useBackgroundReplacer(variant);
  useWeb3Signatures();
  const { txHistoryOpened } = useSelector($transactionsData);
  const { signature } = useSelector($walletSignatures);
  const { status, account, symbol } = useSelectedChainWallet();

  console.log(signature);
  // TODO: add firebase stuff here
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

  const handleTxHistoryToggle = useCallback(() => {
    dispatch(setTxHistoryOpened(!txHistoryOpened));
  }, [dispatch, txHistoryOpened]);

  const multiwalletChain = useSelector($multiwalletChain);
  const walletPickerOpen = useSelector($walletPickerOpened);
  const network = useSelector($network);
  const pickerClasses = useWalletPickerStyles();
  const handleWalletPickerClose = useCallback(() => {
    dispatch(setWalletPickerOpened(false));
  }, [dispatch]);
  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setWalletPickerOpened(true));
  }, [dispatch]);
  const walletPickerOptions = useMemo(() => {
    const options: WalletPickerProps<any, any> = {
      targetNetwork: network,
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
  }, [multiwalletChain, handleWalletPickerClose, pickerClasses, network]);

  const debugWallet = useWallet(multiwalletChain); //remove
  const debugMultiwallet = useMultiwallet(); //remove

  const drawerId = "main-menu-mobile";
  const withMenu = variant !== "intro" && variant !== "about";

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
                        opened={txHistoryOpened}
                        indicator
                        className={styles.desktopTxHistory}
                        onClick={handleTxHistoryToggle}
                      />
                      <WalletConnectionStatusButton
                        onClick={handleWalletPickerOpen}
                        hoisted={txHistoryOpened}
                        status={status}
                        account={account}
                        wallet={symbol}
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
                      opened={txHistoryOpened}
                      onClick={handleTxHistoryToggle}
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
            <Debug it={{ debugWallet, debugMultiwallet, env }} />
          </main>
          <TransactionHistory />
          <Footer />
        </Container>
      </Grid>
    </Container>
  );
};
