import { Container, Divider, Drawer, Grid, ListItem } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import CloseIcon from "@material-ui/icons/Close";
import MenuIcon from "@material-ui/icons/Menu";
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
import { Link } from "react-router-dom";
import { walletPickerModalConfig } from "../../providers/Multiwallet";
import {
  TransactionHistoryMenuIconButton,
  WalletConnectionIndicator,
  WalletConnectionStatusButton,
} from "../buttons/Buttons";
import { RenBridgeLogoIcon } from "../icons/RenIcons";
import { useWalletPickerStyles } from "../wallet/WalletHelpers";
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

type MainLayoutProps = {
  variant?: "welcome";
};

export const MainLayout: FunctionComponent<MainLayoutProps> = ({
  variant,
  children,
}) => {
  const styles = useStyles();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);
  const handleMobileMenuOpen = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  useEffect(() => {
    if (variant === "welcome") {
      document.body.style.backgroundImage = "url(/background.svg)";
    } else {
      document.body.style.backgroundImage = "";
    }
  }, [variant]);

  const pickerClasses = useWalletPickerStyles();
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const [chain, setChain] = useState("ethereum");
  const handleWalletPickerClose = useCallback(() => {
    setWalletPickerOpen(false);
  }, []);
  const handleWalletPickerOpen = useCallback(() => {
    setWalletPickerOpen(true);
  }, []);
  const walletPickerOptions = useMemo(() => {
    const options: WalletPickerProps<any, any> = {
      pickerClasses,
      chain,
      close: handleWalletPickerClose,
      config: walletPickerModalConfig,
    };
    return options;
  }, [chain, handleWalletPickerClose, pickerClasses]);

  console.log(setChain);
  // TODO: add debounced resize/useLayoutEffect for disabling drawer after transition

  const drawerId = "main-menu-mobile";

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
                <div className={styles.desktopMenu}>
                  <TransactionHistoryMenuIconButton
                    className={styles.desktopTxHistory}
                  />
                  <WalletConnectionStatusButton
                    onClick={handleWalletPickerOpen}
                  />
                  <WalletPickerModal
                    open={walletPickerOpen}
                    close={handleWalletPickerClose}
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
              </Toolbar>
            </AppBar>
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
                  <WalletConnectionIndicator status="error" />
                </div>
                <p>Connect a Wallet</p>
              </ListItem>
              <ListItem divider className={styles.drawerListItem} button>
                <div className={styles.drawerListItemIcon}>
                  <TransactionHistoryMenuIconButton />
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
          </header>
          <main className={styles.main}>{children}</main>
          <Footer />
        </Container>
      </Grid>
    </Container>
  );
};
