import { Box, Divider, Typography } from "@material-ui/core";
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
import { MediumTopWrapper } from "../../../../components/layout/LayoutHelpers";
import { PaperContent } from "../../../../components/layout/Paper";
import {
  ProgressWithContent,
  ProgressWrapper,
  RenvmRevertedIndicator,
} from "../../../../components/progress/ProgressHelpers";
import { useSetPaperTitle } from "../../../../providers/TitleProviders";
import {
  getAssetConfig,
  getRenAssetConfig,
} from "../../../../utils/assetsConfig";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { undefinedForNull } from "../../../../utils/propsUtils";
import { trimAddress } from "../../../../utils/strings";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { AddressInfo } from "../../../transactions/components/TransactionsHistoryHelpers";
import { useTxSuccessNotification } from "../../../transactions/transactionsHooks";
import { BalanceInfo } from "../../components/BalanceHelpers";
import { FeesToggler } from "../../components/FeeHelpers";
import {
  RenVMReleasingInfo,
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

type ReleaseStandardBurnStatusProps = SubmittingProps & {
  gateway: Gateway;
  Fees: ReactNode | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
  burnStatus: ChainTransactionStatus | null;
  account: string;
};

export const ReleaseStandardBurnStatus: FunctionComponent<
  ReleaseStandardBurnStatusProps
> = ({
  gateway,
  Fees,
  outputAmountUsd,
  outputAmount,
  onSubmit,
  onReset,
  submitting,
  waiting,
  done,
  errorSubmitting,
  account,
  submittingDisabled,
}) => {
  const { t } = useTranslation();
  const { from, asset, amount, toAddress } = getGatewayParams(gateway);
  const renAssetConfig = getRenAssetConfig(asset);
  const { balance } = useContractChainAssetBalance(
    gateway.fromChain,
    asset,
    account
  );

  const showBalanceError = false;
  // TODO: finishe when solana stuff done
  // const hasBalance = balance !== null;
  // const showBalanceError = hasBalance && new BigNumber(amount).isGreaterThan(balance);

  return (
    <>
      <PaperContent bottomPadding>
        <BalanceInfo
          balance={balance}
          asset={renAssetConfig.shortName}
          chain={from}
        />
        <SendingReceivingSection
          ioType={GatewayIOType.burnAndRelease}
          asset={asset}
          sendingAmount={amount}
          receivingAmount={outputAmount}
          receivingAmountUsd={outputAmountUsd}
        />
        <MediumTopWrapper>
          <AddressInfo
            address={toAddress}
            addressUrl={gateway.toChain.addressExplorerLink(toAddress)}
            label="Recipient Address"
          />
        </MediumTopWrapper>
      </PaperContent>
      <Divider />
      <PaperContent darker bottomPadding topPadding>
        <FeesToggler>{Fees}</FeesToggler>
        <ActionButtonWrapper>
          <ActionButton
            onClick={onSubmit}
            disabled={
              submittingDisabled ||
              submitting ||
              waiting ||
              done ||
              showBalanceError
            }
          >
            {submitting || waiting
              ? t("gateway.submitting-tx-label")
              : t("gateway.submit-tx-label")}
          </ActionButton>
        </ActionButtonWrapper>
        {showBalanceError && (
          <Typography variant="body2" color="error" align="center">
            {t("tx.submitting-error-insufficient-address-balance-text", {
              asset: renAssetConfig.shortName,
              address: trimAddress(account),
            })}
          </Typography>
        )}
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

type ReleaseStandardBurnProgressStatusProps = {
  gateway: Gateway;
  Fees: ReactNode | null;
  burnAmount: string | number | null;
  burnStatus: ChainTransactionStatus | null;
  burnConfirmations: number | null;
  burnTargetConfirmations: number | null;
  releaseAmount: string | null;
  releaseAmountUsd: string | null;
  renVMStatus: ChainTransactionStatus | null;
  // releaseStatus: ChainTransactionStatus | null;
};

export const ReleaseStandardBurnProgressStatus: FunctionComponent<
  ReleaseStandardBurnProgressStatusProps
> = ({
  gateway,
  Fees,
  burnAmount,
  burnConfirmations,
  burnTargetConfirmations,
  releaseAmount,
  releaseAmountUsd,
  renVMStatus,
  // releaseStatus
}) => {
  const { t } = useTranslation();
  const { asset, from, fromAverageConfirmationTime } =
    getGatewayParams(gateway);
  const burnChainConfig = getChainConfig(from);

  const BurnChainIcon = burnChainConfig.Icon;

  return (
    <>
      <PaperContent bottomPadding>
        {renVMStatus === null && (
          <>
            <ProgressWrapper>
              <ProgressWithContent
                confirmations={undefinedForNull(burnConfirmations)}
                targetConfirmations={undefinedForNull(burnTargetConfirmations)}
              >
                <BurnChainIcon fontSize="inherit" />
              </ProgressWithContent>
            </ProgressWrapper>
            <TransactionProgressInfo
              confirmations={burnConfirmations}
              target={burnTargetConfirmations}
              averageConfirmationTime={fromAverageConfirmationTime}
            />
          </>
        )}
        {renVMStatus === ChainTransactionStatus.Reverted && (
          <Box mt={3} mb={3}>
            <RenvmRevertedIndicator></RenvmRevertedIndicator>
          </Box>
        )}
        {renVMStatus !== null &&
          renVMStatus !== ChainTransactionStatus.Reverted && (
            <ProgressWrapper>
              <ProgressWithContent processing>
                <RenVMSubmittingInfo />
              </ProgressWithContent>
            </ProgressWrapper>
          )}

        <SendingReceivingSection
          ioType={GatewayIOType.burnAndRelease}
          asset={asset}
          sendingAmount={burnAmount}
          receivingAmount={releaseAmount}
          receivingAmountUsd={releaseAmountUsd}
        />
      </PaperContent>
      <Divider />
      <PaperContent darker bottomPadding topPadding>
        <FeesToggler>{Fees}</FeesToggler>
        <MultipleActionButtonWrapper>
          <ActionButton disabled>
            {t("release.releasing-assets-label")}...
          </ActionButton>
        </MultipleActionButtonWrapper>
      </PaperContent>
    </>
  );
};

type ReleaseStandardCompletedStatusProps = {
  gateway: Gateway;
  burnAmount: string | null;
  burnTxUrl: string | null;
  releaseAmount: string | null;
  releaseTxUrl: string | null;
  // releaseStatus: ChainTransactionStatus | null;
};

export const ReleaseStandardCompletedStatus: FunctionComponent<
  ReleaseStandardCompletedStatusProps
> = ({
  gateway,
  burnTxUrl,
  burnAmount,
  releaseTxUrl,
  releaseAmount,
  // releaseStatus,
}) => {
  const { t } = useTranslation();
  useSetPaperTitle(t("common.completed-title"));
  const { from, to, asset } = getGatewayParams(gateway);
  const burnAssetConfig = getAssetConfig(gateway.params.asset);
  const releaseChainConfig = getChainConfig(gateway.params.to.chain);

  const notificationMessage = t("release.success-notification-message", {
    amount: releaseAmount,
    currency: burnAssetConfig.shortName,
  });
  const viewChainTxLinkMessage = t("tx.view-chain-transaction-link-text", {
    chain: releaseChainConfig.fullName,
  });
  const { txSuccessNotification } = useTxSuccessNotification(
    releaseTxUrl,
    notificationMessage,
    viewChainTxLinkMessage
  );

  useEffectOnce(txSuccessNotification);

  return (
    <PaperContent bottomPadding>
      {releaseTxUrl === null ? (
        <ProgressWrapper>
          <ProgressWithContent processing>
            <RenVMReleasingInfo />
          </ProgressWithContent>
        </ProgressWrapper>
      ) : (
        <ChainProgressDone chain={to} />
      )}
      <SentReceivedSection
        ioType={GatewayIOType.burnAndRelease}
        receivedAmount={releaseAmount}
        asset={asset}
        sentAmount={burnAmount}
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
