import { Box, Grow, Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { Asset, Chain } from "@renproject/chains";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import QRCode from "qrcode.react";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import {
  BigQrCode,
  CopyContentButton,
  QrCodeIconButton,
  TransactionDetailsButton,
} from "../../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../../components/formatting/NumberFormatText";
import {
  BigTopWrapper,
  CenteringSpacedBox,
  MediumWrapper,
} from "../../../../components/layout/LayoutHelpers";
import { PaperContent } from "../../../../components/layout/Paper";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../../../../components/progress/ProgressHelpers";
import { BigAssetAmount } from "../../../../components/typography/TypographyHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
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
import {
  alterEthereumBaseChainsProviderSigner,
  ChainInstance,
  ChainInstanceMap,
  PartialChainInstanceMap,
} from "../../../chain/chainUtils";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import {
  GeneralErrorDialog,
  HMSCountdown,
} from "../../../transactions/components/TransactionsHelpers";
import { ConnectWalletPaperSection } from "../../../wallet/components/WalletHelpers";
import {
  useCurrentChainWallet,
  useSyncWalletChain,
  useWallet,
} from "../../../wallet/walletHooks";
import { getPaymentLink } from "../../../wallet/walletUtils";
import { GatewayLoaderStatus } from "../../components/GatewayHelpers";
import {
  DepositWrapper,
  GatewayAddressValidityMessage,
} from "../../components/MintHelpers";
import { ResponsiveDepositNavigation } from "../../components/MultipleDepositsHelpers";
import {
  useChainInstanceAssetDecimals,
  useGateway,
  useGatewayFees,
} from "../../gatewayHooks";
import {
  useChainTransactionStatusUpdater,
  useRenVMChainTransactionStatusUpdater,
} from "../../gatewayTransactionHooks";
import {
  getGatewayExpiryTime,
  parseGatewayQueryString,
} from "../../gatewayUtils";
import { useTransactionsPagination } from "../../mintHooks";
import { GatewayPaperHeader } from "../shared/GatewayNavigationHelpers";
import {
  MintCompletedStatus,
  MintCompletingStatus,
  MintDepositAcceptedStatus,
  MintDepositConfirmationStatus,
} from "./MintStandardStatuses";

export const MintStandardProcess: FunctionComponent<RouteComponentProps> = ({
  location,
  history,
}) => {
  const { t } = useTranslation();

  const [paperTitle] = usePaperTitle();

  const {
    gatewayParams,
    additionalParams,
    error: parseError,
  } = parseGatewayQueryString(location.search, true);
  const { asset, from, to, nonce } = gatewayParams;
  const expiryTime = additionalParams.expiryTime || getGatewayExpiryTime();

  useSyncWalletChain(to);
  const { connected, provider } = useWallet(to);
  const allChains = useCurrentNetworkChains();
  const [chains, setChains] = useState<PartialChainInstanceMap | null>(null);
  useEffect(() => {
    if (provider) {
      const newChainsMap = { [from]: allChains[from], [to]: allChains[to] };
      alterEthereumBaseChainsProviderSigner(newChainsMap, provider, true, from);
      setChains(newChainsMap);
    }
  }, [from, to, provider]);

  const { gateway, transactions } = useGateway(
    { asset, from, to, nonce },
    { chains }
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
  const handleGoToGateway = useCallback(() => {
    setCurrentDeposit("gateway");
  }, []);

  const transaction = transactions.find((tx) => tx.hash === currentDeposit);
  return (
    <>
      <GatewayPaperHeader title={paperTitle} />
      <PaperContent>
        {Boolean(parseError) && (
          <GeneralErrorDialog
            open={true}
            reason={parseError}
            alternativeActionText={t("navigation.back-to-home-label")}
            onAlternativeAction={() => history.push({ pathname: paths.HOME })}
          />
        )}
        {!connected && <ConnectWalletPaperSection />}
        {connected && !gateway && <GatewayLoaderStatus />}
        {connected && gateway !== null && (
          <>
            <DepositWrapper>
              <ResponsiveDepositNavigation
                gateway={gateway}
                value={currentDeposit}
                onChange={handleCurrentDepositChange}
                transactions={transactions}
                expiryTime={expiryTime}
              />
              {transaction ? (
                <GatewayDepositProcessor
                  gateway={gateway}
                  transaction={transaction}
                  onGoToGateway={handleGoToGateway}
                  expiryTime={expiryTime}
                />
              ) : (
                <MintGatewayAddress
                  gateway={gateway}
                  minimumAmount={minimumAmount}
                />
              )}
            </DepositWrapper>
            <Debug
              it={{
                currentDeposit,
                currentTx: transaction?.params,
                transactions: transactions.length,
              }}
            />
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
  onGoToGateway: () => void;
  expiryTime: number;
};

export const GatewayDepositProcessor: FunctionComponent<
  GatewayDepositProcessorProps
> = ({ gateway, transaction, onGoToGateway, expiryTime }) => {
  // const lockStatus = ChainTransactionStatus.Done;
  // TODO: crit use dedicated updaters
  useEffect(() => {
    console.log("tx: changed", transaction);
  }, [transaction]);

  const {
    error: lockError,
    status: lockStatus,
    confirmations: lockConfirmations,
    target: lockTargetConfirmations,
    txId: lockTxId,
    txIdFormatted: lockTxIdFormatted,
    txIndex: lockTxIndex,
    txUrl: lockTxUrl,
    amount: lockAmount,
  } = useChainTransactionStatusUpdater({
    tx: transaction.in,
    debugLabel: "in",
  });

  const {
    error: mintError,
    status: mintStatus,
    confirmations: mintConfirmations,
    target: mintTargetConfirmations,
    txId: mintTxId,
    txIdFormatted: mintTxIdFormatted,
    txIndex: mintTxIndex,
    txUrl: mintTxUrl,
  } = useChainTransactionStatusUpdater({
    tx: transaction.out,
    debugLabel: "out",
  });

  const renVmTxMeta = useRenVMChainTransactionStatusUpdater({
    tx: transaction.renVM,
  });
  const { amount: mintAmount, status: renVMStatus } = renVmTxMeta;

  const { decimals: lockAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.fromChain,
    gateway.params.asset
  );
  const { decimals: mintAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.toChain,
    gateway.params.asset
  );

  const [submitting, setSubmitting] = useState(false);
  const [renVMSubmitting, setRenVMSubmitting] = useState(false);
  const [submittingError, setSubmittingError] = useState();
  const handleSubmit = useCallback(async () => {
    if (transaction.out.submit) {
      console.log("txOut", transaction);
      setSubmittingError(undefined);
      setSubmitting(true);
      try {
        if (renVMStatus !== ChainTransactionStatus.Done) {
          setRenVMSubmitting(true);
          await transaction.renVM.submit();
          await transaction.renVM.wait();
          setRenVMSubmitting(false);
        }
        await transaction.out.submit();
      } catch (error: any) {
        setSubmittingError(error);
      }
      setSubmitting(false);
    }
  }, [transaction, renVMStatus]);
  const handleReload = useCallback(() => {
    setSubmittingError(undefined);
  }, []);

  let Content = null;
  if (lockStatus !== ChainTransactionStatus.Done) {
    switch (lockStatus) {
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
      case ChainTransactionStatus.Reverted:
        Content = <span>reverted</span>;
        break;
      default:
        Content = <GatewayLoaderStatus />;
    }
  } else if (
    mintStatus === null &&
    lockStatus === ChainTransactionStatus.Done
  ) {
    Content = (
      <MintDepositAcceptedStatus
        expiryTime={expiryTime}
        gateway={gateway}
        transaction={transaction}
        lockConfirmations={lockConfirmations}
        lockTargetConfirmations={lockTargetConfirmations}
        lockAssetDecimals={lockAssetDecimals}
        lockAmount={lockAmount}
        lockTxId={lockTxIdFormatted}
        lockTxUrl={lockTxUrl}
        onSubmit={handleSubmit}
        onRetry={handleSubmit}
        onReload={handleReload}
        submitting={submitting}
        submittingError={submittingError}
        renVMSubmitting={renVMSubmitting}
      />
    );
  } else {
    if (mintTxUrl) {
      Content = (
        <MintCompletedStatus
          gateway={gateway}
          mintAmount={mintAmount}
          lockTxUrl={lockTxUrl}
          mintTxUrl={mintTxUrl}
          mintAssetDecimals={mintAssetDecimals}
        />
      );
    } else {
      Content = (
        <MintCompletingStatus
          gateway={gateway}
          transaction={transaction}
          lockTxId={lockTxIdFormatted}
          lockTxUrl={lockTxUrl}
          mintAmount={mintAmount}
          mintAssetDecimals={mintAssetDecimals}
          mintTxUrl={mintTxUrl}
          mintTxHash={mintTxIdFormatted}
          mintConfirmations={mintConfirmations}
          mintTargetConfirmations={mintTargetConfirmations}
        />
      );
    }
  }

  return (
    <>
      {Content}
      <Debug
        it={{
          renVmTxMeta,
          mintAssetDecimals,
          hash: transaction.hash,
        }}
      />
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
            label={t("common.recipient-address-label")}
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
