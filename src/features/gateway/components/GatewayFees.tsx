import { Asset, Chain } from "@renproject/chains";
import { Gateway } from "@renproject/ren";
import { FunctionComponent } from "react";
import { TFunction, useTranslation } from "react-i18next";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import { chainsConfig } from "../../../utils/chainsConfig";
import { toPercent } from "../../../utils/converters";
import { assetsConfig } from "../../../utils/tokensConfig";
import { useGatewayFees, useGatewayFeesWithRates } from "../gatewayHooks";

type GetFeeTooltipsArgs = {
  mintFee?: number;
  releaseFee?: number;
  // fromChainFeeAsset: Asset;
  // toChainFeeAsset: Asset;
  // fromChain: Chain;
  // toChain: Chain;
};

export const getFeeTooltips = (
  { mintFee, releaseFee }: GetFeeTooltipsArgs,
  t: TFunction
) => {
  // const sourceCurrencyConfig = getCurrencyConfig(sourceCurrency);
  // const sourceCurrencyChainConfig = getChainConfig(
  //   sourceCurrencyConfig.sourceChain
  // );
  // const renCurrencyChainConfig = getChainConfig(chain);
  // const renNativeChainCurrencyConfig = getCurrencyConfig(
  //   renCurrencyChainConfig.nativeCurrency
  // );
  return {
    renVmFee: t("fees.ren-fee-tooltip", {
      // mintFee: toPercent(mintFee),
      // releaseFee: toPercent(releaseFee),
    }),
    sourceChainMinerFee: t("fees.chain-miner-fee-tooltip", {
      // chain: fromChain,
      // currency: sourceCurrencyConfig.short,
    }),
    renCurrencyChainFee: t("fees.ren-currency-chain-fee-tooltip", {
      // chainFull: renCurrencyChainConfig.full,
      // chainShort: renCurrencyChainConfig.short,
      // chainNative: renNativeChainCurrencyConfig.short,
    }),
  };
};

type GatewayFeesProps = ReturnType<typeof useGatewayFeesWithRates> & {
  asset: Asset;
  from: Chain;
  to: Chain;
};

export const GatewayFees: FunctionComponent<GatewayFeesProps> = ({
  asset,
  from,
  to,
  outputAmount,
  outputAmountUsd,
  renVMFeeAmount,
  renVMFeeAmountUsd,
  renVMFeePercent,
  fromChainFeeAmount,
  fromChainFeeAsset,
  fromChainFeeAmountUsd,
  toChainFeeAmount,
  toChainFeeAsset,
  toChainFeeAmountUsd,
}) => {
  const { t } = useTranslation();
  const assetConfig = assetsConfig[asset];
  const fromChainConfig = chainsConfig[from];
  const toChainConfig = chainsConfig[to];
  const tooltips = getFeeTooltips(
    {
      mintFee: 37,
      releaseFee: 10,
    },
    t
  );
  const hasAmount = false;
  return (
    <>
      <LabelWithValue
        label={t("fees.ren-fee-label")}
        labelTooltip={tooltips.renVmFee}
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
            ""
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
        labelTooltip={tooltips.sourceChainMinerFee}
        value={
          fromChainFeeAmount !== null && fromChainFeeAsset !== null ? (
            <NumberFormatText
              value={fromChainFeeAmount}
              spacedSuffix={assetsConfig[fromChainFeeAsset].shortName}
            />
          ) : (
            ""
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
        labelTooltip={tooltips.sourceChainMinerFee}
        value={
          toChainFeeAmount !== null && toChainFeeAsset !== null ? (
            <NumberFormatText
              value={toChainFeeAmount}
              spacedSuffix={assetsConfig[toChainFeeAsset].shortName}
            />
          ) : (
            ""
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
    </>
  );
};
