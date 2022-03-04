import { Box, Typography, useTheme } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import BigNumber from "bignumber.js";
import {
  FunctionComponent,
  ReactText,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
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
  SmallWrapper,
} from "../../../../components/layout/LayoutHelpers";
import { Link } from "../../../../components/links/Links";
import {
  BigDoneIcon,
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusInfo,
} from "../../../../components/progress/ProgressHelpers";
import { BigAssetAmount } from "../../../../components/typography/TypographyHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import { useNotifications } from "../../../../providers/Notifications";
import {
  usePaperTitle,
  useSetActionRequired,
  useSetPaperTitle,
} from "../../../../providers/TitleProviders";
import { orangeLight } from "../../../../theme/colors";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { getHours } from "../../../../utils/dates";
import { undefinedForNull } from "../../../../utils/propsUtils";
import { getRemainingTime } from "../../../../utils/time";
import {
  getAssetConfig,
  getRenAssetFullName,
} from "../../../../utils/tokensConfig";
import { getWalletConfig } from "../../../../utils/walletsConfig";
import { useBrowserNotifications } from "../../../notifications/notificationsUtils";
import {
  ProcessingTimeWrapper,
  SubmitErrorDialog,
} from "../../../transactions/components/TransactionsHelpers";
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
import { getGatewayParams } from "../../gatewayHooks";
import { maxConfirmations } from "../../gatewayTransactionUtils";
import { GATEWAY_EXPIRY_OFFSET_MS } from "../../gatewayUtils";

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
  const lockAmountFormatted =
    lockAmount !== null && lockAssetDecimals !== null
      ? new BigNumber(lockAmount).shiftedBy(-lockAssetDecimals).toString()
      : null;
  const lockProcessingTime = 500;

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
          color={lockAssetConfig.color || orangeLight}
          confirmations={undefinedForNull(lockConfirmations)}
          targetConfirmations={undefinedForNull(lockTargetConfirmations)}
        >
          <Icon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <SmallWrapper>
        <Typography variant="body1" align="center">
          {lockConfirmations !== null && lockTargetConfirmations !== null ? (
            <>
              {t("tx.confirmations-of-target-counter-message", {
                confirmations: lockConfirmations,
                target: lockTargetConfirmations,
              })}
            </>
          ) : (
            <Skeleton variant="text" width={120} height={14} />
          )}
        </Typography>
      </SmallWrapper>
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
      <ProcessingTimeWrapper>
        <Typography variant="caption" component="p" align="center">
          Estimated time remaining: {lockProcessingTime} minutes
        </Typography>
      </ProcessingTimeWrapper>
    </>
  );
};

type MintDepositAcceptedStatusProps = {
  gateway: Gateway;
  transaction: GatewayTransaction;
  expiryTime: number;
  lockTargetConfirmations: number | null;
  lockConfirmations: number | null;
  lockAmount: string | null;
  lockAssetDecimals: number | null;
  lockTxId: string | null;
  lockTxUrl: string | null;
  onSubmit: () => void;
  onReload: () => void;
  onRetry: () => void;
  submitting: boolean;
  submittingError?: Error | string;
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
  onReload,
  onRetry,
  renVMSubmitting,
}) => {
  const { t } = useTranslation();
  useSetPaperTitle(t("mint.deposit-accepted-submit-title"));
  useSetActionRequired(true);
  const theme = useTheme();
  const lockAssetConfig = getAssetConfig(gateway.params.asset);
  const lockChainConfig = getChainConfig(gateway.params.from.chain);
  const mintChainConfig = getChainConfig(gateway.params.to.chain);

  const lockAmountFormatted =
    lockAmount !== null && lockAssetDecimals !== null
      ? new BigNumber(lockAmount).shiftedBy(-lockAssetDecimals).toString()
      : null;

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

  const { Icon } = lockChainConfig;

  return (
    <>
      <ProgressWrapper>
        {submitting || renVMSubmitting ? (
          <ProgressWithContent color={theme.customColors.skyBlue} processing>
            {renVMSubmitting ? (
              <RenVMSubmittingInfo />
            ) : (
              <Icon fontSize="inherit" color="inherit" />
            )}
          </ProgressWithContent>
        ) : (
          <ProgressWithContent
            color={lockAssetConfig.color || theme.customColors.skyBlue}
            confirmations={undefinedForNull(lockConfirmations)}
            targetConfirmations={undefinedForNull(lockTargetConfirmations)}
          >
            <Icon fontSize="inherit" color="inherit" />
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
        <ActionButton onClick={onSubmit} disabled={submitting}>
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
        onAlternativeAction={onRetry}
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
  const mintAmountFormatted =
    mintAmount !== null && mintAssetDecimals !== null
      ? new BigNumber(mintAmount).shiftedBy(-mintAssetDecimals).toString()
      : null;
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
  mintAssetDecimals: number | null;
  mintAmount: string | null;
  mintTxUrl: string | null;
};

export const MintCompletedStatus: FunctionComponent<
  MintCompletedStatusProps
> = ({ gateway, lockTxUrl, mintTxUrl, mintAmount, mintAssetDecimals }) => {
  const { t } = useTranslation();
  useSetPaperTitle(t("mint.complete-title"));
  const history = useHistory();
  const { wallet } = useCurrentChainWallet();
  const walletConfig = getWalletConfig(wallet);
  const lockAssetConfig = getAssetConfig(gateway.params.asset);
  const lockChainConfig = getChainConfig(gateway.params.from.chain);
  const mintChainConfig = getChainConfig(gateway.params.to.chain);

  const handleGoToHome = useCallback(() => {
    history.push({
      pathname: paths.HOME,
    });
  }, [history]);

  const { showNotification } = useNotifications();
  const { showBrowserNotification } = useBrowserNotifications();

  const mintAmountFormatted =
    mintAmount !== null && mintAssetDecimals !== null
      ? new BigNumber(mintAmount).shiftedBy(-mintAssetDecimals).toString()
      : null;

  const showNotifications = useCallback(() => {
    if (mintTxUrl !== null) {
      const notificationMessage = t("mint.success-notification-message", {
        total: mintAmountFormatted,
        currency: lockAssetConfig.shortName,
        chain: mintChainConfig.fullName,
      });
      showNotification(
        <span>
          {notificationMessage}{" "}
          <Link external href={mintTxUrl}>
            {t("tx.view-chain-transaction-link-text", {
              chain: mintChainConfig.fullName,
            })}
          </Link>
        </span>
      );
      showBrowserNotification(notificationMessage);
    }
  }, [
    showNotification,
    showBrowserNotification,
    mintAmountFormatted,
    mintChainConfig,
    lockAssetConfig,
    mintTxUrl,
    t,
  ]);

  useEffectOnce(showNotifications);

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
      <Typography variant="body1" align="center" gutterBottom>
        {t("tx.you-received-message")}{" "}
        <NumberFormatText
          value={mintAmountFormatted}
          spacedSuffix={lockAssetConfig.shortName}
        />
        !
      </Typography>
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
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" py={2}>
        {lockTxUrl !== null && (
          <Link
            external
            color="primary"
            variant="button"
            underline="hover"
            href={lockTxUrl}
          >
            {lockChainConfig.fullName} {t("common.transaction")}
          </Link>
        )}
        {mintTxUrl !== null && (
          <Link
            external
            color="primary"
            variant="button"
            underline="hover"
            href={mintTxUrl}
          >
            {mintChainConfig.fullName} {t("common.transaction")}
          </Link>
        )}
      </Box>
      <Debug it={{ walletTokenMeta }} />
    </>
  );
};
