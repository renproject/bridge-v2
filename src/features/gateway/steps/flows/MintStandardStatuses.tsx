import { Box, Typography, useTheme } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, {
  FunctionComponent,
  ReactText,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useEffectOnce } from "react-use";
import {
  ActionButton,
  ActionButtonWrapper,
  MultipleActionButtonWrapper,
  TransactionDetailsButton,
} from "../../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../../components/formatting/NumberFormatText";
import {
  MediumWrapper,
  SmallTopWrapper,
} from "../../../../components/layout/LayoutHelpers";
import { Link } from "../../../../components/links/Links";
import {
  BigDoneIcon,
  ProgressWithContent,
  ProgressWrapper,
  RenvmRevertedIndicator,
  TransactionStatusInfo,
} from "../../../../components/progress/ProgressHelpers";
import { BigAssetAmount } from "../../../../components/typography/TypographyHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { useNotifications } from "../../../../providers/Notifications";
import {
  usePaperTitle,
  useSetActionRequired,
  useSetPaperTitle,
} from "../../../../providers/TitleProviders";
import {
  getAssetConfig,
  getRenAssetFullName,
} from "../../../../utils/assetsConfig";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { getHours } from "../../../../utils/dates";
import { decimalsAmount } from "../../../../utils/numbers";
import { undefinedForNull } from "../../../../utils/propsUtils";
import { getRemainingTime } from "../../../../utils/time";
import { getWalletConfig } from "../../../../utils/walletsConfig";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { useTxSuccessNotification } from "../../../transactions/transactionsHooks";
import { AddTokenButton } from "../../../wallet/components/WalletHelpers";
import {
  useCurrentChainWallet,
  useWalletAssetHelpers,
} from "../../../wallet/walletHooks";
import { GatewayTransactionValidityMessage } from "../../components/MintHelpers";
import {
  RenVMSubmittingInfo,
  TransactionProgressInfo,
} from "../../components/TransactionProgressHelpers";
import { GatewayIOType, getGatewayParams } from "../../gatewayHooks";
import { useBasicRouteHandlers } from "../../gatewayRoutingUtils";
import { maxConfirmations } from "../../gatewayTransactionUtils";
import { GATEWAY_EXPIRY_OFFSET_MS } from "../../gatewayUtils";
import { SubmittingProps } from "../shared/SubmissionHelpers";
import {
  FromToTxLinks,
  SentReceivedSection,
} from "../shared/TransactionStatuses";

type MintDepositConfirmationStatusProps = {
  gateway: Gateway;
  transaction: GatewayTransaction;
  lockConfirmations: number | null;
  lockTargetConfirmations: number | null;
  lockStatus: ChainTransactionStatus;
  lockAmount: string | null;
  lockAssetDecimals: number | null;
  lockTxId: string | null;
  lockTxUrl: string | null;
};

// TODO: finish
export const MintDepositConfirmationStatus: FunctionComponent<
  MintDepositConfirmationStatusProps
> = ({
  gateway,
  transaction,
  lockConfirmations,
  lockTargetConfirmations,
  lockStatus,
  lockAmount,
  lockAssetDecimals,
  lockTxId,
  lockTxUrl,
}) => {
  const { t } = useTranslation();
  const [, setTitle] = usePaperTitle();
  const { asset, from, fromAverageConfirmationTime } =
    getGatewayParams(gateway);
  const lockAssetConfig = getAssetConfig(asset);
  const lockChainConfig = getChainConfig(from);

  const { Icon } = lockAssetConfig;

  const confirmed = lockStatus === ChainTransactionStatus.Done;
  const lockAmountFormatted = decimalsAmount(lockAmount, lockAssetDecimals);

  useEffect(() => {
    setTitle(
      confirmed
        ? t("mint.deposit-confirmed-label")
        : t("mint.deposit-confirming-label")
    );
  }, [setTitle, confirmed, t]);

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent
          color={lockAssetConfig.color}
          confirmations={undefinedForNull(lockConfirmations)}
          targetConfirmations={undefinedForNull(lockTargetConfirmations)}
        >
          <Icon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <TransactionProgressInfo
        confirmations={lockConfirmations}
        target={lockTargetConfirmations}
        averageConfirmationTime={fromAverageConfirmationTime}
      />
      <MediumWrapper>
        {lockAmountFormatted !== null ? (
          <BigAssetAmount
            value={
              <NumberFormatText
                value={lockAmountFormatted}
                spacedSuffix={lockAssetConfig.shortName}
              />
            }
          />
        ) : (
          <Skeleton width={120} height={32} />
        )}
      </MediumWrapper>
      {lockTxId !== null && lockTxUrl !== null && (
        <TransactionDetailsButton
          label={lockChainConfig.fullName}
          address={lockTxId}
          link={lockTxUrl}
        />
      )}
    </>
  );
};

type MintDepositAcceptedStatusProps = SubmittingProps & {
  gateway: Gateway;
  transaction: GatewayTransaction;
  expiryTime: number;
  lockTargetConfirmations: number | null;
  lockConfirmations: number | null;
  lockAmount: string | null;
  lockAssetDecimals: number | null;
  lockTxId: string | null;
  lockTxUrl: string | null;
  onReload: () => void;
  renVMStatus: ChainTransactionStatus | null;
  renVMSubmitting: boolean;
};

export const MintDepositAcceptedStatus: FunctionComponent<
  MintDepositAcceptedStatusProps
> = ({
  gateway,
  transaction,
  expiryTime,
  lockConfirmations,
  lockTargetConfirmations,
  lockAmount,
  lockAssetDecimals,
  lockTxId,
  lockTxUrl,
  onSubmit,
  submittingError,
  submitting,
  submittingDisabled,
  onReload,
  renVMStatus,
  renVMSubmitting,
}) => {
  const { t } = useTranslation();
  useSetPaperTitle(t("mint.deposit-accepted-submit-title"));
  useSetActionRequired(true);
  const lockAssetConfig = getAssetConfig(gateway.params.asset);
  const lockChainConfig = getChainConfig(gateway.params.from.chain);
  const mintChainConfig = getChainConfig(gateway.params.to.chain);

  const lockAmountFormatted = decimalsAmount(lockAmount, lockAssetDecimals);

  const { showNotification, closeNotification } = useNotifications();
  const [notification, setNotification] = useState<ReactText>();
  useEffect(() => {
    if (
      lockConfirmations !== null &&
      lockTargetConfirmations !== null &&
      notification
    ) {
      const notificationMessage = t(
        "mint.deposit-accepted-notification-message",
        {
          confirmations: maxConfirmations(
            lockConfirmations,
            lockTargetConfirmations
          ),
          targetConfirmations: lockTargetConfirmations,
          currency: lockAssetConfig.shortName,
          chain: mintChainConfig.fullName,
        }
      );
      const key = showNotification(notificationMessage);
      setNotification(key);
    }
    return () => {
      closeNotification(notification);
    };
  }, [
    t,
    lockAssetConfig,
    showNotification,
    closeNotification,
    mintChainConfig,
    lockConfirmations,
    lockTargetConfirmations,
    notification,
  ]);

  const [mintTimeRemained] = useState(getRemainingTime(expiryTime));

  useEffect(() => {
    let key = 0;
    if (mintTimeRemained < GATEWAY_EXPIRY_OFFSET_MS) {
      key = showNotification(
        <GatewayTransactionValidityMessage milliseconds={mintTimeRemained} />,
        {
          variant: getHours(mintTimeRemained) < 12 ? "error" : "warning",
          persist: true,
        }
      ) as number;
    }
    return () => {
      if (key) {
        closeNotification(key);
      }
    };
  }, [showNotification, closeNotification, mintTimeRemained]);

  const { Icon: LockChainIcon } = lockChainConfig;

  const renVMProcessing =
    renVMSubmitting || renVMStatus !== ChainTransactionStatus.Done;
  return (
    <>
      <ProgressWrapper>
        {renVMStatus === ChainTransactionStatus.Reverted && (
          <RenvmRevertedIndicator></RenvmRevertedIndicator>
        )}
        {renVMStatus !== ChainTransactionStatus.Reverted && renVMProcessing && (
          <ProgressWithContent processing>
            <RenVMSubmittingInfo />
          </ProgressWithContent>
        )}
        {!renVMProcessing && submitting && (
          <ProgressWithContent color={lockChainConfig.color} processing>
            <LockChainIcon fontSize="inherit" color="inherit" />
          </ProgressWithContent>
        )}
        {!renVMProcessing && !submitting && (
          <ProgressWithContent
            color={lockChainConfig.color}
            confirmations={undefinedForNull(lockConfirmations)}
            targetConfirmations={undefinedForNull(lockTargetConfirmations)}
          >
            <LockChainIcon fontSize="inherit" color="inherit" />
          </ProgressWithContent>
        )}
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        <NumberFormatText
          value={lockAmountFormatted}
          spacedSuffix={lockAssetConfig.fullName}
        />{" "}
        {t("mint.received-label")}
      </Typography>
      <ActionButtonWrapper>
        <ActionButton
          onClick={onSubmit}
          disabled={submitting || submittingDisabled}
        >
          {submitting ? t("mint.minting-label") : t("mint.mint-label")}{" "}
          {getRenAssetFullName(lockAssetConfig.fullName)}
          {submitting && "..."}
        </ActionButton>
      </ActionButtonWrapper>
      <ActionButtonWrapper>
        {lockTxId !== null && lockTxUrl !== null && (
          <TransactionDetailsButton
            label={lockChainConfig.fullName}
            address={lockTxId}
            link={lockTxUrl}
          />
        )}
      </ActionButtonWrapper>
      <Debug it={{ submittingError }} />
      <SubmitErrorDialog
        open={Boolean(submittingError)}
        onAction={onReload}
        onAlternativeAction={onSubmit}
        error={submittingError}
      />
    </>
  );
};

type MintCompletingStatusProps = {
  gateway: Gateway;
  transaction: GatewayTransaction;
  mintConfirmations: number | null;
  mintTargetConfirmations: number | null;
  lockTxId: string | null;
  lockTxUrl: string | null;
  mintAssetDecimals: number | null;
  mintAmount: string | null;
  mintTxUrl: string | null;
  mintTxHash: string | null;
};

export const MintCompletingStatus: FunctionComponent<
  MintCompletingStatusProps
> = ({
  gateway,
  mintTxUrl,
  mintTargetConfirmations,
  mintConfirmations,
  mintTxHash,
  mintAmount,
  lockTxId,
  lockTxUrl,
  mintAssetDecimals,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const lockAssetConfig = getAssetConfig(gateway.params.asset);
  const lockChainConfig = getChainConfig(gateway.params.from.chain);
  const mintChainConfig = getChainConfig(gateway.params.to.chain);
  const mintAmountFormatted = decimalsAmount(mintAmount, mintAssetDecimals);
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent
          color={theme.customColors.skyBlue}
          confirmations={
            mintConfirmations !== null ? mintConfirmations : undefined
          }
          targetConfirmations={
            mintTargetConfirmations !== null
              ? mintTargetConfirmations
              : undefined
          }
        >
          {mintTxUrl !== null && (
            <TransactionStatusInfo
              status={t("mint.status-pending-label")}
              chain={mintChainConfig.fullName}
              address={
                <Link
                  color="primary"
                  underline="hover"
                  href={mintTxUrl}
                  target="_blank"
                >
                  {mintTxHash}
                </Link>
              }
            />
          )}
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        <NumberFormatText
          value={mintAmountFormatted}
          spacedSuffix={lockAssetConfig.fullName}
        />
      </Typography>
      <ActionButtonWrapper>
        {lockTxId !== null && lockTxUrl !== null && (
          <TransactionDetailsButton
            label={lockChainConfig.shortName || lockChainConfig.fullName}
            address={lockTxId}
            link={lockTxUrl}
          />
        )}
      </ActionButtonWrapper>
    </>
  );
};

type MintCompletedStatusProps = {
  gateway: Gateway;
  lockTxUrl: string | null;
  lockAmount: string | null;
  lockAssetDecimals: string | null;
  mintAmount: string | null;
  mintAssetDecimals: number | null;
  mintTxUrl: string | null;
};

export const MintCompletedStatus: FunctionComponent<
  MintCompletedStatusProps
> = ({
  gateway,
  lockAmount,
  lockAssetDecimals,
  lockTxUrl,
  mintTxUrl,
  mintAmount,
  mintAssetDecimals,
}) => {
  const { t } = useTranslation();
  const { from, to, asset } = getGatewayParams(gateway);
  useSetPaperTitle(t("mint.complete-title"));
  const { wallet } = useCurrentChainWallet();
  const walletConfig = getWalletConfig(wallet);
  const lockAssetConfig = getAssetConfig(asset);
  const mintChainConfig = getChainConfig(to);

  const { handleGoToHome } = useBasicRouteHandlers();

  const mintAmountFormatted = decimalsAmount(mintAmount, mintAssetDecimals);
  const lockAmountFormatted = decimalsAmount(lockAmount, lockAssetDecimals);

  const notificationMessage = t("mint.success-notification-message", {
    total: mintAmountFormatted,
    currency: lockAssetConfig.shortName,
    chain: mintChainConfig.fullName,
  });
  const viewChainTxLinkMessage = t("tx.view-chain-transaction-link-text", {
    chain: mintChainConfig.fullName,
  });
  const { txSuccessNotification } = useTxSuccessNotification(
    mintTxUrl,
    notificationMessage,
    viewChainTxLinkMessage
  );

  useEffectOnce(txSuccessNotification);

  const walletTokenMeta = useWalletAssetHelpers(
    gateway.params.to.chain,
    gateway.params.asset
  );
  const { addToken } = walletTokenMeta;

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent>
          <BigDoneIcon />
        </ProgressWithContent>
      </ProgressWrapper>
      <SentReceivedSection
        ioType={GatewayIOType.lockAndMint}
        asset={asset}
        sentAmount={lockAmountFormatted}
        receivedAmount={mintAmountFormatted}
      />
      <MultipleActionButtonWrapper>
        {addToken !== null && (
          <Box mb={1}>
            <AddTokenButton
              onAddToken={addToken}
              wallet={walletConfig.shortName || walletConfig.fullName}
              currency={lockAssetConfig.shortName}
            />
          </Box>
        )}
        <ActionButton onClick={handleGoToHome}>
          {t("navigation.back-to-home-label")}
        </ActionButton>
      </MultipleActionButtonWrapper>
      <SmallTopWrapper>
        <FromToTxLinks
          from={from}
          to={to}
          fromTxUrl={lockTxUrl}
          toTxUrl={mintTxUrl}
        />
      </SmallTopWrapper>
      <Debug it={{ walletTokenMeta }} />
    </>
  );
};
