import React, { FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { CenteredProgress } from "../../../components/progress/ProgressHelpers";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { WalletStatus } from "../../../components/utils/types";
import { MINT_GAS_UNIT_COST } from "../../../constants/constants";
import { useSelectedChainWallet } from "../../../providers/multiwallet/multiwalletHooks";
import {
  BridgeChain,
  BridgeCurrency,
  getChainConfig,
  getCurrencyConfig,
  toReleasedCurrency,
} from "../../../utils/assetConfigs";
import { fromGwei } from "../../../utils/converters";
import { useFetchFees } from "../../fees/feesHooks";
import { BridgeFees, getTransactionFees } from "../../fees/feesUtils";
import { $exchangeRates, $gasPrices } from "../../marketData/marketDataSlice";
import { findExchangeRate, USD_SYMBOL } from "../../marketData/marketDataUtils";
import { getFeeTooltips, TxType } from "../transactionsUtils";

export const getMintAndReleaseFees = (fees: BridgeFees) => {
  const result = {
    mint: 0,
    release: 0,
  };
  if (fees && fees[0] && fees[0].ethereum) {
    const chainFees = fees[0].ethereum;
    result.mint = chainFees.min;
    result.release = chainFees.burn;
  }
  return result;
};

type TransactionFeesProps = {
  type: TxType;
  currency: BridgeCurrency;
  amount: number;
  chain: BridgeChain;
};

export const TransactionFees: FunctionComponent<TransactionFeesProps> = ({
  amount,
  currency,
  type,
  chain,
}) => {
  const { status } = useSelectedChainWallet();
  const currencyConfig = getCurrencyConfig(currency);
  const exchangeRates = useSelector($exchangeRates);
  const gasPrices = useSelector($gasPrices);
  const currencyUsdRate = findExchangeRate(exchangeRates, currency, USD_SYMBOL);
  const ethUsdRate = findExchangeRate(
    exchangeRates,
    BridgeCurrency.ETH,
    USD_SYMBOL
  );
  const amountUsd = amount * currencyUsdRate;
  const { fees, pending } = useFetchFees(currency, type);
  const { renVMFee, renVMFeeAmount, networkFee } = getTransactionFees({
    amount,
    fees,
    type,
  });
  const renVMFeeAmountUsd = amountUsd * renVMFee;
  const networkFeeUsd = networkFee * currencyUsdRate;

  const sourceCurrency =
    type === TxType.MINT ? currency : toReleasedCurrency(currency);
  const sourceCurrencyConfig = getCurrencyConfig(sourceCurrency);
  const sourceCurrencyChainConfig = getChainConfig(
    sourceCurrencyConfig.sourceChain
  );
  const renCurrencyChainConfig = getChainConfig(chain);

  const tooltips = getFeeTooltips({
    mintFee: fees.mint / 10000,
    releaseFee: fees.burn / 10000,
    sourceCurrency,
    chain,
  });

  const feeInGwei = Math.ceil(MINT_GAS_UNIT_COST * gasPrices.standard);
  const targetNetworkFeeUsd = fromGwei(feeInGwei) * ethUsdRate;
  const targetNetworkFeeLabel = `${feeInGwei} Gwei`;

  if (status !== WalletStatus.CONNECTED) {
    return <span>Connect a wallet to view fees</span>;
  }
  if (pending) {
    return <CenteredProgress />;
  }
  return (
    <>
      <Debug it={{ currency, fees }} />
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
        label={`${sourceCurrencyChainConfig.full} Miner Fee`}
        labelTooltip={tooltips.sourceChainMinerFee}
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
        label={`Esti. ${renCurrencyChainConfig.full} Fee`}
        labelTooltip={tooltips.renCurrencyChainFee}
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
