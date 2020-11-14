import { Divider } from '@material-ui/core'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ActionButton, ActionButtonWrapper, } from '../../../components/buttons/Buttons'
import { AssetDropdown, AssetDropdownWrapper, } from '../../../components/dropdowns/AssetDropdown'
import { NumberFormatText } from '../../../components/formatting/NumberFormatText'
import { getCurrencyGreyIcon } from '../../../components/icons/IconHelpers'
import { BigCurrencyInput, BigCurrencyInputWrapper, } from '../../../components/inputs/BigCurrencyInput'
import { PaperContent } from '../../../components/layout/Paper'
import { AssetInfo } from '../../../components/typography/TypographyHelpers'
import {
  getCurrencyShortLabel,
  getMintedDestinationCurrencySymbol,
  supportedMintCurrencies,
  supportedMintDestinationChains
} from '../../../utils/assetConfigs'
import { TxConfigurationStepProps } from '../../transactions/transactionsUtils'
import { $wallet, setChain } from '../../wallet/walletSlice'
import { $mint, $mintFees, $mintUsdAmount, setMintAmount, setMintCurrency, } from '../mintSlice'

export const MintInitialStep: FunctionComponent<TxConfigurationStepProps> = ({
  onNext,
}) => {
  const dispatch = useDispatch();

  const { currency, amount } = useSelector($mint);
  const { chain } = useSelector($wallet);
  const { conversionTotal } = useSelector($mintFees); // calculate by method
  const currencyUsdValue = useSelector($mintUsdAmount);

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
    dispatch(setMintAmount(amount)); // TODO: why
    if (onNext) {
      onNext();
    }
  }, [dispatch, amount, onNext]);

  const mintedCurrencySymbol = getMintedDestinationCurrencySymbol(currency);
  const mintedCurrency = getCurrencyShortLabel(mintedCurrencySymbol);

  const MintedCurrencyIcon = useMemo(
    () => getCurrencyGreyIcon(mintedCurrencySymbol),
    [mintedCurrencySymbol]
  );

  const nextEnabled = !!amount;

  return (
    <>
      <PaperContent bottomPadding>
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
            label="Send"
            mode="send"
            available={supportedMintCurrencies}
            value={currency}
            onChange={handleCurrencyChange}
          />
        </AssetDropdownWrapper>
        <AssetDropdownWrapper>
          <AssetDropdown
            label="Destination Chain"
            mode="chain"
            available={supportedMintDestinationChains}
            value={chain}
            onChange={handleChainChange}
          />
        </AssetDropdownWrapper>
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <AssetInfo
          label="Receiving:"
          value={
            <NumberFormatText
              value={conversionTotal}
              suffix={` ${mintedCurrency}`}
              decimalScale={5}
            />
          }
          Icon={<MintedCurrencyIcon fontSize="inherit" />}
        />
        <ActionButtonWrapper>
          <ActionButton onClick={handleNextStep} disabled={!nextEnabled}>
            Next
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </>
  );
};
