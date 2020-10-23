import React, { FunctionComponent, useCallback, useState } from "react";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../components/buttons/Buttons";
import {
  AssetDropdown,
  AssetDropdownWrapper,
} from "../../components/dropdowns/AssetDropdown";
import {
  BigCurrencyInput,
  BigCurrencyInputWrapper,
} from "../../components/inputs/BigCurrencyInput";
import { Debug } from "../../components/utils/Debug";
import { ChainSymbols, CurrencySymbols } from "../../components/utils/types";
import { useStore } from "../../providers/Store";

const currencyList = [CurrencySymbols.BTC, CurrencySymbols.ZEC];
const chainList = [ChainSymbols.ETHC, ChainSymbols.BNCC];

export const MintFlow: FunctionComponent = () => {
  const [store, dispatch] = useStore();
  const { chain } = store;
  const [currencyValue, setCurrencyValue] = useState(0);
  const handleCurrencyValueChange = useCallback((value) => {
    setCurrencyValue(value);
  }, []);

  const [currency, setCurrency] = useState(CurrencySymbols.BTC);
  const handleCurrencyChange = useCallback((event) => {
    setCurrency(event.target.value);
  }, []);

  const handleChainChange = useCallback(
    (event) => {
      dispatch({ type: "setChain", payload: event.target.value });
      // setChain(event.target.value);
    },
    [dispatch]
  );

  const usdValue = currencyValue * 11000; //TODO: calculate with some api

  return (
    <div>
      <BigCurrencyInputWrapper>
        <BigCurrencyInput
          onChange={handleCurrencyValueChange}
          symbol="BTC"
          usdValue={usdValue}
          value={currencyValue}
          placeholder="0"
        />
      </BigCurrencyInputWrapper>
      <AssetDropdownWrapper>
        <AssetDropdown
          mode="send"
          available={currencyList}
          value={currency}
          onChange={handleCurrencyChange}
        />
      </AssetDropdownWrapper>
      <AssetDropdownWrapper>
        <AssetDropdown
          mode="chain"
          available={chainList}
          value={chain}
          onChange={handleChainChange}
        />
      </AssetDropdownWrapper>
      <ActionButtonWrapper>
        <ActionButton>Next</ActionButton>
      </ActionButtonWrapper>
      <Debug
        it={{ currencyValue, currency, chain, store, dispatch: dispatch }}
      />
    </div>
  );
};
