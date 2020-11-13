import React, { FunctionComponent, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ActionButton, ActionButtonWrapper, } from '../../../components/buttons/Buttons'
import { AssetDropdown, AssetDropdownWrapper, } from '../../../components/dropdowns/AssetDropdown'
import { AddressInput } from '../../../components/inputs/AddressInput'
import { BigCurrencyInput, BigCurrencyInputWrapper, } from '../../../components/inputs/BigCurrencyInput'
import { PaperContent } from '../../../components/layout/Paper'
import { Link } from '../../../components/links/Links'
import { LabelWithValue } from '../../../components/typography/TypographyHelpers'
import {
  getCurrencyConfig,
  getReleasedDestinationCurrencySymbol,
  supportedReleaseCurrencies,
  supportedReleaseSourceChains,
} from '../../../utils/assetConfigs'
import { TxConfigurationStepProps } from '../../transactions/transactionsUtils'
import { $wallet, setChain } from '../../wallet/walletSlice'
import {
  $release,
  $releaseCurrencyUsdAmount,
  setReleaseAddress,
  setReleaseAmount,
  setReleaseCurrency,
} from '../releaseSlice'

export const ReleaseInitialStep: FunctionComponent<TxConfigurationStepProps> = () => {
  const dispatch = useDispatch();
  const { chain } = useSelector($wallet);
  const { currency, amount } = useSelector($release);
  const usdAmount = useSelector($releaseCurrencyUsdAmount);
  const handleChainChange = useCallback(
    (event) => {
      dispatch(setChain(event.target.value));
    },
    [dispatch]
  );
  const handleCurrencyChange = useCallback(
    (event) => {
      dispatch(setReleaseCurrency(event.target.value));
    },
    [dispatch]
  );
  const handleAmountChange = useCallback(
    (value) => {
      dispatch(setReleaseAmount(value));
    },
    [dispatch]
  );

  const handleAddressChange = useCallback((event) => {
    dispatch(setReleaseAddress(event.target.value));
  }, []);

  const balance = 0.02; // TODO retrieve when wallet balances done
  const handleSetMaxBalance = useCallback(() => {
    dispatch(setReleaseAmount(balance));
  }, [balance]);

  const targetCurrency = getReleasedDestinationCurrencySymbol(currency);
  const currencyConfig = getCurrencyConfig(currency);
  const targetCurrencyConfig = getCurrencyConfig(targetCurrency);

  return (
    <PaperContent bottomPadding>
      <BigCurrencyInputWrapper>
        <BigCurrencyInput
          onChange={handleAmountChange}
          symbol={currencyConfig.short}
          usdValue={usdAmount}
          value={amount}
        />
      </BigCurrencyInputWrapper>
      <LabelWithValue
        label={`${currencyConfig.short} Balance`}
        value={
          <Link onClick={handleSetMaxBalance} color="primary">
            {balance}
          </Link>
        } //TODO: suppose to be an action link button which sets up max(balance)
      />
      <AssetDropdownWrapper>
        <AssetDropdown
          label="Destination Chain"
          mode="chain"
          available={supportedReleaseSourceChains}
          value={chain}
          onChange={handleChainChange}
        />
      </AssetDropdownWrapper>
      <AssetDropdownWrapper>
        <AssetDropdown
          label="Asset"
          mode="send"
          available={supportedReleaseCurrencies}
          value={currency}
          onChange={handleCurrencyChange}
        />
      </AssetDropdownWrapper>
      <AssetDropdownWrapper>
        <AddressInput
          chainLabel={targetCurrencyConfig.sourceChain}
          label="Releasing to"
          onChange={handleAddressChange}
          value={targetCurrencyConfig.sourceChain}
        />
      </AssetDropdownWrapper>
      <ActionButtonWrapper>
        <ActionButton>Next</ActionButton>
      </ActionButtonWrapper>
    </PaperContent>
  );
};
