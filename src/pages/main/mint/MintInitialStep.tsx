import React, { FunctionComponent, useCallback, useState } from "react";
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
import { CurrencySymbols, FlowStep } from "../../../components/utils/types";
import { setFlowStep } from "../../../features/flow/flowSlice";
import {
  $mint,
  $mintChain,
  setMintAmount,
} from "../../../features/mint/mintSlice";
import {
  bridgeChainToMultiwalletChain,
  getMintedCurrencySymbol,
  multiwalletChainToBridgeChain,
  supportedMintCurrencies,
  supportedMintDestinationChains,
} from "../../../providers/multiwallet/multiwalletUtils";
import { useStore } from "../../../providers/Store";
import { findExchangeRate } from "../../../services/marketData";
import { toUsdFormat } from "../../../utils/formatters";
import { getCurrencyShortLabel } from "../../../utils/labels";

export const MintInitialStep: FunctionComponent = () => {
  const [store, oldDispatch] = useStore();
  const dispatch = useDispatch();
  const { exchangeRates } = store;
  const { chain, currency, amount } = useSelector($mint);
  const chainSymbol = multiwalletChainToBridgeChain(chain);
  const handleCurrencyValueChange = useCallback(
    (value) => {
      dispatch(setMintAmount(value));
    },
    [dispatch]
  );

  const [currencySymbol, setCurrencySymbol] = useState(CurrencySymbols.BTC);
  const handleCurrencyChange = useCallback((event) => {
    setCurrencySymbol(event.target.value);
  }, []);

  const handleChainChange = useCallback(
    (event) => {
      oldDispatch({
        type: "setChain",
        payload: bridgeChainToMultiwalletChain(event.target.value),
      });
      // setChain(event.target.value);
    },
    [oldDispatch]
  );
  const handleNextStep = useCallback(() => {
    dispatch(setMintAmount(amount));
    dispatch(setFlowStep(FlowStep.FEES));
  }, [oldDispatch, amount]);

  const usd2CurrencyRate = findExchangeRate(exchangeRates, currencySymbol);
  const mintedValue = amount * 0.999;
  const mintedCurrencySymbol = getMintedCurrencySymbol(currencySymbol);
  const mintedCurrency = getCurrencyShortLabel(mintedCurrencySymbol);
  const usd2MintedCurrencyRate =
    findExchangeRate(exchangeRates, mintedCurrencySymbol) || usd2CurrencyRate; // TODO: investigate what to do with nonexistent currencies
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
          onChange={handleCurrencyValueChange}
          symbol={currencySymbol}
          usdValue={currencyUsdValue}
          value={amount}
        />
      </BigCurrencyInputWrapper>
      <AssetDropdownWrapper>
        <AssetDropdown
          mode="send"
          available={supportedMintCurrencies}
          value={currencySymbol}
          onChange={handleCurrencyChange}
        />
      </AssetDropdownWrapper>
      <AssetDropdownWrapper>
        <AssetDropdown
          mode="chain"
          available={supportedMintDestinationChains}
          value={chainSymbol}
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
      <Debug it={{ amount, currencySymbol, chain, dispatch: oldDispatch }} />
    </div>
  );
};
