import React, { FunctionComponent, useCallback, useState } from 'react'
import { ActionButton, ActionButtonWrapper, } from '../../components/buttons/Buttons'
import { AssetDropdown, AssetDropdownWrapper, } from '../../components/dropdowns/AssetDropdown'
import { BitcoinIcon, } from '../../components/icons/RenIcons'
import { BigCurrencyInput, BigCurrencyInputWrapper, } from '../../components/inputs/BigCurrencyInput'
import { AssetInfo, SpacedDivider, } from '../../components/typography/TypographyHelpers'
import { Debug } from '../../components/utils/Debug'
import { CurrencySymbols } from '../../components/utils/types'
import {
  bridgeChainToMultiwalletChain,
  getMintedCurrency,
  multiwalletChainToBridgeChain,
  supportedMintCurrencies,
  supportedMintDestinationChains,
} from '../../providers/multiwallet/multiwalletUtils'
import { useStore } from '../../providers/Store'
import { getCurrencyShortLabel } from '../../utils/labels'

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

  const usd2CurrencyRate = 11000; // TODO: calculate with some api
  const usd2MintedCurrencyRate = 10994; // TODO: calculate with some api
  const mintedValue = currencyValue * 0.999;
  const mintedCurrencySymbol = getMintedCurrency(currencySymbol);
  const mintedCurrency = getCurrencyShortLabel(mintedCurrencySymbol);
  const currencyUsdValue = currencyValue * usd2CurrencyRate;
  const mintedCurrencyUsdValue = mintedValue * usd2MintedCurrencyRate;
  const mintedValueLabel = `${mintedValue} ${mintedCurrency}`;
  const mintedValueEquivalentLabel = ` = $${mintedCurrencyUsdValue} USD`;

  return (
    <div>
      <BigCurrencyInputWrapper>
        <BigCurrencyInput
          onChange={handleCurrencyValueChange}
          symbol={currencySymbol}
          usdValue={currencyUsdValue}
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
      <SpacedDivider />
      <AssetInfo
        label="Receiving:"
        value={mintedValueLabel}
        valueEquivalent={mintedValueEquivalentLabel}
        Icon={<BitcoinIcon fontSize="inherit" />}
      />
      <ActionButtonWrapper>
        <ActionButton>Next</ActionButton>
      </ActionButtonWrapper>
      <Debug
        it={{ currencyValue, currencySymbol, chain, store, dispatch: dispatch }}
      />
    </div>
  );
};
