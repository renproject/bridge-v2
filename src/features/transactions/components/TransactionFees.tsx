import React, { FunctionComponent, useMemo } from "react";
import { useSelector } from "react-redux";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import { MINT_GAS_UNIT_COST } from "../../../constants/constants";
import {
  BridgeCurrency,
  getChainConfig,
  getCurrencyConfig,
  getCurrencySourceChain,
  getReleasedDestinationCurrencySymbol,
} from "../../../utils/assetConfigs";
import { fromGwei } from "../../../utils/converters";
import { useGasPrices } from "../../marketData/marketDataHooks";
import { $exchangeRates, $gasPrices } from "../../marketData/marketDataSlice";
import { findExchangeRate, USD_SYMBOL } from "../../marketData/marketDataUtils";
import { $fees } from "../../renData/renDataSlice";
import {
  BridgeFees,
  calculateTransactionFees,
} from "../../renData/renDataUtils";
import { getFeeTooltips, TxType } from "../transactionsUtils";

type TransactionFeesProps = {
  type: TxType;
  currency: BridgeCurrency;
  amount: number;
};

export const getMintAndReleaseFees = (fees: BridgeFees) => {
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

  const { renVMFee, renVMFeeAmount, networkFee } = calculateTransactionFees({
    amount,
    currency,
    fees,
    type,
  });
  const renVMFeeAmountUsd = amountUsd * renVMFee;
  const networkFeeUsd = networkFee * currencyUsdRate;

  // TODO: resolve MIner fees
  const sourceChainConfig = getChainConfig(getCurrencySourceChain(currency));
  console.log(getCurrencySourceChain(currency), sourceChainConfig);
  const destinationCurrency = getReleasedDestinationCurrencySymbol(currency);
  const destinationCurrencyConfig = getCurrencyConfig(destinationCurrency);
  const destinationChainConfig = getChainConfig(
    destinationCurrencyConfig.sourceChain
  );
  console.log(destinationChainConfig, destinationCurrencyConfig.sourceChain);

  const tooltips = useMemo(() => {
    const { mint, release } = getMintAndReleaseFees(fees);
    return getFeeTooltips({
      mintFee: mint / 10000,
      releaseFee: release / 10000,
      sourceCurrency: currency,
      destinationCurrency: destinationCurrency,
      type: TxType.MINT,
    });
  }, [fees, currency, destinationCurrency]);

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
      <LabelWithValue //TODO: made dependant on the sourceChain
        label={`Bitcoin Miner Fee`}
        labelTooltip={tooltips.bitcoinMinerFee}
        value={<NumberFormatText value={networkFee} spacedSuffix="BTC" />}
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
