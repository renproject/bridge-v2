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
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useWindowSize } from "react-use";
import { ClosableMenuIconButton } from "../components/buttons/Buttons";
import { RenBridgeLogoIcon, TxHistoryIcon } from "../components/icons/RenIcons";
import { Footer } from "../components/layout/Footer";
import {
  MainLayoutVariantProps,
  MobileLayout,
  useMobileLayoutStyles,
} from "../components/layout/MobileLayout";
import { Debug } from "../components/utils/Debug";
import { env } from "../constants/environmentVariables";
import { LanguageSelector } from "../features/i18n/components/I18nHelpers";
import { useSetNetworkFromParam } from "../features/network/networkHooks";
import { $network } from "../features/network/networkSlice";
import {
  IssuesResolver,
  IssuesResolverButton,
} from "../features/transactions/IssuesResolver";
import { TransactionRecovery } from "../features/transactions/TransactionRecovery";
import { TransactionsHistory } from "../features/transactions/TransactionsHistory";
import {
  $txHistory,
  setTxHistoryOpened,
} from "../features/transactions/transactionsSlice";
import { $ui } from "../features/ui/uiSlice";
import {
  useWalletPickerStyles,
  WalletChainLabel,
  WalletConnectingInfo,
  WalletConnectionStatusButton,
  WalletEntryButton,
  WalletWrongNetworkInfo,
} from "../features/wallet/components/WalletHelpers";
import {
  useDirtySolanaWalletDetector,
  useSyncWalletNetwork,
  useWallet,
} from "../features/wallet/walletHooks";
import { $wallet, setPickerOpened } from "../features/wallet/walletSlice";
import { getMultiwalletConfig } from "../providers/multiwallet/multiwalletConfig";
import { Wallet } from "../utils/walletsConfig";

export const MainLayout: FunctionComponent<MainLayoutVariantProps> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const styles = useMobileLayoutStyles();
  const pickerClasses = useWalletPickerStyles();
  useSetNetworkFromParam();
  useSyncWalletNetwork();
  const { network } = useSelector($network);
  const { chain, pickerOpened } = useSelector($wallet);
  const multiwallet = useWallet(chain);
  (window as any).multiwallet = multiwallet;
  const {
    status,
    account,
    connected,
    deactivateConnector,
    refreshConnector,
    wallet,
  } = multiwallet;

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

  const { dialogOpened: txHistoryOpened, showConnectedTxs } =
    useSelector($txHistory);
  const { walletButtonHoisted } = useSelector($ui);
  const handleTxHistoryToggle = useCallback(() => {
    dispatch(setTxHistoryOpened(!txHistoryOpened));
  }, [dispatch, txHistoryOpened]);

  const [walletMenuAnchor, setWalletMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const handleWalletPickerClose = useCallback(() => {
    dispatch(setPickerOpened(false));
  }, [dispatch]);
  const handleWalletMenuClose = useCallback(() => {
    setWalletMenuAnchor(null);
  }, []);

  const handleWalletButtonClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (connected) {
        setWalletMenuAnchor(event.currentTarget);
      } else {
        dispatch(setPickerOpened(true));
      }
    },
    [dispatch, connected]
  );

  const handleDisconnectWallet = useCallback(() => {
    deactivateConnector();
    handleWalletMenuClose();
  }, [deactivateConnector, handleWalletMenuClose]);

  const handleRefreshAccounts = useCallback(() => {
    refreshConnector();
    handleWalletMenuClose();
  }, [refreshConnector, handleWalletMenuClose]);

  const found = useDirtySolanaWalletDetector();
  const walletPickerOptions = useMemo(() => {
    const options: WalletPickerProps<any, any> = {
      targetNetwork: network,
      chain,
      onClose: handleWalletPickerClose,
      pickerClasses,
      // DefaultInfo: DebugComponentProps,
      ConnectingInfo: WalletConnectingInfo,
      WrongNetworkInfo: WalletWrongNetworkInfo,
      WalletEntryButton,
      WalletChainLabel,
      config: getMultiwalletConfig(network, found),
      connectingTitle: t("wallet.connecting"),
      wrongNetworkTitle: t("wallet.wrong-network-title"),
      connectWalletTitle: t("wallet.connect-wallet"),
    };
    return options;
  }, [t, pickerClasses, handleWalletPickerClose, network, chain, found]);

  // const debugWallet = useWallet(multiwalletChain); //remove
  // const debugMultiwallet = useMultiwallet(); //remove
  // const debugNetworkName = useSubNetworkName();

  const ToolbarMenu = (
    <>
      <div className={styles.desktopMenu}>
        <LanguageSelector
          mode="dialog"
          buttonClassName={styles.desktopLanguage}
        />
        <ClosableMenuIconButton
          Icon={TxHistoryIcon}
          opened={txHistoryOpened}
          className={styles.desktopTxHistory}
          onClick={handleTxHistoryToggle}
          title="Transaction History"
        />
        <WalletConnectionStatusButton
          onClick={handleWalletButtonClick}
          hoisted={(txHistoryOpened && showConnectedTxs) || walletButtonHoisted}
          status={status}
          account={account}
          wallet={wallet}
          chain={chain}
        />
        <WalletPickerModal open={pickerOpened} options={walletPickerOptions} />
      </div>
      <div className={styles.mobileMenu}>
        <IconButton
          aria-label="show more"
          aria-controls="main-menu-mobile"
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
      id="main-menu-mobile"
      anchor="right"
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
          wallet={wallet}
          chain={chain}
        />
      </ListItem>
      <ListItem
        divider
        className={styles.drawerListItem}
        button
        onClick={handleTxHistoryToggle}
      >
        <Button className={styles.mobileMenuButton} component="div">
          <ClosableMenuIconButton
            Icon={TxHistoryIcon}
            className={styles.mobileTxHistory}
          />
          <span>{t("menu.view-transactions-label")}</span>
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
        <Typography color="error">{t("wallet.disconnect")}</Typography>
      </MenuItem>
      {wallet === Wallet.Phantom && (
        <MenuItem onClick={handleRefreshAccounts}>
          <Typography>Refresh accounts</Typography>
        </MenuItem>
      )}
    </Menu>
  );
  return (
    <MobileLayout
      ToolbarMenu={ToolbarMenu}
      DrawerMenu={DrawerMenu}
      WalletMenu={WalletMenu}
    >
      {children}
      <TransactionsHistory />
      <IssuesResolver />
      <IssuesResolverButton mode="fab" />
      {/*<TransactionRecoveryButton />*/}
      <TransactionRecovery />
      <Debug
        it={{
          // debugNetworkName,
          // debugWallet,
          // debugMultiwallet,
          env,
        }}
      />
    </MobileLayout>
  );
};

export const ConnectedMainLayout: FunctionComponent = ({ children }) => {
  return (
    <MultiwalletProvider>
      <MainLayout>{children}</MainLayout>
    </MultiwalletProvider>
  );
};
