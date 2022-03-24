import { Box, Divider, Typography } from "@material-ui/core";
import { Gateway } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import BigNumber from "bignumber.js";
import React, { FunctionComponent, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useEffectOnce } from "react-use";
import {
  ActionButton,
  ActionButtonWrapper,
  MultipleActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../../components/formatting/NumberFormatText";
import { MediumTopWrapper } from "../../../../components/layout/LayoutHelpers";
import { PaperContent } from "../../../../components/layout/Paper";
import { Link } from "../../../../components/links/Links";
import {
  BigDoneIcon,
  ProgressWithContent,
  ProgressWrapper,
} from "../../../../components/progress/ProgressHelpers";
import {
  AssetInfo,
  SimpleAssetInfo,
} from "../../../../components/typography/TypographyHelpers";
import { paths } from "../../../../pages/routes";
import { useNotifications } from "../../../../providers/Notifications";
import { useSetPaperTitle } from "../../../../providers/TitleProviders";
import {
  getAssetConfig,
  getRenAssetConfig,
} from "../../../../utils/assetsConfig";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { feesDecimalImpact } from "../../../../utils/numbers";
import { undefinedForNull } from "../../../../utils/propsUtils";
import { trimAddress } from "../../../../utils/strings";
import { useBrowserNotifications } from "../../../notifications/notificationsUtils";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { AddressInfo } from "../../../transactions/components/TransactionsHistoryHelpers";
import {
  BalanceInfo,
  UsdNumberFormatText,
} from "../../components/BalanceHelpers";
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
}) => {
  const { t } = useTranslation();
  const { asset, amount, toAddress } = getGatewayParams(gateway);
  const assetConfig = getAssetConfig(asset);
  const renAssetConfig = getRenAssetConfig(asset);
  const { Icon } = assetConfig;
  const { balance } = useContractChainAssetBalance(
    gateway.fromChain,
    asset,
    account
  );

  const hasBalance = balance !== null;
  const showBalanceError =
    hasBalance && new BigNumber(amount).isGreaterThan(balance);
  return (
    <>
      <PaperContent bottomPadding>
        <BalanceInfo balance={balance} asset={renAssetConfig.shortName} />
        <SimpleAssetInfo
          label={t("release.releasing-label")}
          value={amount}
          asset={renAssetConfig.shortName}
        />
        <MediumTopWrapper>
          <AssetInfo
            label={t("common.receiving-label")}
            value={
              <NumberFormatText
                value={outputAmount}
                spacedSuffix={assetConfig.shortName}
                decimalScale={feesDecimalImpact(amount)}
              />
            }
            valueEquivalent={
              <UsdNumberFormatText amountUsd={outputAmountUsd} />
            }
            Icon={<Icon fontSize="inherit" />}
          />
        </MediumTopWrapper>
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
              submitting || waiting || done || !hasBalance || showBalanceError
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
  const assetConfig = getAssetConfig(asset);
  const renAssetConfig = getRenAssetConfig(asset);
  const { RenIcon } = assetConfig;

  const BurnChainIcon = burnChainConfig.Icon;

  return (
    <>
      <PaperContent bottomPadding>
        {renVMStatus !== null ? (
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
        <SimpleAssetInfo
          label={t("release.releasing-label")}
          value={amount}
          asset={asset}
        />
        <MediumTopWrapper>
          <AssetInfo
            label={t("common.receiving-label")}
            value={
              <NumberFormatText
                value={outputAmount}
                spacedSuffix={renAssetConfig.shortName}
                decimalScale={feesDecimalImpact(amount)}
              />
            }
            valueEquivalent={
              <UsdNumberFormatText amountUsd={outputAmountUsd} />
            }
            Icon={<RenIcon fontSize="inherit" />}
          />
        </MediumTopWrapper>
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
  burnTxUrl: string | null;
  releaseAssetDecimals: number | null;
  releaseAmount: string | null;
  releaseTxUrl: string | null;
  // releaseStatus: ChainTransactionStatus | null;
};

export const ReleaseStandardCompletedStatus: FunctionComponent<
  ReleaseStandardCompletedStatusProps
> = ({
  gateway,
  burnTxUrl,
  releaseTxUrl,
  releaseAmount,
  releaseAssetDecimals,
  // releaseStatus,
}) => {
  const { t } = useTranslation();
  useSetPaperTitle(t("release.completed-title"));
  const history = useHistory();
  const burnAssetConfig = getAssetConfig(gateway.params.asset);
  const burnChainConfig = getChainConfig(gateway.params.from.chain);
  const releaseChainConfig = getChainConfig(gateway.params.to.chain);

  const handleGoToHome = useCallback(() => {
    history.push({
      pathname: paths.HOME,
    });
  }, [history]);

  const { showNotification } = useNotifications();
  const { showBrowserNotification } = useBrowserNotifications();

  const releaseAmountFormatted =
    releaseAmount !== null && releaseAssetDecimals !== null
      ? new BigNumber(releaseAmount).shiftedBy(-releaseAssetDecimals).toString()
      : null;

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
      <ProgressWrapper>
        <ProgressWithContent>
          {releaseTxUrl === null ? (
            <ProgressWithContent processing>
              <RenVMReleasingInfo />
            </ProgressWithContent>
          ) : (
            <ProgressWithContent>
              <BigDoneIcon />
            </ProgressWithContent>
          )}
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        {t("tx.you-received-message")}{" "}
        <NumberFormatText
          value={releaseAmountFormatted}
          spacedSuffix={burnAssetConfig.shortName}
        />
        !
      </Typography>
      <MultipleActionButtonWrapper>
        <ActionButton onClick={handleGoToHome}>
          {t("navigation.back-to-home-label")}
        </ActionButton>
      </MultipleActionButtonWrapper>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" py={2}>
        {burnTxUrl !== null && (
          <Link
            external
            color="primary"
            variant="button"
            underline="hover"
            href={burnTxUrl}
          >
            {burnChainConfig.fullName} {t("common.transaction")}
          </Link>
        )}
        {releaseTxUrl !== null && (
          <Link
            external
            color="primary"
            variant="button"
            underline="hover"
            href={releaseTxUrl}
          >
            {releaseChainConfig.fullName} {t("common.transaction")}
          </Link>
        )}
      </Box>
    </PaperContent>
  );
};
