import React, { FunctionComponent, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import {
  AssetDropdown,
  AssetDropdownWrapper,
} from "../../../components/dropdowns/AssetDropdown";
import { BitcoinIcon } from "../../../components/icons/RenIcons";
import {
  BigCurrencyInput,
  BigCurrencyInputWrapper,
} from "../../../components/inputs/BigCurrencyInput";
import {
  AssetInfo,
  SpacedDivider,
} from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { setFlowStep } from "../../../features/flow/flowSlice";
import { FlowStep } from '../../../features/flow/flowTypes'
import { $marketData } from "../../../features/marketData/marketDataSlice";
import { findExchangeRate } from "../../../features/marketData/marketDataUtils";
import {
  $mint,
  setMintAmount,
  setMintCurrency,
} from "../../../features/mint/mintSlice";
import { $wallet, setChain } from "../../../features/wallet/walletSlice";
import {
  getMintedCurrencySymbol,
  supportedMintCurrencies,
  supportedMintDestinationChains,
} from "../../../providers/multiwallet/multiwalletUtils";
import { toUsdFormat } from "../../../utils/formatters";
import { getCurrencyShortLabel } from "../../../utils/labels";

export const MintInitialStep: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { currency, amount } = useSelector($mint);
  const { chain } = useSelector($wallet);
  const { rates } = useSelector($marketData);

  const handleAmountChange = useCallback(
    (value) => {
      dispatch(setMintAmount(value));
    },
    [dispatch]
  );
  const handleCurrencyChange = useCallback(
    (event) => {
      dispatch(setMintCurrency(event.target.value));
    },
    [dispatch]
  );
  const handleChainChange = useCallback(
    (event) => {
      dispatch(setChain(event.target.value));
    },
    [dispatch]
  );
  const handleNextStep = useCallback(() => {
    dispatch(setMintAmount(amount));
    dispatch(setFlowStep(FlowStep.FEES));
  }, [dispatch, amount]);

  const usd2CurrencyRate = findExchangeRate(rates, currency);
  const mintedValue = amount * 0.999;
  const mintedCurrencySymbol = getMintedCurrencySymbol(currency);
  const mintedCurrency = getCurrencyShortLabel(mintedCurrencySymbol);
  const usd2MintedCurrencyRate =
    findExchangeRate(rates, mintedCurrencySymbol) || usd2CurrencyRate; // TODO: investigate what to do with nonexistent currencies
  const currencyUsdValue = amount * usd2CurrencyRate;
  const mintedCurrencyUsdValue = mintedValue * usd2MintedCurrencyRate;
  const mintedValueLabel = `${mintedValue} ${mintedCurrency}`;
  const mintedValueEquivalentLabel = ` = ${toUsdFormat(
    mintedCurrencyUsdValue
  )} USD`;

  const nextEnabled = amount !== 0;

  return (
    <div>
      <BigCurrencyInputWrapper>
        <BigCurrencyInput
          onChange={handleAmountChange}
          symbol={currency}
          usdValue={currencyUsdValue}
          value={amount}
        />
      </BigCurrencyInputWrapper>
      <AssetDropdownWrapper>
        <AssetDropdown
          mode="send"
          available={supportedMintCurrencies}
          value={currency}
          onChange={handleCurrencyChange}
        />
      </AssetDropdownWrapper>
      <AssetDropdownWrapper>
        <AssetDropdown
          mode="chain"
          available={supportedMintDestinationChains}
          value={chain}
          onChange={handleChainChange}
        />
      </AssetDropdownWrapper>
      <SpacedDivider />
      <AssetInfo
        label="Receiving:"
        value={mintedValueLabel}
        valueEquivalent={mintedValueEquivalentLabel}
        Icon={<BitcoinIcon fontSize="inherit" />}
      />
      <ActionButtonWrapper>
        <ActionButton onClick={handleNextStep} disabled={!nextEnabled}>
          Next
        </ActionButton>
      </ActionButtonWrapper>
      <Debug it={{ amount, currency, chain }} />
    </div>
  );
};
