import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
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
import { useSelectedChainWallet } from "../../../providers/multiwallet/multiwalletHooks";
import {
  getChainConfig,
  getCurrencyConfig,
  getReleasedDestinationCurrencySymbol,
  supportedReleaseCurrencies,
  supportedReleaseSourceChains,
} from "../../../utils/assetConfigs";
import { TxConfigurationStepProps } from "../../transactions/transactionsUtils";
import {
  $wallet,
  setChain,
  setWalletPickerOpened,
} from "../../wallet/walletSlice";
import { fetchAssetBalance } from "../../wallet/walletUtils";
import {
  $release,
  $releaseUsdAmount,
  setReleaseAddress,
  setReleaseAmount,
  setReleaseCurrency,
} from "../releaseSlice";

// const getBalance = (provider: any, token: string) => {};

export const ReleaseInitialStep: FunctionComponent<TxConfigurationStepProps> = ({
  onNext,
}) => {
  const dispatch = useDispatch();
  const { status: walletStatus, account, provider } = useSelectedChainWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const { chain } = useSelector($wallet);
  const { currency, amount, address } = useSelector($release);
  useEffect(() => {
    if (provider && account) {
      fetchAssetBalance(provider, account, "BTC").then((balance) => {
        setBalance(balance);
      });
    }
  }, [provider, account]);
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
    if (balance !== null) {
      dispatch(setReleaseAmount(balance));
    }
  }, [dispatch, balance]);

  const targetCurrency = getReleasedDestinationCurrencySymbol(currency);
  const currencyConfig = getCurrencyConfig(currency);
  const targetCurrencyConfig = getCurrencyConfig(targetCurrency);
  const targetChainConfig = getChainConfig(targetCurrencyConfig.sourceChain);
  //TODO check if balanceOK
  const canProceed = balance !== null && amount && address && amount <= balance;

  const handleNextStep = useCallback(() => {
    if (walletStatus !== "connected") {
      dispatch(setWalletPickerOpened(true));
    }
    if (onNext && canProceed) {
      onNext();
    }
  }, [dispatch, onNext, canProceed, walletStatus]);
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
      <AddressInputWrapper>
        <AddressInput
          placeholder={`Enter a Destination ${targetChainConfig.full} Address`}
          label="Releasing to"
          onChange={handleAddressChange}
          value={address}
        />
      </AddressInputWrapper>
      <ActionButtonWrapper>
        <ActionButton onClick={handleNextStep} disabled={walletStatus === "connected" && !canProceed}>
          {walletStatus !== "connected" ? "Connect Wallet" : "Next"}
        </ActionButton>
      </ActionButtonWrapper>
    </PaperContent>
  );
};
