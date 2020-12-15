import {
  Button,
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
  $transactionsNeedsAction,
  setTxHistoryOpened,
} from "../../features/transactions/transactionsSlice";
import { useNetworkName } from "../../features/ui/uiHooks";
import {
  $multiwalletChain,
  $walletPickerOpened,
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
  WalletConnectionStatusButton,
  WalletEntryButton,
  WalletWrongNetworkInfo,
} from "../wallet/WalletHelpers";
import { Footer } from "./Footer";

const headerHeight = 82;
const footerHeight = 55;

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
  mobileTxHistory: {
    marginRight: 16,
  },
  mobileMenu: {
    display: "flex",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  mobileMenuButton: {
    padding: "0 0",
    minHeight: 40,
    "&:hover": {
      backgroundColor: "transparent", // list item handles hover styles
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
      document.body.style.backgroundImage = "none";
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
  const txsNeedsAction = useSelector($transactionsNeedsAction);
  const { status, account, walletConnected, symbol } = useSelectedChainWallet();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
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
      // DefaultInfo: DebugComponentProps,
      ConnectingInfo: WalletConnectingInfo,
      WrongNetworkInfo: WalletWrongNetworkInfo,
      WalletEntryButton,
      config: walletPickerModalConfig,
    };
    return options;
  }, [multiwalletChain, handleWalletPickerClose, pickerClasses, network]);

  const debugWallet = useWallet(multiwalletChain); //remove
  const debugMultiwallet = useMultiwallet(); //remove
  const debugNetworkName = useNetworkName();

  const drawerId = "main-menu-mobile";
  const withMenu = variant !== "intro" && variant !== "about";
  const showTxIndicator = walletConnected && txsNeedsAction;
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
                        indicator={showTxIndicator}
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
                  <IconButton
                    aria-label="close"
                    className={styles.drawerClose}
                    onClick={handleMobileMenuClose}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
                <Divider />
                <ListItem
                  divider
                  className={styles.drawerListItem}
                  button
                  onClick={handleWalletPickerOpen}
                >
                  <WalletConnectionStatusButton
                    className={styles.mobileMenuButton}
                    mobile
                    status={status}
                    account={account}
                    wallet={symbol}
                  />
                </ListItem>
                <ListItem
                  divider
                  className={styles.drawerListItem}
                  button
                  onClick={handleTxHistoryToggle}
                >
                  <Button className={styles.mobileMenuButton} component="div">
                    <TransactionHistoryMenuIconButton
                      className={styles.mobileTxHistory}
                      indicator={showTxIndicator}
                    />
                    <span>View Transactions</span>
                  </Button>
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
            <Debug
              it={{ debugNetworkName, debugWallet, debugMultiwallet, env }}
            />
          </main>
          <TransactionHistory />
          <Footer />
        </Container>
      </Grid>
    </Container>
  );
};
