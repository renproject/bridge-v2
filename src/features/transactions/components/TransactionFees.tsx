import React, { FunctionComponent, useMemo } from "react";
import { useSelector } from "react-redux";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import { MINT_GAS_UNIT_COST } from "../../../constants/constants";
import { BridgeCurrency, getCurrencyConfig } from "../../../utils/assetConfigs";
import { fromGwei } from "../../../utils/converters";
import { useGasPrices } from "../../marketData/marketDataHooks";
import { $exchangeRates, $gasPrices } from "../../marketData/marketDataSlice";
import { findExchangeRate, USD_SYMBOL } from "../../marketData/marketDataUtils";
import { getFeeTooltips } from "../../mint/components/MintHelpers";
import { $fees } from "../../renData/renDataSlice";
import {
  BridgeFees,
  calculateTransactionFees,
} from "../../renData/renDataUtils";
import { TxType } from "../transactionsUtils";

type TransactionFeesProps = {
  type: TxType;
  currency: BridgeCurrency;
  amount: number;
};

const getMintAndReleaseFees = (fees: BridgeFees) => {
  const chainFees = fees[0].ethereum;
  return { mint: chainFees.mint, release: chainFees.burn };
};

export const TransactionFees: FunctionComponent<TransactionFeesProps> = ({
  amount,
  currency,
  type,
}) => {
  useGasPrices();
  const currencyConfig = getCurrencyConfig(currency);
  const exchangeRates = useSelector($exchangeRates);
  const fees = useSelector($fees);
  const gasPrices = useSelector($gasPrices);
  const currencyUsdRate = findExchangeRate(exchangeRates, currency, USD_SYMBOL);
  const ethUsdRate = findExchangeRate(
    exchangeRates,
    BridgeCurrency.ETH,
    USD_SYMBOL
  );
  const amountUsd = amount * currencyUsdRate;

  console.log(amount,
    currency,
    fees,
    type,);

  const {
    renVMFee,
    renVMFeeAmount,
    networkFee,
    conversionTotal,
  } = calculateTransactionFees({
    amount,
    currency,
    fees,
    type,
  });
  console.log(renVMFee, renVMFeeAmount, networkFee, conversionTotal);
  const renVMFeeAmountUsd = amountUsd * renVMFee;
  const networkFeeUsd = networkFee * currencyUsdRate;

  const tooltips = useMemo(() => {
    const { mint, release } = getMintAndReleaseFees(fees);
    return getFeeTooltips(mint / 10000, release / 10000);
  }, [fees]);

  const feeInGwei = Math.ceil(MINT_GAS_UNIT_COST * gasPrices.standard);
  const targetNetworkFeeUsd = fromGwei(feeInGwei) * ethUsdRate;
  const targetNetworkFeeLabel = `${feeInGwei} Gwei`;

  return (
    <>
      <LabelWithValue
        label="RenVM Fee"
        labelTooltip={tooltips.renVmFee}
        value={
          <NumberFormatText
            value={renVMFeeAmount}
            spacedSuffix={currencyConfig.short}
          />
        }
        valueEquivalent={
          <NumberFormatText
            value={renVMFeeAmountUsd}
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
          />
        }
      />
      <LabelWithValue
        label={`${currencyConfig.full} Miner Fee`}
        labelTooltip={tooltips.bitcoinMinerFee}
        value={
          <NumberFormatText
            value={networkFee}
            spacedSuffix={currencyConfig.short}
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
        label="Esti. Ethereum Fee"
        labelTooltip={tooltips.estimatedEthFee}
        value={targetNetworkFeeLabel}
        valueEquivalent={
          <NumberFormatText
            value={targetNetworkFeeUsd}
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
          />
        }
      />
    </>
  );
};