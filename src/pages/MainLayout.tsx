import {
  Button,
  Divider,
  Drawer,
  Fab,
  ListItem,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import { styled } from "@material-ui/core/styles";
import { Feedback } from "@material-ui/icons";
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
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useWindowSize } from "react-use";
import { TransactionHistoryMenuIconButton } from "../components/buttons/Buttons";
import { RenBridgeLogoIcon } from "../components/icons/RenIcons";
import { Footer } from "../components/layout/Footer";
import {
  MainLayoutVariantProps,
  MobileLayout,
  useMobileLayoutStyles,
} from "../components/layout/MobileLayout";
import { externalLinkAttributes } from "../components/links/Links";
import { Debug } from "../components/utils/Debug";
import {
  useWalletPickerStyles,
  WalletChainLabel,
  WalletConnectingInfo,
  WalletConnectionStatusButton,
  WalletEntryButton,
  WalletWrongNetworkInfo,
} from "../components/wallet/WalletHelpers";
import { links } from "../constants/constants";
import { env } from "../constants/environmentVariables";
import { LanguageSelector } from "../features/i18n/components/I18nHelpers";
import { $renNetwork } from "../features/network/networkSlice";
import { useSetNetworkFromParam } from "../features/network/networkUtils";
import { MintTransactionHistory } from "../features/transactions/MintTransactionHistory";
import {
  $transactionsData,
  setTxHistoryOpened,
} from "../features/transactions/transactionsSlice";
import { useSubNetworkName } from "../features/ui/uiHooks";
import {
  useSelectedChainWallet,
  useSyncMultiwalletNetwork,
  useWallet,
} from "../features/wallet/walletHooks";
import {
  $multiwalletChain,
  $walletPickerOpened,
  setWalletPickerOpened,
} from "../features/wallet/walletSlice";
import {
  renNetworkToEthNetwork,
  walletPickerModalConfig,
} from "../providers/multiwallet/Multiwallet";

export const MainLayout: FunctionComponent<MainLayoutVariantProps> = ({
  children,
}) => {
  const styles = useMobileLayoutStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  useSetNetworkFromParam();
  useSyncMultiwalletNetwork();
  const {
    status,
    account,
    walletConnected,
    deactivateConnector,
    symbol,
  } = useSelectedChainWallet();
  const { txHistoryOpened } = useSelector($transactionsData);

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

  const ToolbarMenu = (
    <>
      <div className={styles.desktopMenu}>
        <LanguageSelector
          mode="dialog"
          buttonClassName={styles.desktopLanguage}
        />
        <TransactionHistoryMenuIconButton
          opened={txHistoryOpened}
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
          />
          <span>{t("menu.viewTransactions")}</span>
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
    </Menu>
  );
  return (
    <MobileLayout
      ToolbarMenu={ToolbarMenu}
      DrawerMenu={DrawerMenu}
      WalletMenu={WalletMenu}
    >
      {children}
      <MintTransactionHistory />
      <Debug
        it={{
          debugNetworkName,
          debugWallet,
          debugMultiwallet,
          env,
        }}
      />
    </MobileLayout>
  );
};

export const IssueFab = styled(Fab)({
  position: "fixed",
  right: 30,
  bottom: 20,
});

export const ConnectedMainLayout: FunctionComponent = ({ children }) => (
  <MultiwalletProvider>
    <MainLayout>{children}</MainLayout>
    <IssueFab
      size="small"
      color="primary"
      href={links.BUGS_LOG}
      title="Report an issue"
      {...externalLinkAttributes}
    >
      <Feedback fontSize="small" />
    </IssueFab>
  </MultiwalletProvider>
);
