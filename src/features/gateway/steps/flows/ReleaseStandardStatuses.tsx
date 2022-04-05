import { Divider, Typography } from "@material-ui/core";
import { Gateway } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import BigNumber from "bignumber.js";
import React, { FunctionComponent, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useEffectOnce } from "react-use";
import {
  ActionButton,
  ActionButtonWrapper,
  MultipleActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { MediumTopWrapper } from "../../../../components/layout/LayoutHelpers";
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
import { trimAddress } from "../../../../utils/strings";
import { useBrowserNotifications } from "../../../notifications/notificationsUtils";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { AddressInfo } from "../../../transactions/components/TransactionsHistoryHelpers";
import { BalanceInfo } from "../../components/BalanceHelpers";
import { FeesToggler } from "../../components/FeeHelpers";
import {
  RenVMReleasingInfo,
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
  const { asset, amount, toAddress } = getGatewayParams(gateway);
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
        <BalanceInfo balance={balance} asset={renAssetConfig.shortName} />
        <SendingReceivingSection
          isRelease
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
      <PaperContent darker bottomPadding>
        <MediumTopWrapper>
          <FeesToggler>{Fees}</FeesToggler>
        </MediumTopWrapper>
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
  outputAmount: string | null;
  outputAmountUsd: string | null;
  burnStatus: ChainTransactionStatus | null;
  burnConfirmations: number | null;
  burnTargetConfirmations: number | null;
  renVMStatus: ChainTransactionStatus | null;
  // releaseStatus: ChainTransactionStatus | null;
};

export const ReleaseStandardBurnProgressStatus: FunctionComponent<
  ReleaseStandardBurnProgressStatusProps
> = ({
  gateway,
  Fees,
  outputAmount,
  outputAmountUsd,
  burnConfirmations,
  burnTargetConfirmations,
  renVMStatus,
  // releaseStatus
}) => {
  const { t } = useTranslation();
  const { asset, from, amount, fromAverageConfirmationTime } =
    getGatewayParams(gateway);
  const burnChainConfig = getChainConfig(from);

  const BurnChainIcon = burnChainConfig.Icon;

  return (
    <>
      <PaperContent bottomPadding>
        {renVMStatus !== null ? ( //TODO: why null?? confirming
          <ProgressWrapper>
            <ProgressWithContent processing>
              <RenVMSubmittingInfo />
            </ProgressWithContent>
          </ProgressWrapper>
        ) : (
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
  burnAssetDecimals: number | null;
  burnTxUrl: string | null;
  releaseAmount: string | null;
  releaseAssetDecimals: number | null;
  releaseTxUrl: string | null;
  // releaseStatus: ChainTransactionStatus | null;
};

export const ReleaseStandardCompletedStatus: FunctionComponent<
  ReleaseStandardCompletedStatusProps
> = ({
  gateway,
  burnTxUrl,
  burnAmount,
  burnAssetDecimals,
  releaseTxUrl,
  releaseAmount,
  releaseAssetDecimals,
  // releaseStatus,
}) => {
  const { t } = useTranslation();
  useSetPaperTitle(t("release.completed-title"));
  const { from, to, asset } = getGatewayParams(gateway);
  const burnAssetConfig = getAssetConfig(gateway.params.asset);
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
        currency: burnAssetConfig.shortName,
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
    releaseChainConfig,
    burnAssetConfig,
    releaseTxUrl,
    t,
  ]);

  useEffectOnce(showNotifications);

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
        isRelease
        receivedAmount={releaseAmountFormatted}
        asset={asset}
        sentAmount={burnAmountFormatted}
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
