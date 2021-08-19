import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { CenteredProgress } from "../../../components/progress/ProgressHelpers";
import {
  LabelWithValue,
  MiddleEllipsisText,
} from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { WalletStatus } from "../../../components/utils/types";
import { MINT_GAS_UNIT_COST } from "../../../constants/constants";
import {
  BridgeChain,
  BridgeCurrency,
  getChainConfig,
  getCurrencyConfig,
  getNativeCurrency,
  toReleasedCurrency,
} from "../../../utils/assetConfigs";
import { fromGwei } from "../../../utils/converters";
import { useFetchFees } from "../../fees/feesHooks";
import { getTransactionFees } from "../../fees/feesUtils";
import { $exchangeRates, $gasPrices } from "../../marketData/marketDataSlice";
import {
  findExchangeRate,
  findGasPrice,
  USD_SYMBOL,
} from "../../marketData/marketDataUtils";
import { useSelectedChainWallet } from "../../wallet/walletHooks";
import {
  getFeeTooltips,
  getReleaseAssetDecimals,
  TxType,
} from "../transactionsUtils";

type TransactionFeesProps = {
  type: TxType;
  currency: BridgeCurrency;
  amount: number;
  chain: BridgeChain;
  address?: string;
};

export const TransactionFees: FunctionComponent<TransactionFeesProps> = ({
  amount,
  currency,
  type,
  chain,
  address,
}) => {
  const { t } = useTranslation();
  const { status } = useSelectedChainWallet();
  const currencyConfig = getCurrencyConfig(currency);
  const nativeCurrencyConfig = getCurrencyConfig(getNativeCurrency(currency));
  const exchangeRates = useSelector($exchangeRates);
  const gasPrices = useSelector($gasPrices);
  const currencyUsdRate = findExchangeRate(exchangeRates, currency, USD_SYMBOL);
  const gasPrice = findGasPrice(gasPrices, chain);
  const targetChainConfig = getChainConfig(chain);
  const decimals = getReleaseAssetDecimals(
    nativeCurrencyConfig.sourceChain,
    nativeCurrencyConfig.symbol
  );

  const targetChainCurrencyUsdRate = findExchangeRate(
    exchangeRates,
    targetChainConfig.nativeCurrency,
    USD_SYMBOL
  );
  const hasAmount = !isNaN(amount) && amount !== 0;
  const amountUsd = amount * currencyUsdRate;
  const { fees, pending } = useFetchFees(currency, type);
  const { renVMFee, renVMFeeAmount, networkFee } = getTransactionFees({
    amount,
    fees,
    type,
    decimals,
  });
  const renVMFeeAmountUsd = amountUsd * renVMFee;
  const networkFeeUsd = networkFee * currencyUsdRate;

  const sourceCurrency =
    type === TxType.MINT ? currency : toReleasedCurrency(currency);
  const sourceCurrencyConfig = getCurrencyConfig(sourceCurrency);
  const sourceCurrencyChainConfig = getChainConfig(
    sourceCurrencyConfig.sourceChain
  );

  const tooltips = getFeeTooltips(
    {
      mintFee: fees.mint / 10000,
      releaseFee: fees.burn / 10000,
      sourceCurrency,
      chain,
    },
    t
  );

  const feeInGwei = Math.ceil(MINT_GAS_UNIT_COST * gasPrice * 1.18); // gas price to real gas price adjustment
  const targetChainFeeNative = fromGwei(feeInGwei);
  const targetChainFeeUsd = Math.max(
    fromGwei(feeInGwei) * targetChainCurrencyUsdRate,
    0.001
  );
  const targetChainCurrency = getCurrencyConfig(
    targetChainConfig.nativeCurrency
  );

  if (status !== WalletStatus.CONNECTED) {
    return null;
  }
  if (pending) {
    return <CenteredProgress />;
  }

  return (
    <>
      <Debug it={{ targetChainCurrencyUsdRate, currency, fees }} />
      <LabelWithValue
        label={t("fees.ren-fee-label")}
        labelTooltip={tooltips.renVmFee}
        value={
          hasAmount ? (
            <NumberFormatText
              value={renVMFeeAmount.toFixed(15)}
              spacedSuffix={currencyConfig.short}
              decimalScale={8}
            />
          ) : (
            <span>
              {((type === TxType.MINT ? fees.mint : fees.burn) / 10000) * 100}%
            </span>
          )
        }
        valueEquivalent={
          hasAmount ? (
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
          chain: sourceCurrencyChainConfig.full,
        })}
        labelTooltip={tooltips.sourceChainMinerFee}
        value={
          <NumberFormatText
            value={networkFee}
            spacedSuffix={sourceCurrencyChainConfig.short}
          />
        }
        valueEquivalent={
          <NumberFormatText
            value={networkFeeUsd}
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
          />
        }
      />
      <LabelWithValue
        label={t("fees.ren-currency-chain-fee-label", {
          chain: targetChainConfig.short,
        })}
        labelTooltip={tooltips.renCurrencyChainFee}
        value={
          <NumberFormatText
            value={targetChainFeeNative}
            spacedSuffix={targetChainCurrency.short}
            decimalScale={4}
          />
        }
        valueEquivalent={
          <NumberFormatText
            value={targetChainFeeUsd}
            prefix="$"
            decimalScale={4}
          />
        }
      />
      <Debug it={{ targetChainFeeUsd }} />
      {address && (
        <LabelWithValue
          label={t("mint.recipient-address-label")}
          labelTooltip={t("mint.recipient-address-tooltip")}
          value={<MiddleEllipsisText hoverable>{address}</MiddleEllipsisText>}
        />
      )}
    </>
  );
};
