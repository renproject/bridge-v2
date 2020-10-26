import React, { FunctionComponent, useCallback, useState, } from 'react'
import { ActionButton, ActionButtonWrapper, } from '../../components/buttons/Buttons'
import { AssetDropdown, AssetDropdownWrapper, } from '../../components/dropdowns/AssetDropdown'
import { BigCurrencyInput, BigCurrencyInputWrapper, } from '../../components/inputs/BigCurrencyInput'
import { Debug } from '../../components/utils/Debug'
import { CurrencySymbols } from '../../components/utils/types'
import {
  bridgeChainToMultiwalletChain,
  multiwalletChainToBridgeChain,
  supportedMintCurrencies,
  supportedMintDestinationChains,
} from '../../providers/multiwallet/multiwalletUtils'
import { useStore } from '../../providers/Store'

export const MintFlow: FunctionComponent = () => {
  const [store, dispatch] = useStore();
  const { chain } = store;
  const chainSymbol = multiwalletChainToBridgeChain(chain);
  const [currencyValue, setCurrencyValue] = useState(0);
  const handleCurrencyValueChange = useCallback((value) => {
    setCurrencyValue(value);
  }, []);

  const [currencySymbol, setCurrencySymbol] = useState(CurrencySymbols.BTC);
  const handleCurrencyChange = useCallback((event) => {
    setCurrencySymbol(event.target.value);
  }, []);

  const handleChainChange = useCallback(
    (event) => {
      dispatch({
        type: "setChain",
        payload: bridgeChainToMultiwalletChain(event.target.value),
      });
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
          symbol={currencySymbol}
          usdValue={usdValue}
          value={currencyValue}
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
      <ActionButtonWrapper>
        <ActionButton>Next</ActionButton>
      </ActionButtonWrapper>
      <Debug
        it={{ currencyValue, currencySymbol, chain, store, dispatch: dispatch }}
      />
    </div>
  );
};
