import { Box, Divider, Typography } from "@material-ui/core";
import { Gateway, GatewayTransaction } from "@renproject/ren";
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
import {
  HorizontalPadder,
  MediumTopWrapper,
} from "../../../../components/layout/LayoutHelpers";
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
  MiddleEllipsisText,
  SimpleAssetInfo,
} from "../../../../components/typography/TypographyHelpers";
import { paths } from "../../../../pages/routes";
import { useNotifications } from "../../../../providers/Notifications";
import { useSetPaperTitle } from "../../../../providers/TitleProviders";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { feesDecimalImpact } from "../../../../utils/numbers";
import { undefinedForNull } from "../../../../utils/propsUtils";
import {
  getAssetConfig,
  getRenAssetConfig,
} from "../../../../utils/tokensConfig";
import { useBrowserNotifications } from "../../../notifications/notificationsUtils";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { AddressLabel } from "../../components/AddressHelpers";
import {
  BalanceInfo,
  UsdNumberFormatText,
} from "../../components/BalanceHelpers";
import { FeesToggler } from "../../components/FeeHelpers";
import {
  RenVMSubmittingInfo,
  TransactionProgressInfo,
} from "../../components/TransactionProgressHelpers";
import {
  getGatewayParams,
  useEthereumChainAssetBalance,
} from "../../gatewayHooks";
import { SubmittingProps } from "../shared/SubmissionHelpers";

type ReleaseStandardBurnStatusProps = SubmittingProps & {
  gateway: Gateway;
  Fees: ReactNode | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
  burnStatus: ChainTransactionStatus | null;
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
}) => {
  const { t } = useTranslation();
  const { asset, amount, toAddress } = getGatewayParams(gateway);
  const assetConfig = getAssetConfig(asset);
  const renAssetConfig = getRenAssetConfig(asset);
  const { Icon } = assetConfig;
  const { balance } = useEthereumChainAssetBalance(gateway.fromChain, asset);

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
          <HorizontalPadder>
            <AddressLabel
              address={toAddress}
              url={gateway.toChain.addressExplorerLink(toAddress)}
            />
          </HorizontalPadder>
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
            disabled={submitting || waiting || done}
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

type ReleaseStandardBurnProgressStatusProps = {
  gateway: Gateway;
  transaction: GatewayTransaction | null;
  Fees: ReactNode | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
  burnStatus: ChainTransactionStatus | null;
  burnConfirmations: number | null;
  burnTargetConfirmations: number | null;
  renVMStatus: ChainTransactionStatus | null;
};

export const ReleaseStandardBurnProgressStatus: FunctionComponent<
  ReleaseStandardBurnProgressStatusProps
> = ({
  gateway,
  transaction,
  Fees,
  outputAmount,
  outputAmountUsd,
  burnConfirmations,
  burnTargetConfirmations,
  renVMStatus,
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
              confirmations={undefinedForNull(burnConfirmations)}
              target={undefinedForNull(burnTargetConfirmations)}
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
};

export const ReleaseStandardCompletedStatus: FunctionComponent<
  ReleaseStandardCompletedStatusProps
> = ({
  gateway,
  burnTxUrl,
  releaseTxUrl,
  releaseAmount,
  releaseAssetDecimals,
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
          <BigDoneIcon />
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
