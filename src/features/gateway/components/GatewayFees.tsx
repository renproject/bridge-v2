import { Box } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { Asset, Chain } from "@renproject/chains";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { InlineSkeleton } from "../../../components/progress/ProgressHelpers";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import { getChainConfig } from "../../../utils/chainsConfig";
import { assetsConfig, getAssetConfig } from "../../../utils/tokensConfig";
import { useGatewayFeesWithRates, useGatewayMeta } from "../gatewayHooks";

type GatewayFeesProps = ReturnType<typeof useGatewayFeesWithRates> & {
  asset: Asset;
  from: Chain;
  to: Chain;
  approval?: boolean;
  approved?: boolean;
};

export const GatewayFees: FunctionComponent<GatewayFeesProps> = ({
  asset,
  from,
  to,
  renVMFeeAmount,
  renVMFeeAmountUsd,
  renVMFeePercent,
  fromChainFeeAmount,
  fromChainFeeAsset,
  variableFeePercent,
  fromChainFeeAmountUsd,
  toChainFeeAmount,
  toChainFeeAsset,
  toChainFeeAmountUsd,
  approval = false,
  approved = false,
}) => {
  const { isMint, isH2H, isRelease } = useGatewayMeta(asset, from, to);
  const { t } = useTranslation();
  const assetConfig = getAssetConfig(asset);
  const fromChainConfig = getChainConfig(from);
  const toChainConfig = getChainConfig(to);

  const renVMFeeTooltip = t("fees.ren-fee-tooltip", {
    feePercent: variableFeePercent,
    feeKind: isMint ? t("common.mint") : t("common.release"),
  });

  let fromChainFeeTooltip = "",
    toChainFeeTooltip = "",
    fromChainFeeLabel = "",
    toChainFeeLabel = "";

  if (fromChainFeeAsset && toChainFeeAsset) {
    if (isH2H) {
      fromChainFeeLabel = t("fees.contract-chain-fee-label", {
        chain: fromChainConfig.fullName,
      });
      toChainFeeLabel = t("fees.contract-chain-fee-label", {
        chain: toChainConfig.fullName,
      });
      fromChainFeeTooltip = t("fees.contract-chain-fee-tooltip", {
        chainFull: fromChainConfig.fullName,
        chainShort: fromChainConfig.fullName,
        chainNative: getAssetConfig(fromChainFeeAsset).shortName,
      });
      toChainFeeTooltip = t("fees.contract-chain-fee-tooltip", {
        chainFull: toChainConfig.fullName,
        chainShort: toChainConfig.fullName,
        chainNative: getAssetConfig(toChainFeeAsset).shortName,
      });
    } else if (isMint) {
      fromChainFeeLabel = t("fees.deposit-chain-miner-fee-label", {
        chain: fromChainConfig.fullName,
      });
      toChainFeeLabel = t("fees.contract-chain-fee-label", {
        chain: toChainConfig.fullName,
      });
      fromChainFeeTooltip = t("fees.deposit-chain-miner-fee-tooltip", {
        chain: fromChainConfig.fullName,
        currency: fromChainFeeAsset,
      });
      toChainFeeTooltip = t("fees.contract-chain-fee-tooltip", {
        chainFull: toChainConfig.fullName,
        chainShort: toChainConfig.fullName,
        chainNative: getAssetConfig(toChainFeeAsset).shortName,
      });
    } else if (isRelease) {
      fromChainFeeLabel = t("fees.contract-chain-fee-label", {
        chain: fromChainConfig.fullName,
      });
      toChainFeeLabel = t("fees.deposit-chain-miner-fee-label", {
        chain: toChainConfig.fullName,
      });
      fromChainFeeTooltip = t("fees.contract-chain-fee-tooltip", {
        chainFull: fromChainConfig.fullName,
        chainShort: fromChainConfig.fullName,
        chainNative: getAssetConfig(fromChainFeeAsset).shortName,
      });
      toChainFeeTooltip = t("fees.deposit-chain-miner-fee-tooltip", {
        chain: toChainConfig.fullName,
        currency: toChainFeeAsset,
      });
    }
  }

  return (
    <>
      {renVMFeePercent !== null || renVMFeeAmount ? (
        <LabelWithValue
          label={t("fees.ren-fee-label")}
          labelTooltip={renVMFeeTooltip}
          value={
            renVMFeeAmount ? (
              <NumberFormatText
                value={renVMFeeAmount}
                spacedSuffix={assetConfig.shortName}
                decimalScale={8}
              />
            ) : renVMFeePercent !== null ? (
              <span>{renVMFeePercent}%</span>
            ) : (
              <InlineSkeleton width={100} height={17} />
            )
          }
          valueEquivalent={
            renVMFeeAmountUsd !== null ? (
              <NumberFormatText
                value={renVMFeeAmountUsd}
                prefix="$"
                decimalScale={2}
                fixedDecimalScale
              />
            ) : (
              ""
            )
          }
        />
      ) : (
        <FeeSkeleton />
      )}
      {Boolean(fromChainFeeLabel) ? (
        <LabelWithValue
          label={fromChainFeeLabel}
          labelTooltip={fromChainFeeTooltip}
          value={
            fromChainFeeAmount !== null && fromChainFeeAsset !== null ? (
              <NumberFormatText
                value={fromChainFeeAmount}
                spacedSuffix={assetsConfig[fromChainFeeAsset].shortName}
              />
            ) : (
              <InlineSkeleton width={120} height={17} />
            )
          }
          valueEquivalent={
            fromChainFeeAmountUsd !== null ? (
              <NumberFormatText
                value={fromChainFeeAmountUsd}
                prefix="$"
                decimalScale={2}
                fixedDecimalScale
              />
            ) : (
              ""
            )
          }
        />
      ) : (
        <FeeSkeleton />
      )}
      {Boolean(toChainFeeLabel) ? (
        <LabelWithValue
          label={toChainFeeLabel}
          labelTooltip={toChainFeeTooltip}
          value={
            toChainFeeAmount !== null && toChainFeeAsset !== null ? (
              <NumberFormatText
                value={toChainFeeAmount}
                spacedSuffix={assetsConfig[toChainFeeAsset].shortName}
              />
            ) : (
              <InlineSkeleton width={110} height={17} />
            )
          }
          valueEquivalent={
            toChainFeeAmountUsd !== null ? (
              <NumberFormatText
                value={toChainFeeAmountUsd}
                prefix="$"
                decimalScale={2}
                fixedDecimalScale
              />
            ) : (
              ""
            )
          }
        />
      ) : (
        <FeeSkeleton />
      )}
      {approval && (
        <LabelWithValue
          label={t("fees.assets-contracts-label")}
          labelTooltip={t("fees.assets-contracts-approval-label-tooltip")}
          value={
            approved
              ? t("fees.assets-contracts-approved")
              : t("fees.assets-contracts-need-approval")
          }
        />
      )}
    </>
  );
};

const FeeSkeleton: FunctionComponent = () => (
  <Box mb={1}>
    <Skeleton width="100%" height={17} />
  </Box>
);
