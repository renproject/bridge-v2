import React, { FunctionComponent, useCallback, useEffect } from "react";
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
  AddressInput,
  AddressInputWrapper,
} from "../../../components/inputs/AddressInput";
import {
  BigCurrencyInput,
  BigCurrencyInputWrapper,
} from "../../../components/inputs/BigCurrencyInput";
import { PaperContent } from "../../../components/layout/Paper";
import { Link } from "../../../components/links/Links";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import { WalletStatus } from "../../../components/utils/types";
import { useSelectedChainWallet } from "../../../providers/multiwallet/multiwalletHooks";
import {
  getChainConfig,
  getCurrencyConfig,
  supportedBurnChains,
  supportedReleaseCurrencies,
  toReleasedCurrency,
} from "../../../utils/assetConfigs";
import { TxConfigurationStepProps } from "../../transactions/transactionsUtils";
import {
  $wallet,
  addOrUpdateBalance,
  setChain,
  setWalletPickerOpened,
} from "../../wallet/walletSlice";
import {
  getAssetBalance,
  useFetchAssetBalance,
} from "../../wallet/walletUtils";
import {
  $release,
  $releaseUsdAmount,
  setReleaseAddress,
  setReleaseAmount,
  setReleaseCurrency,
} from "../releaseSlice";

export const ReleaseInitialStep: FunctionComponent<TxConfigurationStepProps> = ({
  onNext,
}) => {
  const dispatch = useDispatch();
  const { status, account, provider } = useSelectedChainWallet();
  const walletConnected = status === WalletStatus.CONNECTED;
  const { chain, balances } = useSelector($wallet);
  const { currency, amount, address } = useSelector($release);
  const balance = getAssetBalance(balances, currency);
  const { fetchAssetBalance } = useFetchAssetBalance();
  const fetchAllBalances = useCallback(() => {
    // TODO: maybe hook?
    console.log("refetching");
    for (const currencySymbol of supportedReleaseCurrencies) {
      const sourceCurrencySymbol = toReleasedCurrency(currencySymbol);
      fetchAssetBalance(sourceCurrencySymbol).then((balance: any) => {
        if (balance === null) {
          return;
        }
        dispatch(
          addOrUpdateBalance({
            symbol: currencySymbol,
            balance,
          })
        );
      });
    }
  }, [dispatch, fetchAssetBalance]);

  useEffect(fetchAllBalances, [provider, account]);

  const usdAmount = useSelector($releaseUsdAmount);
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
  const handleAddressChange = useCallback(
    (event) => {
      dispatch(setReleaseAddress(event.target.value));
    },
    [dispatch]
  );

  const handleSetMaxBalance = useCallback(() => {
    if (!!balance) {
      dispatch(setReleaseAmount(balance));
    }
  }, [dispatch, balance]);

  const targetCurrency = toReleasedCurrency(currency);
  const currencyConfig = getCurrencyConfig(currency);
  const targetCurrencyConfig = getCurrencyConfig(targetCurrency);
  const targetChainConfig = getChainConfig(targetCurrencyConfig.sourceChain);
  //TODO check if balanceOK
  const canProceed =
    balance !== null &&
    amount &&
    address &&
    amount <= Number(balance) &&
    amount > 0;

  const handleNextStep = useCallback(() => {
    if (!walletConnected) {
      dispatch(setWalletPickerOpened(true));
    }
    if (onNext && canProceed) {
      onNext();
    }
  }, [dispatch, onNext, canProceed, walletConnected]);
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
          <>
            {balance !== null && (
              <Link onClick={handleSetMaxBalance} color="primary">
                {balance}
              </Link>
            )}
          </>
        }
      />
      <AssetDropdownWrapper>
        <AssetDropdown
          label="Chain"
          mode="chain"
          available={supportedBurnChains}
          value={chain}
          onChange={handleChainChange}
        />
      </AssetDropdownWrapper>
      <AssetDropdownWrapper>
        <AssetDropdown
          label="Asset"
          mode="send"
          available={supportedReleaseCurrencies}
          balances={balances}
          value={currency}
          onChange={handleCurrencyChange}
        />
      </AssetDropdownWrapper>
      <AddressInputWrapper>
        <AddressInput
          placeholder={`Enter a Destination ${targetChainConfig.full} Address`}
          label="Releasing to"
          onChange={handleAddressChange}
          value={address}
        />
      </AddressInputWrapper>
      <ActionButtonWrapper>
        <ActionButton
          onClick={handleNextStep}
          disabled={!walletConnected || !canProceed}
        >
          {walletConnected ? "Next" : "Connect Wallet"}
        </ActionButton>
      </ActionButtonWrapper>
    </PaperContent>
  );
};
