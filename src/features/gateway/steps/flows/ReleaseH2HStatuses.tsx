import { Divider } from "@material-ui/core";
import { Gateway } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, { FunctionComponent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useEffectOnce } from "react-use";
import {
  ActionButton,
  ActionButtonWrapper,
  MultipleActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { PaperContent } from "../../../../components/layout/Paper";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../../../../components/progress/ProgressHelpers";
import { useSetPaperTitle } from "../../../../providers/TitleProviders";
import {
  getAssetConfig,
  getRenAssetConfig,
} from "../../../../utils/assetsConfig";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { undefinedForNull } from "../../../../utils/propsUtils";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { useTxSuccessNotification } from "../../../transactions/transactionsHooks";
import { BalanceInfo } from "../../components/BalanceHelpers";
import { FeesToggler } from "../../components/FeeHelpers";
import { WalletNetworkSwitchMessage } from "../../components/HostToHostHelpers";
import {
  RenVMSubmittingInfo,
  TransactionProgressInfo,
} from "../../components/TransactionProgressHelpers";
import {
  GatewayIOType,
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
import { WalletConnectionActionButtonGuard } from "../shared/WalletSwitchHelpers";

type ReleaseH2HBurnTransactionStatusProps = SubmittingProps & {
  gateway: Gateway;
  Fees: ReactNode | null;
  burnAmount: string | null;
  releaseAmount: string | null;
  releaseAmountUsd: string | null;
  burnStatus: ChainTransactionStatus | null;
  burnConfirmations: number | null;
  burnTargetConfirmations: number | null;
  ioType: GatewayIOType;
};

export const ReleaseH2HBurnTransactionStatus: FunctionComponent<
  ReleaseH2HBurnTransactionStatusProps
> = ({
  gateway,
  Fees,
  burnStatus,
  burnConfirmations,
  burnTargetConfirmations,
  burnAmount,
  releaseAmountUsd,
  releaseAmount,
  onSubmit,
  onReset,
  submitting,
  waiting,
  done,
  errorSubmitting,
  submittingDisabled,
  ioType,
}) => {
  const { t } = useTranslation();
  const { asset, from, fromAverageConfirmationTime } =
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
          ioType={ioType}
          asset={asset}
          sendingAmount={burnAmount}
          receivingAmount={releaseAmount}
          receivingAmountUsd={releaseAmountUsd}
        />
        <WalletNetworkSwitchMessage />
      </PaperContent>
      <Divider />
      <PaperContent darker bottomPadding topPadding>
        <FeesToggler>{Fees}</FeesToggler>
        <ActionButtonWrapper>
          <WalletConnectionActionButtonGuard chain={from}>
            <ActionButton
              onClick={onSubmit}
              disabled={submittingDisabled || submitting || waiting || done}
            >
              {submitting || waiting
                ? t("gateway.submitting-tx-label")
                : t("gateway.submit-tx-label")}
            </ActionButton>
          </WalletConnectionActionButtonGuard>
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
  burnAmount: string | null;
  renVMStatus: ChainTransactionStatus | null;
  releaseAmount: string | null;
  releaseAmountUsd: string | null;
  releaseStatus: ChainTransactionStatus | null;
  releaseConfirmations: number | null;
  releaseTargetConfirmations: number | null;
  ioType: GatewayIOType;
};

export const ReleaseH2HReleaseTransactionStatus: FunctionComponent<
  ReleaseH2HReleaseTransactionStatusProps
> = ({
  gateway,
  Fees,
  burnAmount,
  renVMStatus,
  releaseAmount,
  releaseAmountUsd,
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
  ioType,
}) => {
  const { t } = useTranslation();
  const { asset, to, fromAverageConfirmationTime } = getGatewayParams(gateway);
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
          ioType={ioType}
          asset={asset}
          sendingAmount={burnAmount}
          receivingAmount={releaseAmount}
          receivingAmountUsd={releaseAmountUsd}
        />
      </PaperContent>
      <Divider />
      <PaperContent topPadding darker bottomPadding>
        <FeesToggler>{Fees}</FeesToggler>
        <MultipleActionButtonWrapper>
          <WalletConnectionActionButtonGuard chain={to}>
            <ActionButton
              onClick={onSubmit}
              disabled={submittingDisabled || submitting || waiting || done}
            >
              {submitting || waiting
                ? t("gateway.submitting-tx-label")
                : t("gateway.submit-tx-label")}
            </ActionButton>
          </WalletConnectionActionButtonGuard>
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
  burnTxUrl: string | null;
  releaseAmount: string | null;
  releaseTxUrl: string | null;
  ioType: GatewayIOType;
};

export const ReleaseH2HCompletedStatus: FunctionComponent<
  ReleaseH2HCompletedStatusProps
> = ({
  gateway,
  burnTxUrl,
  burnAmount,
  releaseTxUrl,
  releaseAmount,
  ioType,
}) => {
  const { t } = useTranslation();
  useSetPaperTitle(t("common.completed-title"));
  const { from, to, asset } = getGatewayParams(gateway);
  const releaseAssetConfig = getAssetConfig(gateway.params.asset);
  const releaseChainConfig = getChainConfig(gateway.params.to.chain);

  const notificationMessage = t("move.success-notification-message", {
    amount: burnAmount,
    currency: releaseAssetConfig.shortName,
  });
  const viewChainTxLinkMessage = t("tx.view-chain-transaction-link-text", {
    chain: releaseChainConfig.fullName,
  });
  const { txSuccessNotification } = useTxSuccessNotification(
    releaseTxUrl,
    notificationMessage,
    viewChainTxLinkMessage
  );

  useEffectOnce(txSuccessNotification); //TODO: refactor

  return (
    <PaperContent bottomPadding>
      <ChainProgressDone chain={from} />
      <SentReceivedSection
        ioType={ioType}
        asset={asset}
        sentAmount={burnAmount}
        receivedAmount={releaseAmount}
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
