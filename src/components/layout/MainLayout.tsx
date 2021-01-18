import {
  Button,
  Container,
  Divider,
  Drawer,
  Grid,
  ListItem,
  Menu,
  MenuItem,
  Typography,
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
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useWindowSize } from "react-use";
import { env } from "../../constants/environmentVariables";
import { $renNetwork } from "../../features/network/networkSlice";
import { useSetNetworkFromParam } from "../../features/network/networkUtils";
import { TransactionHistory } from "../../features/transactions/TransactionHistory";
// import { TransactionHistory } from '../../features/transactions/TransactionHistory'
import {
  $transactionsData,
  $transactionsNeedsAction,
  setTxHistoryOpened,
} from "../../features/transactions/transactionsSlice";
import { useTestnetName } from "../../features/ui/uiHooks";
import {
  useSelectedChainWallet,
  useSyncMultiwalletNetwork,
  useWallet,
  useWeb3Signatures,
} from "../../features/wallet/walletHooks";
import {
  $multiwalletChain,
  $walletPickerOpened,
  setWalletPickerOpened,
} from "../../features/wallet/walletSlice";
import { walletPickerModalConfig } from "../../providers/multiwallet/Multiwallet";
import { TransactionHistoryMenuIconButton } from "../buttons/Buttons";
import { RenBridgeLogoIcon } from "../icons/RenIcons";
import { Debug } from "../utils/Debug";
import {
  useWalletPickerStyles,
  WalletChainLabel,
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
  ToolbarMenu: ReactNode | "";
  DrawerMenu: ReactNode | "";
  WalletMenu: ReactNode | "";
};

export const MainLayout: FunctionComponent<MainLayoutProps> = ({
  variant,
  ToolbarMenu = "",
  DrawerMenu,
  WalletMenu,
  children,
}) => {
  const styles = useStyles();
  useBackgroundReplacer(variant);

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
                {ToolbarMenu}
              </Toolbar>
            </AppBar>
            {DrawerMenu}
            {WalletMenu}
          </header>
          <main className={styles.main}>{children}</main>
          <TransactionHistory />
          <Footer />
        </Container>
      </Grid>
    </Container>
  );
};
