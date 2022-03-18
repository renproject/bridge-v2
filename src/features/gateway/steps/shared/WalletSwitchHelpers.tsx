import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Typography,
} from "@material-ui/core";
import { DialogProps } from "@material-ui/core/Dialog";
import { makeStyles } from "@material-ui/core/styles";
import { Chain } from "@renproject/chains";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { DeleteIcon, WalletIcon } from "../../../../components/icons/RenIcons";
import {
  PaperContent,
  SpacedPaperContent,
} from "../../../../components/layout/Paper";
import { BridgeModal } from "../../../../components/modals/BridgeModal";
import { TooltipWithIcon } from "../../../../components/tooltips/TooltipWithIcon";
import { LabelWithValue } from "../../../../components/typography/TypographyHelpers";
import { Debug } from "../../../../components/utils/Debug";
import {
  getChainConfig,
  getChainNetworkConfig,
} from "../../../../utils/chainsConfig";
import { trimAddress } from "../../../../utils/strings";
import { alterEthereumBaseChainProviderSigner } from "../../../chain/chainUtils";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import { $network } from "../../../network/networkSlice";
import { useWallet } from "../../../wallet/walletHooks";
import { setChain, setPickerOpened } from "../../../wallet/walletSlice";
import { GatewayPaperHeader } from "./GatewayNavigationHelpers";

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

export const H2HAccountsResolver: FunctionComponent<
  H2HAccountsResolverProps
> = ({ transactionType, from, to, disabled, onResolved }) => {
  const allChains = useCurrentNetworkChains();
  const fromChainConfig = getChainConfig(from);
  const toChainConfig = getChainConfig(to);
  const [differentAccounts, setDifferentAccounts] = useState(false);

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
    console.log("chains changed from", from);
    if (fromProvider) {
      alterEthereumBaseChainProviderSigner(allChains, from, fromProvider);
    }
  }, [from, allChains, fromProvider]);

  useEffect(() => {
    console.log("chains changed to", to);
    if (toProvider) {
      alterEthereumBaseChainProviderSigner(allChains, to, toProvider);
    }
  }, [to, allChains, toProvider]);

  const [cachedToAccount, setCachedToAccount] = useState(toAccount);
  const [cachedFromAccount, setCachedFromAccount] = useState(toAccount);

  useEffect(() => {
    if (fromAccount) {
      setCachedFromAccount(fromAccount);
    }
  }, [fromAccount]);

  useEffect(() => {
    const newToAccount = differentAccounts ? toAccount : fromAccount;
    setCachedToAccount(newToAccount);
  }, [toAccount, fromAccount, differentAccounts]);

  const [toPickerOpened, setToPickerOpened] = useState(false);
  const handleToPickerOpened = useCallback(() => {
    deactivateTo();
    setToPickerOpened(true);
  }, [deactivateTo]);

  useEffect(() => {
    setToPickerOpened(false);
  }, [toAccount]);

  const handleResolved = useCallback(() => {
    onResolved(cachedFromAccount, cachedToAccount);
  }, [onResolved, cachedFromAccount, cachedToAccount]);

  return (
    <>
      <GatewayPaperHeader title={"Choose accounts"} />
      <PaperContent bottomPadding>
        <Box mt={3} mb={3}>
          <Typography variant="h6" align="center">
            Choose which accounts are you going to use for{" "}
            {transactionType === "mint" ? "Mint" : "Release"} transaction
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
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
                I want to transfer between different accounts{" "}
                <TooltipWithIcon
                  title={`I will use different accounts for ${fromChainConfig.fullName} and ${toChainConfig.fullName} wallets.`}
                />
              </Typography>
            }
          />
        </Box>
        {cachedFromAccount ? (
          <LabelWithValue
            label={`From ${fromChainConfig.shortName}:`}
            value={trimAddress(cachedFromAccount, 8)}
          />
        ) : (
          <SwitchWalletDialog open={!cachedFromAccount} targetChain={from} />
        )}
        <LabelWithValue
          label={`${transactionType === "mint" ? `Mint` : "Release"} to ${
            toChainConfig.shortName
          }:`}
          value={
            <>
              {differentAccounts && cachedToAccount && (
                <IconButton
                  onClick={handleToPickerOpened}
                  title="Pick new wallet/account"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
              {trimAddress(cachedToAccount, 8)}
              {differentAccounts && !cachedToAccount && (
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  onClick={handleToPickerOpened}
                >
                  Choose {toChainConfig.shortName} account
                </Button>
              )}
            </>
          }
        />
        <SwitchWalletDialog
          open={toPickerOpened && differentAccounts}
          targetChain={to}
          disconnect={deactivateTo}
        />
        <ActionButtonWrapper>
          <ActionButton
            onClick={handleResolved}
            disabled={!cachedToAccount || !cachedFromAccount}
          >
            Accept Accounts
          </ActionButton>
        </ActionButtonWrapper>
        <Debug
          it={{ fromAccount, cachedFromAccount, toAccount, cachedToAccount }}
        />
      </PaperContent>
    </>
  );
};
