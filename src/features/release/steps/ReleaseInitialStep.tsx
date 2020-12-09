import React, { FunctionComponent, useCallback, useEffect, useMemo, } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ActionButton, ActionButtonWrapper, } from '../../../components/buttons/Buttons'
import { AssetDropdown, AssetDropdownWrapper, } from '../../../components/dropdowns/AssetDropdown'
import { AddressInput, AddressInputWrapper, } from '../../../components/inputs/AddressInput'
import { BigCurrencyInput, BigCurrencyInputWrapper, } from '../../../components/inputs/BigCurrencyInput'
import { PaperContent } from '../../../components/layout/Paper'
import { Link } from '../../../components/links/Links'
import { LabelWithValue } from '../../../components/typography/TypographyHelpers'
import { WalletStatus } from '../../../components/utils/types'
import { useSelectedChainWallet } from '../../../providers/multiwallet/multiwalletHooks'
import { releaseChainClassMap } from '../../../services/rentx'
import {
  getChainConfig,
  getCurrencyConfig,
  supportedBurnChains,
  supportedReleaseCurrencies,
  toReleasedCurrency,
} from '../../../utils/assetConfigs'
import { $network } from '../../network/networkSlice'
import { TxConfigurationStepProps } from '../../transactions/transactionsUtils'
import { $wallet, addOrUpdateBalance, setChain, setWalletPickerOpened, } from '../../wallet/walletSlice'
import { getAssetBalance, useFetchAssetBalance, } from '../../wallet/walletUtils'
import { $release, $releaseUsdAmount, setReleaseAddress, setReleaseAmount, setReleaseCurrency, } from '../releaseSlice'

export const ReleaseInitialStep: FunctionComponent<TxConfigurationStepProps> = ({
  onNext,
}) => {
  const dispatch = useDispatch();
  const { status, account, provider } = useSelectedChainWallet();
  const walletConnected = status === WalletStatus.CONNECTED;
  const { chain, balances } = useSelector($wallet);
  const network = useSelector($network);
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
  const releaseCurrencyConfig = getCurrencyConfig(targetCurrency);
  const releaseChainConfig = getChainConfig(releaseCurrencyConfig.sourceChain);
  const validateAddress = useMemo(() => {
    const ChainClass = (releaseChainClassMap as any)[
      releaseChainConfig.rentxName
    ];
    if (ChainClass) {
      const chainInstance = ChainClass();
      return (address: any) => {
        return chainInstance.utils.addressIsValid(address, network);
      };
    }
    return () => true;
  }, [releaseChainConfig.rentxName, network]);

  //TODO check if balanceOK
  const isAddressValid = validateAddress(address);
  const canProceed =
    balance !== null &&
    amount &&
    address &&
    isAddressValid &&
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
          error={!!address && !isAddressValid}
          placeholder={`Enter a Destination ${releaseChainConfig.full} Address`}
          label="Releasing to"
          onChange={handleAddressChange}
          value={address}
        />
      </AddressInputWrapper>
      <ActionButtonWrapper>
        <ActionButton
          onClick={handleNextStep}
          disabled={!canProceed}
        >
          {walletConnected ? "Next" : "Connect Wallet"}
        </ActionButton>
      </ActionButtonWrapper>
    </PaperContent>
  );
};
