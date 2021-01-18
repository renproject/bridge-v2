import React, { FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { CenteredProgress } from "../../../components/progress/ProgressHelpers";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { WalletStatus } from "../../../components/utils/types";
import { MINT_GAS_UNIT_COST } from "../../../constants/constants";
import {
  BridgeChain,
  BridgeCurrency,
  getChainConfig,
  getCurrencyConfig,
  toReleasedCurrency,
} from "../../../utils/assetConfigs";
import { fromGwei } from "../../../utils/converters";
import { trimAddress } from "../../../utils/strings";
import { useFetchFees } from "../../fees/feesHooks";
import { getTransactionFees } from "../../fees/feesUtils";
import { $exchangeRates, $gasPrices } from "../../marketData/marketDataSlice";
import {
  findExchangeRate,
  findGasPrice,
  USD_SYMBOL,
} from "../../marketData/marketDataUtils";
import { mintTooltips } from "../../mint/components/MintHelpers";
import { useSelectedChainWallet } from '../../wallet/walletHooks'
import { getFeeTooltips, TxType } from "../transactionsUtils";

type TransactionFeesProps = {
  type: TxType;
  currency: BridgeCurrency;
  amount: number;
  chain: BridgeChain;
  address?: string; // FIXME make obligatory
};

export const TransactionFees: FunctionComponent<TransactionFeesProps> = ({
  amount,
  currency,
  type,
  chain,
  address,
}) => {
  const { status } = useSelectedChainWallet();
  const currencyConfig = getCurrencyConfig(currency);
  const exchangeRates = useSelector($exchangeRates);
  const gasPrices = useSelector($gasPrices);
  const currencyUsdRate = findExchangeRate(exchangeRates, currency, USD_SYMBOL);
  const gasPrice = findGasPrice(gasPrices, chain);
  const targetChainConfig = getChainConfig(chain);

  const targetChainCurrencyUsdRate = findExchangeRate(
    exchangeRates,
    targetChainConfig.nativeCurrency,
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

  const tooltips = getFeeTooltips({
    mintFee: fees.mint / 10000,
    releaseFee: fees.burn / 10000,
    sourceCurrency,
    chain,
  });

  const feeInGwei = Math.ceil(MINT_GAS_UNIT_COST * gasPrice);
  const targetChainFeeUsd = fromGwei(feeInGwei) * targetChainCurrencyUsdRate;
  const targetChainFeeLabel = `${feeInGwei} Gwei`;

  if (status !== WalletStatus.CONNECTED) {
    return null;
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
            decimalScale={8}
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
        label={`${sourceCurrencyChainConfig.full} Miner Fee`}
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
        label={`Esti. ${targetChainConfig.full} Fee`}
        labelTooltip={tooltips.renCurrencyChainFee}
        value={targetChainFeeLabel}
        valueEquivalent={
          <NumberFormatText
            value={targetChainFeeUsd}
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
          />
        }
      />
      {address && (
        <LabelWithValue
          label="Recipient Address"
          labelTooltip={mintTooltips.recipientAddress}
          value={trimAddress(address, 5)}
        />
      )}
    </>
  );
};
