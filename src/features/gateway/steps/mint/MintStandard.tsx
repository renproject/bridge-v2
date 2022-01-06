import { Box, Grow, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { Asset, Chain } from "@renproject/chains";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import QRCode from "qrcode.react";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import {
  BigQrCode,
  CopyContentButton,
  QrCodeIconButton,
  ToggleIconButton,
  TransactionDetailsButton,
} from "../../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../../components/formatting/NumberFormatText";
import {
  BigTopWrapper,
  CenteringSpacedBox,
  MediumWrapper,
} from "../../../../components/layout/LayoutHelpers";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../../components/layout/Paper";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../../../../components/progress/ProgressHelpers";
import { BigAssetAmount } from "../../../../components/typography/TypographyHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { useNotifications } from "../../../../providers/Notifications";
import {
  usePaperTitle,
  useSetPaperTitle,
} from "../../../../providers/TitleProviders";
import { orangeLight } from "../../../../theme/colors";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { getHours } from "../../../../utils/dates";
import { trimAddress } from "../../../../utils/strings";
import { getAssetConfig } from "../../../../utils/tokensConfig";
import { $network } from "../../../network/networkSlice";
import { BrowserNotificationButton } from "../../../notifications/components/NotificationsHelpers";
import {
  useBrowserNotifications,
  useBrowserNotificationsConfirmation,
} from "../../../notifications/notificationsUtils";
import {
  HMSCountdown,
  ProgressStatus,
} from "../../../transactions/components/TransactionsHelpers";
import { ConnectWalletPaperSection } from "../../../wallet/components/WalletHelpers";
import {
  useCurrentChainWallet,
  useSyncWalletChain,
  useWallet,
} from "../../../wallet/walletHooks";
import { getPaymentLink } from "../../../wallet/walletUtils";
import {
  DepositWrapper,
  GatewayAddressValidityMessage,
} from "../../components/MintHelpers";
import { ResponsiveDepositNavigation } from "../../components/MultipleDepositsHelpers";
import {
  useChainAssetDecimals,
  useGateway,
  useGatewayFees,
} from "../../gatewayHooks";
import { parseGatewayQueryString } from "../../gatewayUtils";
import {
  useDepositTransactionMeta,
  useTransactionsPagination,
} from "../../mintHooks";
import { useGatewayMenuControl } from "../gatewayUiHooks";
import { MintDepositConfirmationStatus } from "./MintStatuses";

export const MintStandardProcess: FunctionComponent<RouteComponentProps> = ({
  location,
}) => {
  const [paperTitle] = usePaperTitle();
  const {
    // modalOpened,
    handleModalOpen,
    handleModalClose,
    tooltipOpened,
    handleTooltipClose,
  } = useBrowserNotificationsConfirmation();
  const { network } = useSelector($network);
  const { enabled } = useBrowserNotifications(handleModalClose);
  const { menuOpened, handleMenuOpen } = useGatewayMenuControl();
  const gatewayParams = parseGatewayQueryString(location.search);
  const { asset, from, to, nonce } = gatewayParams;

  useSyncWalletChain(to);
  const { connected, provider } = useWallet(to);
  const { gateway, transactions } = useGateway(
    { asset, from, to, nonce, network },
    provider
  );

  const fees = useGatewayFees(gateway);
  const { minimumAmount } = fees;

  console.log("gateway", gateway);
  (window as any).ga = gateway;
  (window as any).txs = transactions;

  const { orderedHashes, total } = useTransactionsPagination(transactions);

  const [currentDeposit, setCurrentDeposit] = useState(
    "gateway" // TODO: add url based depositHash
  );

  const handleCurrentDepositChange = useCallback((_, newDeposit) => {
    console.log("newDepositHash", newDeposit);
    if (newDeposit !== null) {
      setCurrentDeposit(newDeposit);
    }
  }, []);

  const transaction = transactions.find((tx) => tx.hash === currentDeposit);
  return (
    <>
      <PaperHeader>
        <PaperNav />
        <PaperTitle>{paperTitle}</PaperTitle>
        <PaperActions>
          <BrowserNotificationButton
            pressed={enabled}
            onClick={handleModalOpen}
            tooltipOpened={tooltipOpened}
            onTooltipClose={handleTooltipClose}
          />
          <ToggleIconButton
            disabled={true}
            variant="settings"
            onClick={handleMenuOpen}
            pressed={menuOpened}
          />
        </PaperActions>
      </PaperHeader>
      <PaperContent>
        {!connected && <ConnectWalletPaperSection />}
        {connected && !gateway && (
          <ProgressStatus reason={"Preparing gateway..."} />
        )}
        {connected && gateway !== null && (
          <>
            <DepositWrapper>
              <ResponsiveDepositNavigation
                gateway={gateway}
                value={currentDeposit}
                onChange={handleCurrentDepositChange}
                transactions={transactions}
                expiryTime={Date.now() + 24 * 3600 * 1000} // TODO: crit finish
              />
              {transaction ? (
                <GatewayDepositProcessor
                  gateway={gateway}
                  transaction={transaction}
                />
              ) : (
                <MintGatewayAddress
                  gateway={gateway}
                  minimumAmount={minimumAmount}
                />
              )}
            </DepositWrapper>
            <Debug it={{ transactions: transactions.length }} />
          </>
        )}
      </PaperContent>
      <Debug it={{ connected, gatewayParams, fees, orderedHashes, total }} />
      <Debug it={{ gateway, provider }} />
    </>
  );
};

export type GatewayDepositProcessorProps = {
  gateway: Gateway;
  transaction: GatewayTransaction;
};
export const GatewayDepositProcessor: FunctionComponent<
  GatewayDepositProcessorProps
> = ({ gateway, transaction }) => {
  const lockStatus = ChainTransactionStatus.Confirming;
  const {
    lockStatus: x,
    mintStatus,
    lockError,
    mintError,
    lockConfirmations,
    lockTargetConfirmations,
    lockTxIdFormatted,
    lockTxUrl,
    lockAmount,
  } = useDepositTransactionMeta(transaction);
  const { decimals: lockAssetDecimals } = useChainAssetDecimals(
    gateway.fromChain,
    gateway.params.asset
  );

  let Content = null;

  switch (lockStatus) {
    case ChainTransactionStatus.Ready:
      Content = <span>ready</span>;
      break;
    case ChainTransactionStatus.Confirming:
      Content = (
        <MintDepositConfirmationStatus
          gateway={gateway}
          transaction={transaction}
          lockConfirmations={lockConfirmations}
          lockTargetConfirmations={lockTargetConfirmations}
          lockStatus={lockStatus}
          lockAssetDecimals={lockAssetDecimals}
          lockAmount={lockAmount}
          lockTxId={lockTxIdFormatted}
          lockTxUrl={lockTxUrl}
        />
      );
      break;
    case ChainTransactionStatus.Done:
      Content = <span>done</span>;
      break;
    case ChainTransactionStatus.Reverted:
      Content = <span>reverted</span>;
      break;
    default:
      Content = <span>unknown</span>;
  }

  return (
    <>
      {Content}
      <Debug it={{ lockStatus, mintStatus, lockError, mintError }} />
    </>
  );
};

export type MintGatewayAddressProps = {
  gateway: Gateway;
  minimumAmount: number | string;
};

export const MintGatewayAddress: FunctionComponent<MintGatewayAddressProps> = ({
  gateway,
  minimumAmount,
}) => {
  const { t } = useTranslation();
  const { account } = useCurrentChainWallet();
  const [showQr, setShowQr] = useState(false);
  const toggleQr = useCallback(() => {
    setShowQr(!showQr);
  }, [showQr]);
  const { showNotification, closeNotification } = useNotifications();
  const [timeRemained] = useState(0); //useState(getRemainingGatewayTime(gateway.expiryTime));

  const toChainConfig = getChainConfig(gateway.toChain.chain as Chain);
  useEffect(() => {
    let key = 0;
    if (timeRemained > 0) {
      key = showNotification(
        <GatewayAddressValidityMessage
          milliseconds={timeRemained}
          destNetwork={toChainConfig.fullName}
        />,
        {
          variant: getHours(timeRemained) < 6 ? "error" : "warning",
          persist: true,
        }
      ) as number;
    }
    return () => {
      if (key) {
        closeNotification(key);
      }
    };
  }, [showNotification, toChainConfig, closeNotification, timeRemained]);

  const lockCurrencyConfig = getAssetConfig(gateway.params.asset as Asset);
  const lockChainConfig = getChainConfig(gateway.fromChain.chain as Chain);
  // const { color } = lockCurrencyConfig;
  const color = orangeLight;
  const { Icon } = lockChainConfig;
  useSetPaperTitle(t("mint.gateway-address-title"));

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={color || orangeLight} size={64}>
          <Icon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <MediumWrapper>
        <BigAssetAmount
          value={
            <span>
              {t("mint.gateway-send-to-message", {
                currency: lockCurrencyConfig.shortName,
              })}
            </span>
          }
        />
        {Boolean(minimumAmount) ? (
          <Typography
            component="p"
            variant="caption"
            align="center"
            color="textSecondary"
          >
            {t("mint.gateway-minimum-amount-label")}:{" "}
            <NumberFormatText
              value={minimumAmount}
              spacedSuffix={lockCurrencyConfig.shortName}
            />
          </Typography>
        ) : (
          <Box display="flex" justifyContent="center">
            <Skeleton variant="text" width={200} height={20} />
          </Box>
        )}
      </MediumWrapper>
      {Boolean(gateway.gatewayAddress) ? (
        <>
          {showQr && (
            <CenteringSpacedBox>
              <Grow in={showQr}>
                <BigQrCode>
                  <QRCode
                    value={getPaymentLink(
                      gateway.fromChain.chain as Chain,
                      gateway.gatewayAddress || ""
                    )}
                  />
                </BigQrCode>
              </Grow>
            </CenteringSpacedBox>
          )}
          <CopyContentButton
            content={gateway.gatewayAddress || ""}
            copiedMessage={t("common.copied-ex-message")}
          />
        </>
      ) : (
        <Skeleton variant="rect" height={45} />
      )}
      <Box
        mt={2}
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
      >
        <Typography variant="caption">
          {timeRemained > 0 && (
            <span>
              {t("mint.gateway-do-not-send-after-label")}:{" "}
              <strong>
                <HMSCountdown milliseconds={timeRemained} />
              </strong>
            </span>
          )}
          {timeRemained <= 0 && <span>{t("mint.expired-label")}</span>}
        </Typography>
        <Box mt={2}>
          <QrCodeIconButton onClick={toggleQr} />
        </Box>
        <BigTopWrapper>
          <TransactionDetailsButton
            label={t("mint.recipient-address-label")}
            isTx={false}
            address={trimAddress(account, 5)}
            link={gateway.toChain.addressExplorerLink(account)}
            size="small"
          />
        </BigTopWrapper>
      </Box>
    </>
  );
};
