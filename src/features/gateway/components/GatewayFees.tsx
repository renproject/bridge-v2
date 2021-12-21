import { Asset, Chain } from "@renproject/chains";
import { Gateway } from "@renproject/ren";
import { FunctionComponent } from "react";
import { TFunction, useTranslation } from "react-i18next";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
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
};

export const GatewayFees: FunctionComponent<GatewayFeesProps> = ({
  asset,
  outputAmount,
  outputAmountUsd,
  renVMFeeAmount,
  renVMFeeAmountUsd,
  renVMFeePercent,
}) => {
  const { t } = useTranslation();
  const assetConfig = assetsConfig[asset];
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
    </>
  );
};
