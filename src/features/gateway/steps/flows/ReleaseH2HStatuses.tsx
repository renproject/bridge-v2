import { Divider } from "@material-ui/core";
import { Gateway } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, { FunctionComponent, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useEffectOnce } from "react-use";
import {
  ActionButton,
  ActionButtonWrapper,
  MultipleActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { PaperContent } from "../../../../components/layout/Paper";
import { Link } from "../../../../components/links/Links";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../../../../components/progress/ProgressHelpers";
import { useNotifications } from "../../../../providers/Notifications";
import { useSetPaperTitle } from "../../../../providers/TitleProviders";
import {
  getAssetConfig,
  getRenAssetConfig,
} from "../../../../utils/assetsConfig";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { decimalsAmount } from "../../../../utils/numbers";
import { undefinedForNull } from "../../../../utils/propsUtils";
import { useBrowserNotifications } from "../../../notifications/notificationsUtils";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { BalanceInfo } from "../../components/BalanceHelpers";
import { FeesToggler } from "../../components/FeeHelpers";
import { WalletNetworkSwitchMessage } from "../../components/HostToHostHelpers";
import {
  RenVMSubmittingInfo,
  TransactionProgressInfo,
} from "../../components/TransactionProgressHelpers";
import {
  getGatewayParams,
  useContractChainAssetBalance,
} from "../../gatewayHooks";
import { SubmittingProps } from "../shared/SubmissionHelpers";
import {
  ChainProgressDone,
  FromToTxLinks,
  GoToHomeActionButton,
  SendingReceivingSection,
  SentReceivedSection,
} from "../shared/TransactionStatuses";

type ReleaseH2HBurnTransactionStatusProps = SubmittingProps & {
  gateway: Gateway;
  Fees: ReactNode | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
  burnStatus: ChainTransactionStatus | null;
  burnConfirmations: number | null;
  burnTargetConfirmations: number | null;
};

export const ReleaseH2HBurnTransactionStatus: FunctionComponent<
  ReleaseH2HBurnTransactionStatusProps
> = ({
  gateway,
  Fees,
  burnStatus,
  burnConfirmations,
  burnTargetConfirmations,
  outputAmountUsd,
  outputAmount,
  onSubmit,
  onReset,
  submitting,
  waiting,
  done,
  errorSubmitting,
  submittingDisabled,
}) => {
  const { t } = useTranslation();
  const { asset, amount, from, fromAverageConfirmationTime } =
    getGatewayParams(gateway);
  const fromChainConfig = getChainConfig(from);
  const renAssetConfig = getRenAssetConfig(asset);
  const { balance, error } = useContractChainAssetBalance(
    gateway.fromChain,
    asset
  );

  const { Icon: ChainIcon } = fromChainConfig;

  const showProgress =
    burnConfirmations !== null && burnTargetConfirmations !== null;

  return (
    <>
      <PaperContent bottomPadding>
        {!showProgress && (
          <BalanceInfo
            balance={balance}
            asset={renAssetConfig.shortName}
            chain={from}
            error={error}
          />
        )}
        {showProgress && (
          <>
            <ProgressWrapper>
              <ProgressWithContent
                confirmations={undefinedForNull(burnConfirmations)}
                targetConfirmations={undefinedForNull(burnTargetConfirmations)}
                color={fromChainConfig.color}
              >
                <ChainIcon fontSize="inherit" />
              </ProgressWithContent>
            </ProgressWrapper>
            <TransactionProgressInfo
              confirmations={burnConfirmations}
              target={burnTargetConfirmations}
              averageConfirmationTime={fromAverageConfirmationTime}
            />
          </>
        )}
        <SendingReceivingSection
          isRelease
          asset={asset}
          sendingAmount={amount}
          receivingAmount={outputAmount}
          receivingAmountUsd={outputAmountUsd}
        />
        <WalletNetworkSwitchMessage />
      </PaperContent>
      <Divider />
      <PaperContent darker bottomPadding topPadding>
        <FeesToggler>{Fees}</FeesToggler>
        <ActionButtonWrapper>
          <ActionButton
            onClick={onSubmit}
            disabled={submittingDisabled || submitting || waiting || done}
          >
            {submitting || waiting
              ? t("gateway.submitting-tx-label")
              : t("gateway.submit-tx-label")}
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
      {errorSubmitting && (
        <SubmitErrorDialog
          open={true}
          error={errorSubmitting}
          onAction={onReset}
        />
      )}
    </>
  );
};

type ReleaseH2HReleaseTransactionStatusProps = SubmittingProps & {
  gateway: Gateway;
  Fees: ReactNode | null;
  renVMStatus: ChainTransactionStatus | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
  releaseStatus: ChainTransactionStatus | null;
  releaseConfirmations: number | null;
  releaseTargetConfirmations: number | null;
};

export const ReleaseH2HReleaseTransactionStatus: FunctionComponent<
  ReleaseH2HReleaseTransactionStatusProps
> = ({
  gateway,
  Fees,
  renVMStatus,
  outputAmount,
  outputAmountUsd,
  releaseConfirmations,
  releaseTargetConfirmations,
  releaseStatus,
  onSubmit,
  onReset,
  submitting,
  submittingDisabled,
  waiting,
  done,
  errorSubmitting,
}) => {
  const { t } = useTranslation();
  const { asset, to, amount, fromAverageConfirmationTime } =
    getGatewayParams(gateway);
  const releaseChainConfig = getChainConfig(to);
  const { Icon: ChainIcon } = releaseChainConfig;

  return (
    <>
      <PaperContent bottomPadding>
        {renVMStatus === ChainTransactionStatus.Confirming ? (
          <ProgressWrapper>
            <ProgressWithContent processing>
              <RenVMSubmittingInfo />
            </ProgressWithContent>
          </ProgressWrapper>
        ) : (
          <>
            <ProgressWrapper>
              <ProgressWithContent
                confirmations={undefinedForNull(releaseConfirmations)}
                targetConfirmations={releaseTargetConfirmations}
                color={releaseChainConfig.color}
              >
                <ChainIcon fontSize="inherit" />
              </ProgressWithContent>
            </ProgressWrapper>
            <TransactionProgressInfo
              confirmations={releaseConfirmations}
              target={releaseTargetConfirmations}
              averageConfirmationTime={fromAverageConfirmationTime}
            />
          </>
        )}
        <SendingReceivingSection
          isRelease
          asset={asset}
          sendingAmount={amount}
          receivingAmount={outputAmount}
          receivingAmountUsd={outputAmountUsd}
        />
      </PaperContent>
      <Divider />
      <PaperContent topPadding darker bottomPadding>
        <FeesToggler>{Fees}</FeesToggler>
        <MultipleActionButtonWrapper>
          <ActionButton
            onClick={onSubmit}
            disabled={submittingDisabled || submitting || waiting || done}
          >
            {submitting || waiting
              ? t("gateway.submitting-tx-label")
              : t("gateway.submit-tx-label")}
          </ActionButton>
        </MultipleActionButtonWrapper>
      </PaperContent>
      {errorSubmitting && (
        <SubmitErrorDialog
          open={true}
          error={errorSubmitting}
          onAction={onReset}
        />
      )}
    </>
  );
};

type ReleaseH2HCompletedStatusProps = {
  gateway: Gateway;
  burnAmount: string | null;
  burnAssetDecimals: number | null;
  burnTxUrl: string | null;
  releaseAmount: string | null;
  releaseAssetDecimals: number | null;
  releaseTxUrl: string | null;
};

export const ReleaseH2HCompletedStatus: FunctionComponent<
  ReleaseH2HCompletedStatusProps
> = ({
  gateway,
  burnTxUrl,
  burnAmount,
  burnAssetDecimals,
  releaseTxUrl,
  releaseAmount,
  releaseAssetDecimals,
}) => {
  const { t } = useTranslation();
  useSetPaperTitle(t("release.completed-title"));
  const { from, to, asset } = getGatewayParams(gateway);
  const releaseAssetConfig = getAssetConfig(gateway.params.asset);
  const releaseChainConfig = getChainConfig(gateway.params.to.chain);

  const burnAmountFormatted = decimalsAmount(burnAmount, burnAssetDecimals);
  const releaseAmountFormatted = decimalsAmount(
    releaseAmount,
    releaseAssetDecimals
  );

  const { showNotification } = useNotifications();
  const { showBrowserNotification } = useBrowserNotifications();

  const showNotifications = useCallback(() => {
    if (releaseTxUrl !== null) {
      const notificationMessage = t("release.success-notification-message", {
        amount: releaseAmountFormatted,
        currency: releaseAssetConfig.shortName,
      });
      showNotification(
        <span>
          {notificationMessage}{" "}
          <Link external href={releaseTxUrl}>
            {t("tx.view-chain-transaction-link-text", {
              chain: releaseChainConfig.fullName,
            })}
          </Link>
        </span>
      );
      showBrowserNotification(notificationMessage);
    }
  }, [
    showNotification,
    showBrowserNotification,
    releaseAmountFormatted,
    releaseAssetConfig,
    releaseChainConfig,
    releaseTxUrl,
    t,
  ]);

  useEffectOnce(showNotifications); //TODO: refactor

  return (
    <PaperContent bottomPadding>
      <ChainProgressDone chain={from} />
      <SentReceivedSection
        isRelease
        asset={asset}
        sentAmount={burnAmountFormatted}
        receivedAmount={releaseAmountFormatted}
      />
      <FromToTxLinks
        from={from}
        to={to}
        fromTxUrl={burnTxUrl}
        toTxUrl={releaseTxUrl}
      />
      <GoToHomeActionButton />
    </PaperContent>
  );
};
