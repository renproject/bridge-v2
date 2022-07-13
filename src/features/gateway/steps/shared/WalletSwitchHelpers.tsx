import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { DialogProps } from "@material-ui/core/Dialog";
import { makeStyles } from "@material-ui/core/styles";
import { Asset, Chain } from "@renproject/chains";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../../components/formatting/NumberFormatText";
import {
  CustomSvgIconComponent,
  DeleteIcon,
  WalletIcon,
} from "../../../../components/icons/RenIcons";
import { OutlinedTextField } from "../../../../components/inputs/OutlinedTextField";
import { BigTopWrapper } from "../../../../components/layout/LayoutHelpers";
import {
  PaperContent,
  SpacedPaperContent,
} from "../../../../components/layout/Paper";
import { Link } from "../../../../components/links/Links";
import { BridgeModal } from "../../../../components/modals/BridgeModal";
import { InlineSkeleton } from "../../../../components/progress/ProgressHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { featureFlags } from "../../../../constants/featureFlags";
import { getAssetConfig } from "../../../../utils/assetsConfig";
import {
  getChainConfig,
  getChainNetworkConfig,
  isEthereumBaseChain,
  isSolanaBaseChain,
} from "../../../../utils/chainsConfig";
import { trimAddress } from "../../../../utils/strings";
import { alterContractChainProviderSigner } from "../../../chain/chainUtils";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import { $network } from "../../../network/networkSlice";
import { useWallet } from "../../../wallet/walletHooks";
import { setChain, setPickerOpened } from "../../../wallet/walletSlice";
import { FeesToggler } from "../../components/FeeHelpers";
import { GatewayFees } from "../../components/GatewayFees";
import {
  useAddressValidator,
  useGatewayFeesWithoutGateway,
} from "../../gatewayHooks";
import { GatewayPaperHeader } from "./GatewayNavigationHelpers";

type WalletConnectionActionButtonGuardProps = {
  chain: Chain;
};

export const WalletConnectionActionButtonGuard: FunctionComponent<
  WalletConnectionActionButtonGuardProps
> = ({ chain, children }) => {
  const dispatch = useDispatch();
  const { connected } = useWallet(chain);

  const handleConnect = useCallback(() => {
    dispatch(setPickerOpened(true));
  }, [dispatch]);

  if (connected) {
    return <>{children}</>;
  }
  const chainConfig = getChainConfig(chain);

  return (
    <ActionButton onClick={handleConnect}>
      Connect {chainConfig.fullName} Wallet
    </ActionButton>
  );
};

const useSwitchWalletDialogStyles = makeStyles((theme) => ({
  top: {
    marginBottom: 20,
    marginTop: 40,
  },
  iconWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 80,
    width: 124,
    height: 124,
    backgroundColor: theme.palette.divider,
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
}));

type SwitchWalletDialogProps = DialogProps & {
  targetChain: Chain;
  mode?: "switch" | "change";
  onClose?: () => void;
  disconnect?: () => void;
};

export const SwitchWalletDialog: FunctionComponent<SwitchWalletDialogProps> = ({
  open,
  targetChain,
  onClose,
  disconnect,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const styles = useSwitchWalletDialogStyles();
  const chainConfig = getChainConfig(targetChain);
  const { network } = useSelector($network);
  const networkConfig = getChainNetworkConfig(targetChain, network);
  const handleSwitch = useCallback(() => {
    if (disconnect) {
      disconnect();
    }
    dispatch(setChain(targetChain));
    dispatch(setPickerOpened(true));
  }, [dispatch, targetChain, disconnect]);

  return (
    <BridgeModal
      open={open}
      title={t("wallet.wallet-switch-title")}
      maxWidth="xs"
      onClose={onClose}
    >
      <SpacedPaperContent bottomPadding>
        <div className={styles.top}>
          <div className={styles.iconWrapper}>
            <div className={styles.icon}>
              <WalletIcon fontSize="inherit" />
            </div>
          </div>
        </div>
        <Typography variant="h5" align="center" gutterBottom>
          {t("wallet.wallet-switch-to", {
            chain: chainConfig.shortName,
            network: networkConfig.fullName,
          })}
        </Typography>
        <Typography
          variant="h6"
          color="textSecondary"
          align="center"
          gutterBottom
          component="div"
        >
          {t("wallet.wallet-switch-message", {
            chain: chainConfig.fullName,
            network: networkConfig.fullName,
          })}
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <Button color="primary" variant="text" onClick={handleSwitch}>
            {t("wallet.wallet-switch-label")}
          </Button>
        </ActionButtonWrapper>
      </PaperContent>
    </BridgeModal>
  );
};

type H2HTransactionType = "mint" | "release";

type H2HAccountsResolverProps = {
  transactionType: H2HTransactionType;
  from: Chain;
  to: Chain;
  onResolved: (fromAccount: string, toAccount: string) => void;
  disabled?: boolean;
};

const useAccountWrapperStyles = makeStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 20,
    padding: `11px 16px`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    height: 32,
    fontSize: 32,
  },
  container: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
}));

type AccountWrapperProps = {
  chain: Chain;
  label: string;
  onClick?: () => void;
  amount?: string | null;
  AssetIcon?: CustomSvgIconComponent;
  assetIconTooltip?: string;
};

export const AccountWrapper: FunctionComponent<AccountWrapperProps> = ({
  chain,
  label,
  children,
  amount = "",
  AssetIcon = null,
  assetIconTooltip = "",
}) => {
  const styles = useAccountWrapperStyles();
  const { Icon } = getChainConfig(chain);
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <Tooltip title={chain}>
          <div className={styles.icon}>
            <Icon fontSize="inherit" />
          </div>
        </Tooltip>
        <Typography variant="caption" color="textPrimary" component="div">
          {label}
        </Typography>
      </div>
      {AssetIcon && (
        <div className={styles.container}>
          {amount === null ? (
            <InlineSkeleton width={40} />
          ) : (
            <NumberFormatText value={amount} />
          )}
          <Tooltip title={assetIconTooltip}>
            <div className={styles.icon}>
              <AssetIcon fontSize="inherit" />
            </div>
          </Tooltip>
        </div>
      )}
      {!AssetIcon && (
        <Typography variant="caption" color="textSecondary">
          {children}
        </Typography>
      )}
    </div>
  );
};

type SendingReceivingWrapperProps = {
  from: Chain;
  amount: string | null;
  SendIcon: CustomSvgIconComponent;
  sendIconTooltip: string;
  to: Chain;
  outputAmount: string | null;
  ReceiveIcon: CustomSvgIconComponent;
  receiveIconTooltip: string;
};

export const SendingReceivingWrapper: FunctionComponent<
  SendingReceivingWrapperProps
> = ({
  from,
  amount,
  SendIcon,
  sendIconTooltip,
  to,
  outputAmount,
  ReceiveIcon,
  receiveIconTooltip,
}) => {
  return (
    <>
      <AccountWrapper
        chain={from}
        label="Sending"
        amount={amount}
        AssetIcon={SendIcon}
        assetIconTooltip={sendIconTooltip}
      />
      <AccountWrapper
        chain={to}
        label="Receiving"
        amount={outputAmount}
        AssetIcon={ReceiveIcon}
        assetIconTooltip={receiveIconTooltip}
      />
    </>
  );
};

type ManualAddressInputProps = {};

export const ManualAddressInput: FunctionComponent<
  ManualAddressInputProps
> = () => {
  return null;
};

export const H2HAccountsResolver: FunctionComponent<
  H2HAccountsResolverProps
> = ({ transactionType, from, to, disabled, onResolved }) => {
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const amount = params.get("amount") || "";
  const asset = params.get("asset") || "";
  const fees = useGatewayFeesWithoutGateway(asset as Asset, from, to, amount);
  const { outputAmount } = fees;
  const { Icon, RenIcon } = getAssetConfig(asset);
  let SendIcon, ReceiveIcon;
  let sendIconTooltip, receiveIconTooltip;
  if (transactionType === "mint") {
    SendIcon = Icon;
    ReceiveIcon = RenIcon;
    sendIconTooltip = asset;
    receiveIconTooltip = `ren${asset}`;
  } else {
    SendIcon = RenIcon;
    ReceiveIcon = Icon;
    sendIconTooltip = `ren${asset}`;
    receiveIconTooltip = asset;
  }

  const isFromEthereumBaseChain = isEthereumBaseChain(from);
  const isFromSolanaBaseChain = isSolanaBaseChain(from);
  const isToEthereumBaseChain = isEthereumBaseChain(to);
  const isToSolanaBaseChain = isSolanaBaseChain(to);

  const isCrossContractBaseChain =
    isFromEthereumBaseChain !== isToEthereumBaseChain ||
    isFromSolanaBaseChain !== isToSolanaBaseChain;

  const [showSwitchWalletDialog, setShowSwitchWalletDialog] =
    useState<boolean>(false);
  // const styles = useH2HAccountsResolverStyles();
  const allChains = useCurrentNetworkChains();
  // const fromChainConfig = getChainConfig(from);
  // const toChainConfig = getChainConfig(to);
  const showDifferentAccountSwitcher = !isCrossContractBaseChain;
  const [differentAccounts, setDifferentAccounts] = useState(
    isCrossContractBaseChain
  );
  const [customAccountMode, setCustomAccountMode] = useState(false);
  const handleCustomAccountModeChange = useCallback((event) => {
    setCustomAccountMode(event.target.checked);
  }, []);
  // const [customAccount, setCustomAccount] = useState("");

  const handleAccountsModeChange = useCallback((event) => {
    setDifferentAccounts(event.target.checked);
  }, []);
  const { account: fromAccount, provider: fromProvider } = useWallet(from);
  const {
    account: toAccount,
    provider: toProvider,
    deactivateConnector: deactivateTo,
  } = useWallet(to);

  useEffect(() => {
    console.info("chains changed from", from);
    if (fromProvider) {
      alterContractChainProviderSigner(allChains, from, fromProvider);
    }
  }, [from, allChains, fromProvider]);

  useEffect(() => {
    console.info("chains changed to", to);
    if (toProvider) {
      alterContractChainProviderSigner(allChains, to, toProvider);
      // alterEthereumBaseChainProviderSigner(allChains, to, toProvider);
    }
  }, [to, allChains, toProvider]);

  const [cachedFromAccount, setCachedFromAccount] = useState(fromAccount);
  const [cachedToAccount, setCachedToAccount] = useState(toAccount);

  const handleCustomAccountChange = useCallback((event) => {
    setCachedToAccount(event.target.value);
    // setCustomAccount(event.target.value);
  }, []);
  const { validateAddress } = useAddressValidator(to);
  const isAddressValid = validateAddress(cachedToAccount);
  const hasAddressError = !isAddressValid;
  const showAddressError = Boolean(cachedToAccount) && hasAddressError;

  useEffect(() => {
    setCachedFromAccount(fromAccount);
  }, [fromAccount]);

  useEffect(() => {
    const newToAccount = differentAccounts ? toAccount : fromAccount;
    setCachedToAccount(newToAccount);
  }, [toAccount, fromAccount, differentAccounts, customAccountMode]);

  const [toPickerOpened, setToPickerOpened] = useState(false);
  const handleToPickerOpened = useCallback(() => {
    deactivateTo();
    setToPickerOpened(true);
  }, [deactivateTo]);

  useEffect(() => {
    setToPickerOpened(false);
  }, [toAccount]);

  useEffect(() => {
    setShowSwitchWalletDialog(!cachedFromAccount);
  }, [cachedFromAccount]);

  const handleResolved = useCallback(() => {
    onResolved(cachedFromAccount, cachedToAccount);
  }, [onResolved, cachedFromAccount, cachedToAccount]);

  // const theme = useTheme();
  return (
    <>
      <GatewayPaperHeader title={"Choose Accounts"} />
      <PaperContent bottomPadding topPadding>
        <SendingReceivingWrapper
          from={from}
          to={to}
          amount={amount}
          outputAmount={outputAmount || ""}
          SendIcon={SendIcon}
          ReceiveIcon={ReceiveIcon}
          sendIconTooltip={sendIconTooltip}
          receiveIconTooltip={receiveIconTooltip}
        />
        <BigTopWrapper>
          {cachedFromAccount ? (
            <>
              <AccountWrapper chain={from} label="Sender Address">
                {trimAddress(cachedFromAccount, 5)}
              </AccountWrapper>
              {!customAccountMode && (
                <AccountWrapper chain={to} label="Recipient Address">
                  {differentAccounts && cachedToAccount && (
                    <IconButton
                      onClick={handleToPickerOpened}
                      title="Pick new wallet/account"
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  )}
                  {trimAddress(cachedToAccount, 5)}
                  {differentAccounts && !cachedToAccount && (
                    <Link
                      color="primary"
                      underline="hover"
                      variant="caption"
                      onClick={handleToPickerOpened}
                    >
                      Choose account
                    </Link>
                  )}
                </AccountWrapper>
              )}
              {customAccountMode && (
                <OutlinedTextField
                  label="Recipient address"
                  value={cachedToAccount}
                  onChange={handleCustomAccountChange}
                  error={showAddressError}
                  helperText={
                    showAddressError ? "Address is invalid" : undefined
                  }
                />
              )}
              {featureFlags.customRecipient && differentAccounts && (
                <>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={customAccountMode}
                          onChange={handleCustomAccountModeChange}
                          name="primary"
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="caption">
                          I will enter recipient address manually
                        </Typography>
                      }
                    />
                  </Box>
                </>
              )}
              {showDifferentAccountSwitcher && (
                <Box display="flex" alignItems="center" justifyContent="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={differentAccounts}
                        onChange={handleAccountsModeChange}
                        name="primary"
                        color="primary"
                      />
                    }
                    disabled={disabled}
                    label={
                      <Typography variant="caption">
                        I want to transfer to a different account
                      </Typography>
                    }
                  />
                </Box>
              )}
            </>
          ) : (
            <SwitchWalletDialog
              open={showSwitchWalletDialog}
              targetChain={from}
              onClose={() => {
                setShowSwitchWalletDialog(false);
              }}
            />
          )}
        </BigTopWrapper>
        <SwitchWalletDialog
          open={toPickerOpened && differentAccounts}
          targetChain={to}
          disconnect={deactivateTo}
          onClose={() => {
            setToPickerOpened(false);
          }}
        />
      </PaperContent>
      <Divider />
      <PaperContent darker topPadding bottomPadding>
        <FeesToggler>
          <GatewayFees asset={asset as Asset} from={from} to={to} {...fees} />
        </FeesToggler>
        <ActionButtonWrapper>
          <ActionButton
            onClick={handleResolved}
            disabled={!cachedToAccount || !cachedFromAccount || hasAddressError}
          >
            {cachedFromAccount ? "Accept Accounts" : "Connect a Wallet"}
          </ActionButton>
        </ActionButtonWrapper>
        <Debug
          it={{ fromAccount, cachedFromAccount, toAccount, cachedToAccount }}
        />
      </PaperContent>
    </>
  );
};
