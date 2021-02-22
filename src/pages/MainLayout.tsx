import {
  Button,
  Divider,
  Drawer,
  ListItem,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MenuIcon from "@material-ui/icons/Menu";
import {
  MultiwalletProvider,
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
import { useDebounce, useWindowSize } from "react-use";
import { env } from "../constants/environmentVariables";
import { $renNetwork } from "../features/network/networkSlice";
import { useSetNetworkFromParam } from "../features/network/networkUtils";
import { AuthWarningDialog } from "../features/transactions/components/TransactionsHelpers";
import { TransactionHistory } from "../features/transactions/TransactionHistory";
import {
  $transactionsData,
  $transactionsNeedsAction,
  setTxHistoryOpened,
} from "../features/transactions/transactionsSlice";
import { useSubNetworkName } from "../features/ui/uiHooks";
import {
  useAuthentication,
  useSelectedChainWallet,
  useSyncMultiwalletNetwork,
  useWallet,
  useWeb3Signatures,
} from "../features/wallet/walletHooks";
import {
  $authRequired,
  $multiwalletChain,
  $walletPickerOpened,
  setWalletPickerOpened,
} from "../features/wallet/walletSlice";
import {
  renNetworkToEthNetwork,
  walletPickerModalConfig,
} from "../providers/multiwallet/Multiwallet";
import { TransactionHistoryMenuIconButton } from "../components/buttons/Buttons";
import { RenBridgeLogoIcon } from "../components/icons/RenIcons";
import { Debug } from "../components/utils/Debug";
import {
  useWalletPickerStyles,
  WalletChainLabel,
  WalletConnectingInfo,
  WalletConnectionStatusButton,
  WalletEntryButton,
  WalletWrongNetworkInfo,
} from "../components/wallet/WalletHelpers";
import { Footer } from "../components/layout/Footer";
import {
  MobileLayout,
  MainLayoutVariantProps,
  useMobileLayoutStyles,
} from "../components/layout/MobileLayout";

export const MainLayout: FunctionComponent<MainLayoutVariantProps> = ({
  children,
}) => {
  const styles = useMobileLayoutStyles();
  const dispatch = useDispatch();
  useSetNetworkFromParam();
  useSyncMultiwalletNetwork();
  useWeb3Signatures();
  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
  } = useAuthentication();
  const {
    status,
    account,
    walletConnected,
    deactivateConnector,
    symbol,
  } = useSelectedChainWallet();
  const { txHistoryOpened } = useSelector($transactionsData);
  const txsNeedsAction = useSelector($transactionsNeedsAction);

  const authRequired = useSelector($authRequired);
  const [authWarningOpened, setAuthWarningOpened] = useState(false);
  useDebounce(
    () => {
      const shouldAuthWarningOpened =
        walletConnected &&
        !isAuthenticated &&
        !isAuthenticating &&
        (authRequired || txHistoryOpened);

      setAuthWarningOpened(shouldAuthWarningOpened);
    },
    1000, // the authentication process takes a few seconds
    [walletConnected, isAuthenticated, authRequired, txHistoryOpened]
  );
  // const authWarningOpened =
  //   walletConnected && !isAuthenticated && (authRequired || txHistoryOpened);

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
  const renNetwork = useSelector($renNetwork);
  const pickerClasses = useWalletPickerStyles();
  const [
    walletMenuAnchor,
    setWalletMenuAnchor,
  ] = React.useState<null | HTMLElement>(null);
  const handleWalletPickerClose = useCallback(() => {
    dispatch(setWalletPickerOpened(false));
  }, [dispatch]);
  const handleWalletMenuClose = useCallback(() => {
    setWalletMenuAnchor(null);
  }, []);

  const handleWalletButtonClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (walletConnected) {
        setWalletMenuAnchor(event.currentTarget);
      } else {
        dispatch(setWalletPickerOpened(true));
      }
    },
    [dispatch, walletConnected]
  );

  const handleDisconnectWallet = useCallback(() => {
    deactivateConnector();
    handleWalletMenuClose();
  }, [deactivateConnector, handleWalletMenuClose]);
  const walletPickerOptions = useMemo(() => {
    const options: WalletPickerProps<any, any> = {
      targetNetwork: renNetwork,
      chain: multiwalletChain,
      onClose: handleWalletPickerClose,
      pickerClasses,
      // DefaultInfo: DebugComponentProps,
      ConnectingInfo: WalletConnectingInfo,
      WrongNetworkInfo: WalletWrongNetworkInfo,
      WalletEntryButton,
      WalletChainLabel,
      config: walletPickerModalConfig(renNetworkToEthNetwork(renNetwork) || 1),
    };
    return options;
  }, [multiwalletChain, handleWalletPickerClose, pickerClasses, renNetwork]);

  const debugWallet = useWallet(multiwalletChain); //remove
  const debugMultiwallet = useMultiwallet(); //remove
  const debugNetworkName = useSubNetworkName();

  const drawerId = "main-menu-mobile";
  const showTxIndicator = walletConnected && txsNeedsAction;

  const ToolbarMenu = (
    <>
      <div className={styles.desktopMenu}>
        <TransactionHistoryMenuIconButton
          opened={txHistoryOpened}
          indicator={showTxIndicator}
          className={styles.desktopTxHistory}
          onClick={handleTxHistoryToggle}
        />
        <WalletConnectionStatusButton
          onClick={handleWalletButtonClick}
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
  );
  const DrawerMenu = (
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
        onClick={handleWalletButtonClick}
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
  );

  const WalletMenu = (
    <Menu
      id="wallet-menu"
      getContentAnchorEl={null}
      anchorEl={walletMenuAnchor}
      keepMounted
      open={Boolean(walletMenuAnchor)}
      onClose={handleWalletMenuClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
    >
      <MenuItem onClick={handleDisconnectWallet}>
        <Typography color="error">Disconnect wallet</Typography>
      </MenuItem>
    </Menu>
  );
  return (
    <MobileLayout
      ToolbarMenu={ToolbarMenu}
      DrawerMenu={DrawerMenu}
      WalletMenu={WalletMenu}
    >
      {children}
      <TransactionHistory />
      <AuthWarningDialog open={authWarningOpened} onMainAction={authenticate} />
      <Debug
        it={{
          isAuthenticated,
          debugNetworkName,
          debugWallet,
          debugMultiwallet,
          env,
        }}
      />
    </MobileLayout>
  );
};

export const ConnectedMainLayout: FunctionComponent = ({ children }) => (
  <MultiwalletProvider>
    <MainLayout>{children}</MainLayout>
  </MultiwalletProvider>
);
