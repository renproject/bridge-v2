import { Divider } from "@material-ui/core";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, { FunctionComponent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
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
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../../../../components/progress/ProgressHelpers";
import {
  AssetInfo,
  LabelWithValue,
  MiddleEllipsisText,
  SimpleAssetInfo,
} from "../../../../components/typography/TypographyHelpers";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { feesDecimalImpact } from "../../../../utils/numbers";
import { undefinedForNull } from "../../../../utils/propsUtils";
import {
  getAssetConfig,
  getRenAssetName,
} from "../../../../utils/tokensConfig";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import {
  BalanceInfo,
  UsdNumberFormatText,
} from "../../components/BalanceHelpers";
import { FeesToggler } from "../../components/FeeHelpers";
import {
  getGatewayParams,
  useEthereumChainAssetBalance,
} from "../../gatewayHooks";
import { useChainTransactionSubmitter } from "../../gatewayTransactionHooks";

type ReleaseStandardBurnStatusProps = {
  gateway: Gateway;
  Fees: ReactNode | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
  burnStatus: ChainTransactionStatus | null;
};

export const ReleaseStandardBurnStatus: FunctionComponent<
  ReleaseStandardBurnStatusProps
> = ({ gateway, Fees, outputAmountUsd, outputAmount }) => {
  const { t } = useTranslation();
  const { asset, amount, toAddress } = getGatewayParams(gateway);
  const assetConfig = getAssetConfig(asset);
  const { RenIcon } = assetConfig;
  const { balance } = useEthereumChainAssetBalance(gateway.fromChain, asset);

  const {
    handleSubmit,
    submitting,
    done,
    waiting,
    errorSubmitting,
    handleReset,
  } = useChainTransactionSubmitter(gateway.in);

  return (
    <>
      <PaperContent bottomPadding>
        <BalanceInfo balance={balance} asset={asset} />
        <SimpleAssetInfo
          label={t("mint.minting-label")}
          value={amount}
          asset={asset}
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
            Icon={<RenIcon fontSize="inherit" />}
          />
        </MediumTopWrapper>
        <MediumTopWrapper>
          <HorizontalPadder>
            <LabelWithValue
              label={t("common.to-label")}
              value={
                <MiddleEllipsisText hoverable>{toAddress}</MiddleEllipsisText>
              }
            />
          </HorizontalPadder>
        </MediumTopWrapper>
      </PaperContent>
      <Divider />
      <PaperContent darker>
        <MediumTopWrapper>
          <FeesToggler>{Fees}</FeesToggler>
        </MediumTopWrapper>
        <ActionButtonWrapper>
          <ActionButton
            onClick={handleSubmit}
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
          onAction={handleReset}
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
  burnStatus,
}) => {
  const { t } = useTranslation();
  const { asset, from, amount } = getGatewayParams(gateway);
  const lockChainConfig = getChainConfig(from);
  const assetConfig = getAssetConfig(asset);
  const renAsset = getRenAssetName(asset);
  const { RenIcon } = assetConfig;

  const renVM = useChainTransactionSubmitter(transaction?.renVM);
  const out = useChainTransactionSubmitter(transaction?.out);

  // const handleSubmitBoth = useCallback(async () => {
  //   await renVM.handleSubmit();
  // }, [renVM]);

  const LockChainIcon = lockChainConfig.Icon;

  return (
    <>
      <PaperContent bottomPadding>
        <ProgressWrapper>
          <ProgressWithContent
            confirmations={undefinedForNull(burnConfirmations)}
            targetConfirmations={undefinedForNull(burnTargetConfirmations)}
          >
            <LockChainIcon fontSize="inherit" />
          </ProgressWithContent>
        </ProgressWrapper>
        <SimpleAssetInfo
          label={t("mint.minting-label")}
          value={amount}
          asset={asset}
        />
        <MediumTopWrapper>
          <AssetInfo
            label={t("common.receiving-label")}
            value={
              <NumberFormatText
                value={outputAmount}
                spacedSuffix={renAsset}
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
      <PaperContent topPadding darker>
        <FeesToggler>{Fees}</FeesToggler>
        <MultipleActionButtonWrapper>
          {renVM.errorSubmitting && (
            <SubmitErrorDialog
              open={true}
              error={renVM.errorSubmitting}
              onAction={renVM.handleReset}
            />
          )}
          {out.errorSubmitting && (
            <SubmitErrorDialog
              open={true}
              error={out.errorSubmitting}
              onAction={out.handleReset}
            />
          )}
        </MultipleActionButtonWrapper>
      </PaperContent>
    </>
  );
};
