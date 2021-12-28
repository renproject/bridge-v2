import { Asset, Chain } from "@renproject/chains";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { InlineSkeleton } from "../../../components/progress/ProgressHelpers";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import { chainsConfig } from "../../../utils/chainsConfig";
import { assetsConfig } from "../../../utils/tokensConfig";
import { useGatewayFeesWithRates } from "../gatewayHooks";

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
  fromChainFeeAmountUsd,
  toChainFeeAmount,
  toChainFeeAsset,
  toChainFeeAmountUsd,
  mintFeePercent,
  burnFeePercent,
  approval = false,
  approved = false,
}) => {
  const { t } = useTranslation();
  const assetConfig = assetsConfig[asset];
  const fromChainConfig = chainsConfig[from];
  const toChainConfig = chainsConfig[to];

  const renVMFeeTooltip =
    mintFeePercent !== null && burnFeePercent !== null
      ? t("fees.ren-fee-tooltip", {
          mintFee: mintFeePercent,
          releaseFee: burnFeePercent,
        })
      : "";

  // TODO: better translation keys
  const fromChainFeeTooltip =
    fromChainFeeAsset !== null
      ? t("fees.chain-miner-fee-tooltip", {
          chain: chainsConfig[from].fullName,
          currency: fromChainFeeAsset,
        })
      : "";
  const toChainFeeTooltip =
    toChainFeeAsset !== null
      ? t("fees.ren-currency-chain-fee-tooltip", {
          chainFull: chainsConfig[to].fullName,
          chainShort: chainsConfig[to].fullName,
          chainNative: assetsConfig[toChainFeeAsset].shortName,
        })
      : "";

  return (
    <>
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
      <LabelWithValue
        label={t("fees.chain-miner-fee-label", {
          chain: fromChainConfig.fullName,
        })}
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
      <LabelWithValue
        label={t("fees.ren-currency-chain-fee-label", {
          chain: toChainConfig.fullName,
        })}
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
