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
  LabelWithValue,
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
import { useBrowserNotifications } from "../../../notifications/notificationsUtils";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import {
  BalanceInfo,
  UsdNumberFormatText,
} from "../../components/BalanceHelpers";
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
}) => {
  const { t } = useTranslation();
  const { asset, amount, from, fromAverageConfirmationTime } =
    getGatewayParams(gateway);
  const fromChainConfig = getChainConfig(from);
  const assetConfig = getAssetConfig(asset);
  const renAssetConfig = getRenAssetConfig(asset);
  const { balance } = useContractChainAssetBalance(gateway.fromChain, asset);

  const Icon = fromChainConfig.Icon;
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
                <Icon fontSize="inherit" />
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
        <WalletNetworkSwitchMessage />
      </PaperContent>
      <Divider />
      <PaperContent darker>
        <MediumTopWrapper>
          <FeesToggler>{Fees}</FeesToggler>
        </MediumTopWrapper>
        <ActionButtonWrapper>
          <ActionButton
            onClick={onSubmit}
            disabled={
              submitting ||
              waiting ||
              done ||
              burnStatus !== ChainTransactionStatus.Ready
            }
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
  waiting,
  done,
  errorSubmitting,
}) => {
  const { t } = useTranslation();
  const { asset, to, amount, fromAverageConfirmationTime } =
    getGatewayParams(gateway);
  const releaseChainConfig = getChainConfig(to);
  const assetConfig = getAssetConfig(asset);
  const renAssetConfig = getRenAssetConfig(asset);
  const { Icon: ChainIcon } = releaseChainConfig;
  const { Icon: AssetIcon } = assetConfig;

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
            Icon={<AssetIcon fontSize="inherit" />}
          />
        </MediumTopWrapper>
      </PaperContent>
      <Divider />
      <PaperContent topPadding darker>
        <FeesToggler>{Fees}</FeesToggler>
        <MultipleActionButtonWrapper>
          <ActionButton
            onClick={onSubmit}
            disabled={submitting || waiting || done}
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
  burnAssetDecimals: number | null;
  burnAmount: string | null;
  burnTxUrl: string | null;
  releaseAssetDecimals: number | null;
  releaseAmount: string | null;
  releaseTxUrl: string | null;
};

export const ReleaseH2HCompletedStatus: FunctionComponent<
  ReleaseH2HCompletedStatusProps
> = ({
  gateway,
  burnTxUrl,
  burnAssetDecimals,
  releaseTxUrl,
  releaseAmount,
  releaseAssetDecimals,
  burnAmount,
}) => {
  const { t } = useTranslation();
  useSetPaperTitle(t("release.completed-title"));
  const history = useHistory();
  const burnAssetConfig = getRenAssetConfig(gateway.params.asset);
  const releaseAssetConfig = getAssetConfig(gateway.params.asset);
  const burnChainConfig = getChainConfig(gateway.params.from.chain);
  const releaseChainConfig = getChainConfig(gateway.params.to.chain);

  const handleGoToHome = useCallback(() => {
    history.push({
      pathname: paths.HOME,
    });
  }, [history]);

  const { showNotification } = useNotifications();
  const { showBrowserNotification } = useBrowserNotifications();

  const burnAmountFormatted =
    burnAmount !== null && burnAssetDecimals !== null
      ? new BigNumber(burnAmount).shiftedBy(-burnAssetDecimals).toString()
      : null;

  const releaseAmountFormatted =
    releaseAmount !== null && releaseAssetDecimals !== null
      ? new BigNumber(releaseAmount).shiftedBy(-releaseAssetDecimals).toString()
      : null;

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
    burnAssetConfig,
    releaseTxUrl,
    t,
  ]);

  useEffectOnce(showNotifications); //TODO: refactor

  return (
    <PaperContent bottomPadding>
      <ProgressWrapper>
        <ProgressWithContent>
          <ProgressWithContent color={releaseChainConfig.color}>
            <BigDoneIcon />
          </ProgressWithContent>
        </ProgressWithContent>
      </ProgressWrapper>
      <Box minHeight={80}>
        <Typography variant="h5" align="center" gutterBottom>
          <NumberFormatText
            value={releaseAmountFormatted}
            spacedSuffix={burnAssetConfig.shortName}
          />{" "}
          received!
        </Typography>
        <LabelWithValue
          label="Initially sent"
          labelTooltip="The amount you initially sent"
          value={
            <span>
              {burnAmountFormatted} {burnAssetConfig.shortName}
            </span>
          }
        />
      </Box>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" py={2}>
        {burnTxUrl !== null && (
          <Link
            external
            color="primary"
            variant="button"
            underline="hover"
            href={burnTxUrl}
          >
            {burnChainConfig.shortName} {t("common.transaction")}
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
            {releaseChainConfig.shortName} {t("common.transaction")}
          </Link>
        )}
      </Box>
      <ActionButton onClick={handleGoToHome}>
        {t("navigation.back-to-home-label")}
      </ActionButton>
    </PaperContent>
  );
};
