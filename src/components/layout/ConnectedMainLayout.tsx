import { Button, Divider, Drawer, ListItem, Menu, MenuItem, Typography, useTheme, } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import MenuIcon from '@material-ui/icons/Menu'
import { useMultiwallet, WalletPickerModal, WalletPickerProps, } from '@renproject/multiwallet-ui'
import classNames from 'classnames'
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState, } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useWindowSize } from 'react-use'
import { env } from '../../constants/environmentVariables'
import { $renNetwork } from '../../features/network/networkSlice'
import { useSetNetworkFromParam } from '../../features/network/networkUtils'
// import { TransactionHistory } from '../../features/transactions/TransactionHistory'
import {
  $transactionsData,
  $transactionsNeedsAction,
  setTxHistoryOpened,
} from '../../features/transactions/transactionsSlice'
import { useTestnetName } from '../../features/ui/uiHooks'
import {
  useSelectedChainWallet,
  useSyncMultiwalletNetwork,
  useWallet,
  useWeb3Signatures,
} from '../../features/wallet/walletHooks'
import { $multiwalletChain, $walletPickerOpened, setWalletPickerOpened, } from '../../features/wallet/walletSlice'
import { walletPickerModalConfig } from '../../providers/multiwallet/Multiwallet'
import { TransactionHistoryMenuIconButton } from '../buttons/Buttons'
import { RenBridgeLogoIcon } from '../icons/RenIcons'
import { Debug } from '../utils/Debug'
import {
  useWalletPickerStyles,
  WalletChainLabel,
  WalletConnectingInfo,
  WalletConnectionStatusButton,
  WalletEntryButton,
  WalletWrongNetworkInfo,
} from '../wallet/WalletHelpers'
import { Footer } from './Footer'
import { MainLayout, useMainLayoutStyles } from './MainLayout'

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

export const ConnectedMainLayout: FunctionComponent<MainLayoutProps> = ({
  variant,
  children,
}) => {
  const styles = useMainLayoutStyles();
  const dispatch = useDispatch();
  useBackgroundReplacer(variant);
  useSetNetworkFromParam();
  useSyncMultiwalletNetwork();
  useWeb3Signatures();
  const { txHistoryOpened } = useSelector($transactionsData);
  const txsNeedsAction = useSelector($transactionsNeedsAction);
  const {
    status,
    account,
    walletConnected,
    deactivateConnector,
    symbol,
  } = useSelectedChainWallet();

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
      config: walletPickerModalConfig,
    };
    return options;
  }, [multiwalletChain, handleWalletPickerClose, pickerClasses, renNetwork]);

  const debugWallet = useWallet(multiwalletChain); //remove
  const debugMultiwallet = useMultiwallet(); //remove
  const debugNetworkName = useTestnetName();

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
    <MainLayout
      ToolbarMenu={ToolbarMenu}
      DrawerMenu={DrawerMenu}
      WalletMenu={WalletMenu}
    >
      {children}
      <Debug it={{ debugNetworkName, debugWallet, debugMultiwallet, env }} />
    </MainLayout>
  );
};
