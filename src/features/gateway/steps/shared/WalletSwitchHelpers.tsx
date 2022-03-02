import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
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
import { ActionButtonWrapper } from "../../../../components/buttons/Buttons";
import { WalletIcon } from "../../../../components/icons/RenIcons";
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
import {
  alterEthereumBaseChainsProviderSigner,
  ChainInstance,
  PartialChainInstanceMap,
} from "../../../chain/chainUtils";
import { $network } from "../../../network/networkSlice";
import { useWallet } from "../../../wallet/walletHooks";
import { setChain, setPickerOpened } from "../../../wallet/walletSlice";

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
};

export const SwitchWalletDialog: FunctionComponent<SwitchWalletDialogProps> = ({
  open,
  targetChain,
  onClose,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const styles = useSwitchWalletDialogStyles();
  const chainConfig = getChainConfig(targetChain);
  const { network } = useSelector($network);
  const networkConfig = getChainNetworkConfig(targetChain, network);
  const handleSwitch = useCallback(() => {
    dispatch(setChain(targetChain));
    dispatch(setPickerOpened(true));
  }, [dispatch, targetChain]);

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

export type OnAccountsInitiatedParams = {
  fromAccount: string;
  fromChain: ChainInstance;
  toAccount: string;
  toChain: ChainInstance;
};

type H2HTransactionType = "mint" | "release";

type H2HAccountsResolverProps = {
  transactionType: H2HTransactionType;
  chains: PartialChainInstanceMap | null;
  from: Chain;
  to: Chain;
  onResolved: (fromAccount: string, toAccount: string) => void;
  onInitiated: (params: OnAccountsInitiatedParams) => void;
  disabled?: boolean;
};

export const H2HAccountsResolver: FunctionComponent<
  H2HAccountsResolverProps
> = ({ transactionType, chains, from, to, disabled, onInitiated }) => {
  const fromChainConfig = getChainConfig(from);
  const toChainConfig = getChainConfig(to);
  const [differentAccounts, setDifferentAccounts] = useState(false);

  const handleAccountsModeChange = useCallback((event) => {
    setDifferentAccounts(event.target.checked);
  }, []);
  const { account: fromAccount, provider: fromProvider } = useWallet(from);
  const { account: toAccount, provider: toProvider } = useWallet(to);

  useEffect(() => {
    console.log("chains changed from", from);
    if (fromProvider && chains !== null) {
      alterEthereumBaseChainsProviderSigner(chains, fromProvider, true, from);
    }
  }, [from, chains, fromProvider]);

  useEffect(() => {
    console.log("chains changed to", to);
    if (toProvider && chains !== null) {
      alterEthereumBaseChainsProviderSigner(chains, toProvider, true, to);
    }
  }, [to, chains, toProvider]);

  const [cachedToAccount, setCachedToAccount] = useState(toAccount);
  const [cachedFromAccount, setCachedFromAccount] = useState(toAccount);

  useEffect(() => {
    if (fromAccount) {
      setCachedFromAccount(fromAccount);
    }
  }, [fromAccount]);

  useEffect(() => {
    if (toAccount) {
      setCachedToAccount(toAccount);
    }
  }, [toAccount]);

  let resolvedToAccount = cachedFromAccount;
  if (differentAccounts && cachedToAccount) {
    resolvedToAccount = cachedToAccount;
  }
  const [toPickerOpened, setToPickerOpened] = useState(false);
  const handleToPickerOpened = useCallback(() => {
    setToPickerOpened(true);
  }, []);

  const handleDone = () => {
    if (chains) {
      const fromChain = chains[from];
      const toChain = chains[to];
      if (fromChain && toChain) {
        onInitiated({
          fromAccount: cachedFromAccount,
          toAccount: cachedToAccount,
          fromChain,
          toChain,
        });
      }
    }
  };

  return (
    <>
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
        value={trimAddress(resolvedToAccount, 8)}
      />
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
      <Button onClick={handleDone}>Inner done</Button>
      <SwitchWalletDialog
        open={toPickerOpened && differentAccounts && !toAccount}
        targetChain={to}
      />
      <Debug
        it={{ fromAccount, cachedFromAccount, toAccount, cachedToAccount }}
      />
    </>
  );
};
