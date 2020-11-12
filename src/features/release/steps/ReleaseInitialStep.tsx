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
import {
  BigCurrencyInput,
  BigCurrencyInputWrapper,
} from "../../../components/inputs/BigCurrencyInput";
import { PaperContent } from "../../../components/layout/Paper";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import {
  getCurrencyConfig,
  supportedReleaseCurrencies,
  supportedReleaseSourceChains,
} from "../../../utils/assetConfigs";
import { TxConfigurationStepProps } from "../../transactions/transactionsUtils";
import { $wallet, setChain } from "../../wallet/walletSlice";
import {
  $release,
  $releaseCurrencyUsdAmount,
  setReleaseAmount,
  setReleaseCurrency,
} from "../releaseSlice";

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

  const currencyConfig = getCurrencyConfig(currency);
  // const destinationCurrency = getCurrencyConfig(
  //   getReleasedDestinationCurrencySymbol(currency)
  // );

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
        value="?" //TODO: suppose to be an action link button which sets up max(balance)
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
      <ActionButtonWrapper>
        <ActionButton>Next</ActionButton>
      </ActionButtonWrapper>
    </PaperContent>
  );
};
