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
import { WalletPickerProps } from "@renproject/multiwallet-ui";
import classNames from "classnames";
import React, { FunctionComponent, useCallback, useState } from "react";
import { TFunction, useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useTimeout } from "react-use";
import { useSubNetworkName } from "../../features/ui/uiHooks";
import {
  useSelectedChainWallet,
  useSwitchChainHelpers,
} from "../../features/wallet/walletHooks";
import { setWalletPickerOpened } from "../../features/wallet/walletSlice";
import { createPulseAnimation } from "../../theme/animationUtils";
import { defaultShadow } from "../../theme/other";
import {
  BridgeWallet,
  getChainConfigByRentxName,
  getNetworkConfigByRentxName,
  getWalletConfig,
  getWalletConfigByRentxName,
} from "../../utils/assetConfigs";
import { trimAddress } from "../../utils/strings";
import {
  ActionButton,
  ActionButtonWrapper,
  SecondaryActionButton,
} from "../buttons/Buttons";
import { WalletIcon } from "../icons/RenIcons";
import { PaperContent, SpacedPaperContent } from "../layout/Paper";
import { Link } from "../links/Links";
import { BridgeModalTitle } from "../modals/BridgeModal";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../progress/ProgressHelpers";
import { Debug } from "../utils/Debug";
import { WalletConnectionStatusType, WalletStatus } from "../utils/types";

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
  const walletConfig = getWalletConfigByRentxName(name);
  const { MainIcon } = walletConfig;
  return (
    <Button
      classes={classes}
      variant="outlined"
      size="large"
      fullWidth
      onClick={onClick}
    >
      <span>{walletConfig.full}</span>{" "}
      <span className={iconClassName}>
        <MainIcon fontSize="inherit" />
      </span>
    </Button>
  );
};

export const WalletChainLabel: WalletPickerProps<
  any,
  any
>["WalletChainLabel"] = ({ chain }) => {
  const chainConfig = getChainConfigByRentxName(chain);
  return <span>{chainConfig.full}</span>;
};

export const WalletConnectingInfo: WalletPickerProps<
  any,
  any
>["ConnectingInfo"] = ({ chain, onClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const chainConfig = getChainConfigByRentxName(chain);

  // TODO: There should be better mapping.
  const walletSymbol: BridgeWallet = {
    ethereum: BridgeWallet.METAMASKW,
    bsc: BridgeWallet.BINANCESMARTW,
    fantom: BridgeWallet.METAMASKW,
    polygon: BridgeWallet.METAMASKW,
    avalanche: BridgeWallet.METAMASKW,
    solana: BridgeWallet.SOLLETW,
    arbitrum: BridgeWallet.METAMASKW,
  }[
    chain as
      | "ethereum"
      | "bsc"
      | "fantom"
      | "polygon"
      | "avalanche"
      | "solana"
      | "arbitrum"
  ];
  const walletConfig = getWalletConfig(walletSymbol);

  const { MainIcon } = walletConfig;
  const [isPassed] = useTimeout(3000);
  const passed = isPassed();
  return (
    <>
      <Debug it={{ chainConfig }} />
      <BridgeModalTitle
        title={
          passed
            ? t("wallet.action-required", {
                wallet: walletConfig.short,
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
            <MainIcon fontSize="inherit" />
          </ProgressWithContent>
        </ProgressWrapper>
        <Typography variant="h6" align="center">
          {passed
            ? t("wallet.action-connect-message", {
                wallet: walletConfig.full,
              })
            : t("wallet.action-connecting-to", {
                chain: chainConfig.full,
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
  const { t } = useTranslation();
  const theme = useTheme();
  const subNetworkName = useSubNetworkName();
  const chainConfig = getChainConfigByRentxName(chain);
  const networkName = getNetworkConfigByRentxName(targetNetwork).full;

  const { provider } = useSelectedChainWallet();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<any>(false);
  const { addOrSwitchChain } = useSwitchChainHelpers(
    chainConfig.symbol,
    targetNetwork,
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
        .catch((error) => {
          setError(error);
        })
        .finally(() => {
          setPending(false);
        });
    }
  }, [addOrSwitchChain]);

  return (
    <>
      <BridgeModalTitle title="Wrong Network" onClose={onClose} />
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
          {t("wallet.network-switch-label")} {chainConfig.full} {networkName}
          {subNetworkName && <span> ({subNetworkName})</span>}
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary">
          {t("wallet.network-switch-description")} {chainConfig.full}{" "}
          {networkName} {subNetworkName}
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
                      </CenteredFormHelperText>
                    )}
                  </Box>
                </Fade>
              </Box>
              <ActionButton
                onClick={handleSwitch}
                disabled={pending || success}
              >
                {pending || success
                  ? t("wallet.network-switching-label", {
                      network: subNetworkName || networkName,
                      wallet: "MetaMask",
                    })
                  : t("wallet.network-switch-label", {
                      network: subNetworkName || networkName,
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
  status?: WalletConnectionStatusType;
  className?: string; // TODO: find a better way
};

export const WalletConnectionIndicator: FunctionComponent<WalletConnectionIndicatorProps> = ({
  status,
  className: classNameProp,
}) => {
  const styles = useWalletConnectionIndicatorStyles() as WalletConnectionIndicatorStyles;
  const className = classNames(styles.root, classNameProp, {
    [styles.connected]: status === WalletStatus.CONNECTED,
    [styles.wrongNetwork]: status === WalletStatus.WRONG_NETWORK,
    [styles.disconnected]: status === WalletStatus.DISCONNECTED,
    [styles.connecting]: status === WalletStatus.CONNECTING,
  });
  return <div className={className} />;
};

const getWalletConnectionLabel = (
  status: WalletConnectionStatusType,
  t: TFunction
) => {
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
  account: { marginLeft: 20 },
}));

type WalletConnectionStatusButtonProps = ButtonProps & {
  status: WalletConnectionStatusType;
  wallet: BridgeWallet;
  hoisted?: boolean;
  account?: string;
  mobile?: boolean;
};

export const WalletConnectionStatusButton: FunctionComponent<WalletConnectionStatusButtonProps> = ({
  status,
  account,
  wallet,
  hoisted,
  className,
  mobile,
  ...rest
}) => {
  const { t } = useTranslation();
  const {
    indicator: indicatorClassName,
    indicatorMobile: indicatorMobileClassName,
    account: accountClassName,
    hoisted: hoistedClassName,
    ...classes
  } = useWalletConnectionStatusButtonStyles();

  const label =
    status === WalletStatus.CONNECTED
      ? getWalletConfig(wallet).short
      : getWalletConnectionLabel(status, t);
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
    <Button className={resolvedClassName} {...buttonProps} {...rest}>
      <WalletConnectionIndicator
        status={status}
        className={mobile ? indicatorMobileClassName : indicatorClassName}
      />
      <span>{label}</span>
      {trimmedAddress && (
        <span className={accountClassName}>{trimmedAddress}</span>
      )}
    </Button>
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
  const dispatch = useDispatch();
  const handleBackToWalletPicker = useCallback(() => {
    onClose();
    setTimeout(() => {
      dispatch(setWalletPickerOpened(true));
    }, 1);
  }, [dispatch, onClose]);
  return (
    <>
      <BridgeModalTitle
        title=" "
        onClose={onClose}
        onPrev={handleBackToWalletPicker}
      />
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
          <Button
            variant="text"
            color="primary"
            onClick={handleBackToWalletPicker}
          >
            Use another wallet
          </Button>
        </ActionButtonWrapper>
        <ActionButtonWrapper>
          <ActionButton onClick={acknowledge}>
            Continue with MetaMask
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
  //TODO: not very elegant solution, Dialog should be extended with onBack/onPrev action
  const dispatch = useDispatch();
  const handleBackToWalletPicker = useCallback(() => {
    onClose();
    setTimeout(() => {
      dispatch(setWalletPickerOpened(true));
    }, 1);
  }, [dispatch, onClose]);
  return (
    <>
      <BridgeModalTitle
        title=" "
        onClose={onClose}
        onPrev={handleBackToWalletPicker}
      />
      <SpacedPaperContent topPadding bottomPadding>
        <Typography variant="h5" align="center" gutterBottom>
          Connect Avalanche with MetaMask
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          gutterBottom
        >
          Please ensure that you have added the Avalanche network to Metamask as
          explained{" "}
          <Link
            href="https://support.avax.network/en/articles/4626956-how-do-i-set-up-metamask-on-avalanche"
            external
          >
            here
          </Link>
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <Button
            variant="text"
            color="primary"
            onClick={handleBackToWalletPicker}
          >
            Use another wallet
          </Button>
        </ActionButtonWrapper>
        <ActionButtonWrapper>
          <ActionButton onClick={acknowledge}>
            Continue with MetaMask
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </>
  );
};

export const FantomMetamaskConnectorInfo: WalletPickerProps<
  any,
  any
>["DefaultInfo"] = ({ acknowledge, onClose }) => {
  //TODO: not very elegant solution, Dialog should be extended with onBack/onPrev action
  const dispatch = useDispatch();
  const handleBackToWalletPicker = useCallback(() => {
    onClose();
    setTimeout(() => {
      dispatch(setWalletPickerOpened(true));
    }, 1);
  }, [dispatch, onClose]);
  return (
    <>
      <BridgeModalTitle
        title=" "
        onClose={onClose}
        onPrev={handleBackToWalletPicker}
      />
      <SpacedPaperContent topPadding bottomPadding>
        <Typography variant="h5" align="center" gutterBottom>
          Connect Fantom with MetaMask
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          gutterBottom
        >
          Please ensure that you have added the Fantom network to Metamask as
          explained{" "}
          <Link
            href="https://docs.fantom.foundation/tutorials/set-up-metamask"
            external
          >
            here
          </Link>
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <Button
            variant="text"
            color="primary"
            onClick={handleBackToWalletPicker}
          >
            Use another wallet
          </Button>
        </ActionButtonWrapper>
        <ActionButtonWrapper>
          <ActionButton onClick={acknowledge}>
            Continue with MetaMask
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </>
  );
};

export const PolygonMetamaskConnectorInfo: WalletPickerProps<
  any,
  any
>["DefaultInfo"] = ({ acknowledge, onClose }) => {
  //TODO: not very elegant solution, Dialog should be extended with onBack/onPrev action
  const dispatch = useDispatch();
  const handleBackToWalletPicker = useCallback(() => {
    onClose();
    setTimeout(() => {
      dispatch(setWalletPickerOpened(true));
    }, 1);
  }, [dispatch, onClose]);
  return (
    <>
      <BridgeModalTitle
        title=" "
        onClose={onClose}
        onPrev={handleBackToWalletPicker}
      />
      <SpacedPaperContent topPadding bottomPadding>
        <Typography variant="h5" align="center" gutterBottom>
          Connect Polygon with MetaMask
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          gutterBottom
        >
          Please ensure that you have added the Polygon network to Metamask as
          explained{" "}
          <Link
            href="https://docs.matic.network/docs/develop/metamask/config-matic/"
            external
          >
            here
          </Link>
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <Button
            variant="text"
            color="primary"
            onClick={handleBackToWalletPicker}
          >
            Use another wallet
          </Button>
        </ActionButtonWrapper>
        <ActionButtonWrapper>
          <ActionButton onClick={acknowledge}>
            Continue with MetaMask
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </>
  );
};

export const ArbitrumMetamaskConnectorInfo: WalletPickerProps<
  any,
  any
>["DefaultInfo"] = ({ acknowledge, onClose }) => {
  //TODO: not very elegant solution, Dialog should be extended with onBack/onPrev action
  const dispatch = useDispatch();
  const handleBackToWalletPicker = useCallback(() => {
    onClose();
    setTimeout(() => {
      dispatch(setWalletPickerOpened(true));
    }, 1);
  }, [dispatch, onClose]);
  return (
    <>
      <BridgeModalTitle
        title=" "
        onClose={onClose}
        onPrev={handleBackToWalletPicker}
      />
      <SpacedPaperContent topPadding bottomPadding>
        <Typography variant="h5" align="center" gutterBottom>
          Connect Arbitrum with MetaMask
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="textSecondary"
          gutterBottom
        >
          Please ensure that you have added the Arbitrum network to Metamask as
          explained{" "}
          <Link
            // TODO: Update link once mainnet instructions are published.
            href="https://developer.offchainlabs.com/docs/public_testnet"
            external
          >
            here
          </Link>
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <Button
            variant="text"
            color="primary"
            onClick={handleBackToWalletPicker}
          >
            Use another wallet
          </Button>
        </ActionButtonWrapper>
        <ActionButtonWrapper>
          <ActionButton onClick={acknowledge}>
            Continue with MetaMask
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </>
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
