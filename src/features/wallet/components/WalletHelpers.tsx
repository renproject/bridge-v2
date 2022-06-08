import Davatar from "@davatar/react";
import {
  Box,
  Button,
  ButtonProps,
  Fade,
  FormHelperText,
  Theme,
  Typography,
  useTheme,
} from "@material-ui/core";
import { makeStyles, styled } from "@material-ui/core/styles";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { Asset, Chain } from "@renproject/chains";
import { WalletPickerProps } from "@renproject/multiwallet-ui";
import { RenNetwork } from "@renproject/utils";
import classNames from "classnames";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { TFunction, Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useTimeout } from "react-use";
import {
  ActionButton,
  ActionButtonWrapper,
  SecondaryActionButton,
} from "../../../components/buttons/Buttons";
import { WalletIcon } from "../../../components/icons/RenIcons";
import {
  CenteringSpacedBox,
  PaperSpacerWrapper,
} from "../../../components/layout/LayoutHelpers";
import {
  PaperContent,
  SpacedPaperContent,
} from "../../../components/layout/Paper";
import { Link } from "../../../components/links/Links";
import { BridgeModalTitle } from "../../../components/modals/BridgeModal";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../../../components/progress/ProgressHelpers";
import { Debug } from "../../../components/utils/Debug";
import { createPulseAnimation } from "../../../theme/animationUtils";
import { defaultShadow } from "../../../theme/other";
import {
  getChainConfig,
  getChainNetworkConfig,
  isEthereumBaseChain,
} from "../../../utils/chainsConfig";
import { trimAddress } from "../../../utils/strings";
import { getWalletConfig, Wallet } from "../../../utils/walletsConfig";
import { WarningDialog } from "../../transactions/components/TransactionsHelpers";
import { setWalletButtonHoisted } from "../../ui/uiSlice";
import { useEns, useSwitchChainHelpers, useWallet } from "../walletHooks";
// import { useSelectedChainWallet, useSwitchChainHelpers } from "../walletHooks";
import {
  $screening,
  setPickerOpened,
  setScreeningWarningOpened,
} from "../walletSlice";
import { WalletStatus } from "../walletUtils";

export const useWalletPickerStyles = makeStyles((theme) => ({
  root: {
    width: 400,
    minHeight: 441,
  },
  body: {
    padding: 24,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: `16px 16px 14px`,
  },
  headerTitle: {
    flexGrow: 2,
    paddingLeft: 16,
    textAlign: "center",
    lineHeight: 2,
  },
  headerCloseIcon: {
    fontSize: 16,
  },
  button: {
    border: `1px solid ${theme.palette.divider}`,
  },
  chainTitle: {
    textTransform: "capitalize",
    fontSize: 14,
  },
}));

const useWalletEntryButtonStyles = makeStyles({
  root: {
    marginTop: 20,
    fontSize: 16,
    padding: "11px 20px 11px 20px",
  },
  label: {
    display: "flex",
    justifyContent: "space-between",
    alignContent: "center",
  },
  icon: {
    fontSize: 36,
    display: "inline-flex",
  },
});

export const WalletEntryButton: WalletPickerProps<
  any,
  any
>["WalletEntryButton"] = ({ onClick, name, logo }) => {
  const { icon: iconClassName, ...classes } = useWalletEntryButtonStyles();
  const walletConfig = getWalletConfig(name as Wallet);
  const { Icon } = walletConfig;
  return (
    <Button
      classes={classes}
      variant="outlined"
      size="large"
      fullWidth
      onClick={onClick}
    >
      <span>{walletConfig.fullName}</span>{" "}
      <span className={iconClassName}>
        <Icon fontSize="inherit" />
      </span>
    </Button>
  );
};

export const WalletChainLabel: WalletPickerProps<
  any,
  any
>["WalletChainLabel"] = ({ chain }) => {
  const chainConfig = getChainConfig(chain as Chain);
  return <span>{chainConfig.fullName}</span>;
};

export const WalletConnectingInfo: WalletPickerProps<
  any,
  any
>["ConnectingInfo"] = ({ chain, name, onClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const chainConfig = getChainConfig(chain as Chain);

  const walletConfig = getWalletConfig(name as Wallet);

  const { Icon } = walletConfig;
  const [isPassed] = useTimeout(3000);
  const passed = isPassed();
  return (
    <>
      <Debug it={{ chainConfig }} />
      <BridgeModalTitle
        title={
          passed
            ? t("wallet.action-required", {
                wallet: walletConfig.shortName,
              })
            : t("wallet.action-connecting")
        }
        onClose={onClose}
      />
      <PaperContent bottomPadding>
        <ProgressWrapper>
          <ProgressWithContent
            size={128}
            color={theme.customColors.skyBlueLight}
            fontSize="big"
            processing
          >
            <Icon fontSize="inherit" />
          </ProgressWithContent>
        </ProgressWrapper>
        <Typography variant="h6" align="center">
          {passed
            ? t("wallet.action-connect-message", {
                wallet: walletConfig.fullName,
              })
            : t("wallet.action-connecting-to", {
                chain: chainConfig.fullName,
              })}
        </Typography>
      </PaperContent>
    </>
  );
};

const useWalletConnectionProgressStyles = makeStyles((theme) => ({
  iconWrapper: {
    borderRadius: "50%",
    padding: 13,
    backgroundColor: theme.palette.divider,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 44,
  },
}));

export const WalletConnectionProgress: FunctionComponent = () => {
  const theme = useTheme();
  const styles = useWalletConnectionProgressStyles();
  return (
    <ProgressWithContent color={theme.customColors.redLighter} size={128}>
      <div className={styles.iconWrapper}>
        <WalletIcon fontSize="inherit" color="secondary" />
      </div>
    </ProgressWithContent>
  );
};

export const WalletWrongNetworkInfo: WalletPickerProps<
  any,
  any
>["WrongNetworkInfo"] = ({ chain, targetNetwork, onClose }) => {
  console.info(chain, targetNetwork);
  const { t } = useTranslation();
  const theme = useTheme();

  const networkKindName =
    (targetNetwork as RenNetwork) === RenNetwork.Mainnet
      ? "Mainnet"
      : "Testnet";
  const networkConfig = getChainNetworkConfig(
    chain as Chain,
    targetNetwork as RenNetwork
  );
  const subNetworkName = networkConfig.fullName;
  const chainConfig = getChainConfig(chain as Chain);

  const { provider } = useWallet(chain as Chain);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<any>(false);
  const { addOrSwitchChain } = useSwitchChainHelpers(
    chain as Chain,
    targetNetwork as RenNetwork,
    provider
  );
  const [success, setSuccess] = useState(false);
  const handleSwitch = useCallback(() => {
    if (addOrSwitchChain !== null) {
      setError(false);
      setPending(true);
      addOrSwitchChain()
        .then(() => {
          setError(false);
          setSuccess(true);
        })
        .catch((error: any) => {
          setError(error);
        })
        .finally(() => {
          setPending(false);
        });
    }
  }, [addOrSwitchChain]);

  return (
    <>
      <BridgeModalTitle
        title={t("wallet.wrong-network-title")}
        onClose={onClose}
      />
      <PaperContent bottomPadding>
        <ProgressWrapper>
          <ProgressWithContent
            size={128}
            color={theme.customColors.redLighter}
            fontSize="big"
          >
            <AccountBalanceWalletIcon fontSize="inherit" color="secondary" />
          </ProgressWithContent>
        </ProgressWrapper>
        <Typography variant="h5" align="center" gutterBottom>
          {t("wallet.network-switch-label")} {chainConfig.fullName}{" "}
          {networkKindName}
          {subNetworkName && <span> ({subNetworkName})</span>}
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary">
          {t("wallet.network-switch-description")} {chainConfig.fullName}{" "}
          {networkKindName} ({subNetworkName})
        </Typography>
        <Box mt={2}>
          {addOrSwitchChain !== null && (
            <div>
              <Box minHeight={19}>
                <Fade in={pending || Boolean(error)} timeout={{ enter: 2000 }}>
                  <Box textAlign="center">
                    {pending && (
                      <CenteredFormHelperText>
                        {t("wallet.network-switching-message", {
                          wallet: "MetaMask",
                        })}
                      </CenteredFormHelperText>
                    )}
                    {Boolean(error) && (
                      <CenteredFormHelperText error>
                        {error.code === 4001 &&
                          t("wallet.operation-safely-rejected-message")}
                        {error.code === -32002 &&
                          t("wallet.operation-not-finished-message")}
                        {error.code === -32601 &&
                          t("wallet.switching-network-not-supported-message")}
                      </CenteredFormHelperText>
                    )}
                    <Debug it={{ error }} />
                  </Box>
                </Fade>
              </Box>
              <ActionButton
                onClick={handleSwitch}
                disabled={pending || success}
              >
                {pending || success
                  ? t("wallet.network-switching-label", {
                      network: subNetworkName || networkKindName,
                      wallet: "MetaMask",
                    })
                  : t("wallet.network-switch-label", {
                      network: subNetworkName || networkKindName,
                    })}
              </ActionButton>
            </div>
          )}
        </Box>
      </PaperContent>
    </>
  );
};

const CenteredFormHelperText = styled(FormHelperText)({
  textAlign: "center",
});

export const createIndicatorClass = (className: string, color: string) => {
  const { pulsingStyles, pulsingKeyframes } = createPulseAnimation(
    color,
    3,
    className
  );

  return {
    ...pulsingKeyframes,
    [className]: {
      ...pulsingStyles,
      backgroundColor: color,
    },
  };
};

type WalletConnectionIndicatorStyles = Record<
  "root" | "connected" | "disconnected" | "wrongNetwork" | "connecting",
  string
>;
const useWalletConnectionIndicatorStyles = makeStyles((theme) => {
  return {
    root: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.palette.divider,
    },
    ...createIndicatorClass("connected", theme.palette.success.main),
    ...createIndicatorClass("disconnected", theme.palette.error.main),
    ...createIndicatorClass("connecting", theme.palette.info.main),
    ...createIndicatorClass("wrongNetwork", theme.palette.warning.main),
  };
});

type WalletConnectionIndicatorProps = {
  status?: WalletStatus;
  className?: string; // TODO: find a better way
};

export const WalletConnectionIndicator: FunctionComponent<
  WalletConnectionIndicatorProps
> = ({ status, className: classNameProp }) => {
  const styles =
    useWalletConnectionIndicatorStyles() as WalletConnectionIndicatorStyles;
  const className = classNames(styles.root, classNameProp, {
    [styles.connected]: status === WalletStatus.Connected,
    [styles.wrongNetwork]: status === WalletStatus.WrongNetwork,
    [styles.disconnected]: status === WalletStatus.Disconnected,
    [styles.connecting]: status === WalletStatus.Connecting,
  });
  return <div className={className} />;
};

const getWalletConnectionLabel = (status: WalletStatus, t: TFunction) => {
  switch (status) {
    case "disconnected":
      return t("wallet.connect-wallet");
    case "connecting":
      return t("wallet.connecting");
    case "connected":
      return t("wallet.connected");
    case "wrong_network":
      return t("wallet.wrong-network");
  }
};

const useWalletConnectionStatusButtonStyles = makeStyles<Theme>((theme) => ({
  root: {
    backgroundColor: theme.palette.common.white,
    borderColor: theme.palette.divider,
    boxShadow: defaultShadow,
    "&:hover": {
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.divider,
    },
  },
  hoisted: {
    zIndex: theme.zIndex.tooltip,
  },
  indicator: {
    marginRight: 10,
  },
  indicatorMobile: {
    marginLeft: 16,
    marginRight: 30,
  },
  account: {
    marginLeft: 10,
    marginRight: 10,
    paddingLeft: 10,
    borderLeft: "1px solid #DBE0E8",
  },
}));

type WalletConnectionStatusButtonProps = ButtonProps & {
  status: WalletStatus;
  wallet: Wallet;
  chain: Chain;
  hoisted?: boolean;
  account?: string;
  mobile?: boolean;
};

export const WalletConnectionStatusButton: FunctionComponent<
  WalletConnectionStatusButtonProps
> = ({
  status,
  account,
  wallet,
  chain,
  hoisted,
  className,
  mobile,
  ...rest
}) => {
  const { Icon } = getWalletConfig(wallet as Wallet);
  const { t } = useTranslation();
  const {
    indicator: indicatorClassName,
    indicatorMobile: indicatorMobileClassName,
    account: accountClassName,
    hoisted: hoistedClassName,
    ...classes
  } = useWalletConnectionStatusButtonStyles();
  const { ensName } = useEns(account);

  const chainConfig = getChainConfig(chain);
  const trimmedAddress = trimAddress(account);
  const resolvedClassName = classNames(className, {
    [hoistedClassName]: hoisted,
  });
  const buttonProps: any = mobile
    ? {}
    : {
        variant: "outlined",
        color: "secondary",
        classes,
      };
  return (
    <Button
      className={resolvedClassName}
      {...buttonProps}
      {...rest}
      title={chainConfig.fullName}
    >
      <WalletConnectionIndicator
        status={status}
        className={mobile ? indicatorMobileClassName : indicatorClassName}
      />
      {status === WalletStatus.Connected && <Icon />}
      {status !== WalletStatus.Connected && (
        <span>{getWalletConnectionLabel(status, t)}</span>
      )}
      {account && (
        <>
          <span className={accountClassName}>{ensName || trimmedAddress}</span>
          {isEthereumBaseChain(chain) && (
            <Davatar
              size={24}
              address={account as string}
              generatedAvatarType="jazzicon"
            />
          )}
        </>
      )}
    </Button>
  );
};

const useBackToWalletPicker = (onClose: () => void) => {
  const dispatch = useDispatch();
  return useCallback(() => {
    onClose();
    setTimeout(() => {
      dispatch(setPickerOpened(true));
    }, 1);
  }, [dispatch, onClose]);
};

type AbstractConnectorInfoProps = {
  wallet: string;
  network: string;
  link: string;
  onBack: () => void;
  onClose: () => void;
  acknowledge: () => void;
};

const AbstractConnectorInfo: FunctionComponent<AbstractConnectorInfoProps> = ({
  wallet,
  network,
  link,
  onBack,
  onClose,
  acknowledge,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <BridgeModalTitle title=" " onClose={onClose} onPrev={onBack} />
      <SpacedPaperContent topPadding bottomPadding>
        <Typography variant="h5" align="center" gutterBottom>
          {t("wallet.connect-network-with-wallet-message", {
            wallet,
            network,
          })}
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          gutterBottom
        >
          <Trans
            i18nKey="wallet.ensure-network-added-message"
            values={{
              network,
              wallet,
            }}
            components={[<Link href={link} external />]}
          />
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <Button variant="text" color="primary" onClick={onBack}>
            {t("wallet.use-another-wallet-label")}
          </Button>
        </ActionButtonWrapper>
        <ActionButtonWrapper>
          <ActionButton onClick={acknowledge}>
            {t("wallet.continue-with-wallet-label", { wallet })}
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </>
  );
};

const getBscMmLink = (lang: string) => {
  return `https://academy.binance.com/${lang}/articles/connecting-metamask-to-binance-smart-chain`;
};

export const BinanceMetamaskConnectorInfo: WalletPickerProps<
  any,
  any
>["DefaultInfo"] = ({ acknowledge, onClose }) => {
  //TODO: not very elegant solution, Dialog should be extended with onBack/onPrev action
  const { t, i18n } = useTranslation();
  const handleBack = useBackToWalletPicker(onClose);
  const wallet = "MetaMask";
  return (
    <>
      <BridgeModalTitle title=" " onClose={onClose} onPrev={handleBack} />
      <SpacedPaperContent topPadding bottomPadding>
        <Typography variant="h5" align="center" gutterBottom>
          {t("wallet.bsc-mm-connect-message")}
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          gutterBottom
        >
          {t("wallet.bsc-mm-connect-description")}{" "}
          <Link href={getBscMmLink(i18n.language)} external>
            {t("common.here")}
          </Link>
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <Button variant="text" color="primary" onClick={handleBack}>
            {t("wallet.use-another-wallet-label")}
          </Button>
        </ActionButtonWrapper>
        <ActionButtonWrapper>
          <ActionButton onClick={acknowledge}>
            {t("wallet.continue-with-wallet-label", { wallet })}
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </>
  );
};

export const AvalancheMetamaskConnectorInfo: WalletPickerProps<
  any,
  any
>["DefaultInfo"] = ({ acknowledge, onClose }) => {
  const handleBack = useBackToWalletPicker(onClose);
  const wallet = "MetaMask";
  const network = "Avalanche";
  const link =
    "https://support.avax.network/en/articles/4626956-how-do-i-set-up-metamask-on-avalanche";
  return (
    <AbstractConnectorInfo
      network={network}
      wallet={wallet}
      onBack={handleBack}
      onClose={onClose}
      acknowledge={acknowledge}
      link={link}
    />
  );
};

export const FantomMetamaskConnectorInfo: WalletPickerProps<
  any,
  any
>["DefaultInfo"] = ({ acknowledge, onClose }) => {
  const handleBack = useBackToWalletPicker(onClose);
  const wallet = "MetaMask";
  const network = "Fantom";
  const link = "https://docs.fantom.foundation/tutorials/set-up-metamask";
  return (
    <AbstractConnectorInfo
      network={network}
      wallet={wallet}
      onBack={handleBack}
      onClose={onClose}
      acknowledge={acknowledge}
      link={link}
    />
  );
};

export const PolygonMetamaskConnectorInfo: WalletPickerProps<
  any,
  any
>["DefaultInfo"] = ({ acknowledge, onClose }) => {
  const handleBack = useBackToWalletPicker(onClose);
  const wallet = "MetaMask";
  const network = "Polygon";
  const link = "https://docs.matic.network/docs/develop/metamask/config-matic/";
  return (
    <AbstractConnectorInfo
      network={network}
      wallet={wallet}
      onBack={handleBack}
      onClose={onClose}
      acknowledge={acknowledge}
      link={link}
    />
  );
};

export const ArbitrumMetamaskConnectorInfo: WalletPickerProps<
  any,
  any
>["DefaultInfo"] = ({ acknowledge, onClose }) => {
  const handleBack = useBackToWalletPicker(onClose);
  const wallet = "MetaMask";
  const network = "Arbitrum";
  // TODO: Update link once mainnet instructions are published.
  const link = "https://developer.offchainlabs.com/docs/public_testnet";
  return (
    <AbstractConnectorInfo
      network={network}
      wallet={wallet}
      onBack={handleBack}
      onClose={onClose}
      acknowledge={acknowledge}
      link={link}
    />
  );
};

type AddTokenButtonProps = {
  onAddToken: (() => Promise<unknown>) | null;
  wallet: string;
  currency: string;
};

export const AddTokenButton: FunctionComponent<AddTokenButtonProps> = ({
  onAddToken,
  wallet,
  currency,
}) => {
  const { t } = useTranslation();

  const [pending, setPending] = useState(false);
  const handleAddToken = useCallback(() => {
    if (onAddToken !== null) {
      setPending(true);
      onAddToken().finally(() => {
        setPending(false);
      });
    }
  }, [onAddToken]);

  const show = onAddToken !== null;

  const params = {
    wallet: wallet,
    currency: currency,
  };
  return (
    <Fade in={show}>
      <SecondaryActionButton disabled={pending} onClick={handleAddToken}>
        {pending
          ? t("wallet.add-token-button-pending-label", params)
          : t("wallet.add-token-button-label", params)}
      </SecondaryActionButton>
    </Fade>
  );
};

type ConnectWalletPaperSectionProps = {
  chain?: Chain;
  account?: string;
  wallet?: Wallet;
  asset?: Asset;
  isRecoveringTx?: boolean;
};

export const ConnectWalletPaperSection: FunctionComponent<
  ConnectWalletPaperSectionProps
> = ({ chain, account, isRecoveringTx }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setPickerOpened(true));
  }, [dispatch]);

  let message = "";
  if (chain) {
    let accountMessage = "";
    if (account) {
      accountMessage = `, associated with ${trimAddress(account)} account`;
    }
    const chainConfig = getChainConfig(chain);
    message = `Please connect ${chainConfig.fullName} compatible wallet${accountMessage}.`;

    if (isRecoveringTx) {
      message +=
        " " +
        "It must be connected to te same account which was used to create transaction you want to resume.";
    }
  }

  return (
    <>
      <PaperSpacerWrapper>
        <CenteringSpacedBox>
          <WalletConnectionProgress />
        </CenteringSpacedBox>
      </PaperSpacerWrapper>
      {Boolean(message) && (
        <Box mb={4}>
          <Typography variant="body1" align="center">
            {message}
          </Typography>
        </Box>
      )}
      <ActionButton onClick={handleWalletPickerOpen}>
        {t("wallet.connect")}
      </ActionButton>
    </>
  );
};

export const AddressScreeningWarningDialog: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { dialogOpened, fromAddressSanctioned, toAddressSanctioned } =
    useSelector($screening);
  const handleClose = useCallback(() => {
    dispatch(setScreeningWarningOpened(false));
  }, [dispatch]);

  let message;
  if (fromAddressSanctioned && toAddressSanctioned) {
    message = "Sender and recipient address are sanctioned";
  } else if (fromAddressSanctioned) {
    message = "Sender address is sanctioned";
  } else if (toAddressSanctioned) {
    message = "Recipient address is sanctioned";
  }

  const sanctioned = fromAddressSanctioned || toAddressSanctioned;
  useEffect(() => {
    if (sanctioned) {
      dispatch(setScreeningWarningOpened(true));
    } else {
      dispatch(setScreeningWarningOpened(false));
    }
  }, [dispatch, sanctioned]);

  return (
    <WarningDialog
      open={dialogOpened}
      onClose={handleClose}
      reason="Sanctioned Address"
      mainActionText="Ok. Let me try..."
      onMainAction={handleClose}
    >
      <Typography variant="h6" paragraph>
        {message}
      </Typography>
      <Typography variant="body2">
        Your transaction will fail during further processing.
      </Typography>
    </WarningDialog>
  );
};

type WrongAddressWarningDialogProps = {
  expected?: string;
  actual?: string;
  isGateway?: boolean;
};

export const WrongAddressWarningDialog: FunctionComponent<
  WrongAddressWarningDialogProps
> = ({ expected, actual, isGateway = false }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [opened, setOpened] = useState(false);
  const handleClose = useCallback(() => {
    setOpened(false);
  }, []);

  const different = expected && actual && expected !== actual;

  useEffect(() => {
    setOpened(Boolean(different));
  }, [dispatch, different]);

  useEffect(() => {
    dispatch(setWalletButtonHoisted(opened));
  }, [dispatch, opened]);

  return (
    <WarningDialog
      open={opened}
      onClose={handleClose}
      title={t("common.warning-label")}
      reason={t("tx.address-error-popup-header")}
      onMainAction={handleClose}
      mainActionText={t("tx.address-error-popup-action-text")}
      mainActionVariant="outlined"
    >
      <Typography variant="body1" paragraph>
        {t("tx.address-error-popup-message-1", {
          mode: isGateway ? t("common.gateway") : t("common.transaction"),
          actual: trimAddress(actual),
          expected: trimAddress(expected),
        })}
        .
      </Typography>
      <Typography variant="body1" paragraph>
        {t("tx.address-error-popup-message-2", {
          mode: isGateway ? t("common.gateway") : t("common.transaction"),
        })}
      </Typography>
      <Typography variant="body1">
        <strong>
          {t("tx.address-error-popup-switch-wallet-account-message")}
        </strong>
      </Typography>
    </WarningDialog>
  );
};
