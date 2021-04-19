import { Divider, Fade } from "@material-ui/core";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import {
  AssetDropdown,
  AssetDropdownWrapper,
} from "../../../components/dropdowns/AssetDropdown";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import {
  BigCurrencyInput,
  BigCurrencyInputWrapper,
} from "../../../components/inputs/BigCurrencyInput";
import {
  BigOutlinedTextFieldWrapper,
  OutlinedTextField,
} from "../../../components/inputs/OutlinedTextField";
import { PaperContent } from "../../../components/layout/Paper";
import { Link } from "../../../components/links/Links";
import { CenteredProgress } from "../../../components/progress/ProgressHelpers";
import { TooltipWithIcon } from "../../../components/tooltips/TooltipWithIcon";
import {
  AssetInfo,
  LabelWithValue,
} from "../../../components/typography/TypographyHelpers";
import { releaseChainClassMap } from "../../../services/rentx";
import {
  getChainConfig,
  getCurrencyConfig,
  supportedBurnChains,
  supportedReleaseCurrencies,
  toReleasedCurrency,
} from "../../../utils/assetConfigs";
import { useFetchFees } from "../../fees/feesHooks";
import { getTransactionFees } from "../../fees/feesUtils";
import { $renNetwork } from "../../network/networkSlice";
import { useRenNetworkTracker } from "../../transactions/transactionsHooks";
import {
  isMinimalAmount,
  TxConfigurationStepProps,
  TxType,
} from "../../transactions/transactionsUtils";
import { useSelectedChainWallet } from "../../wallet/walletHooks";
import {
  $wallet,
  setChain,
  setWalletPickerOpened,
} from "../../wallet/walletSlice";
import { getAssetBalance, useFetchBalances } from "../../wallet/walletUtils";
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
  const { walletConnected } = useSelectedChainWallet();
  const { chain, balances } = useSelector($wallet);
  const network = useSelector($renNetwork);
  const { currency, amount, address } = useSelector($release);
  const balance = getAssetBalance(balances, currency);
  useRenNetworkTracker(currency);
  useFetchBalances(supportedReleaseCurrencies);
  const { fees, pending } = useFetchFees(currency, TxType.BURN);
  const { conversionTotal } = getTransactionFees({
    amount,
    type: TxType.BURN,
    fees,
  });

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
  const { MainIcon } = releaseCurrencyConfig;
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

  const isAddressValid = validateAddress(address);
  const hasDefinedAmount = amount && amount > 0;
  const hasMinimalAmount = isMinimalAmount(
    amount,
    conversionTotal,
    TxType.BURN
  );
  const basicCondition =
    hasDefinedAmount &&
    address &&
    isAddressValid &&
    hasMinimalAmount &&
    !pending;
  const hasBalance = balance !== null && amount <= Number(balance);
  let enabled;
  if (walletConnected) {
    enabled = basicCondition && hasBalance;
  } else {
    enabled = basicCondition;
  }
  const showMinimalAmountError =
    walletConnected && hasDefinedAmount && !hasMinimalAmount && !pending;

  const handleNextStep = useCallback(() => {
    if (!walletConnected) {
      dispatch(setWalletPickerOpened(true));
    }
    if (onNext && basicCondition && hasBalance) {
      onNext();
    }
  }, [dispatch, onNext, walletConnected, basicCondition, hasBalance]);
  return (
    <>
      <PaperContent>
        <BigCurrencyInputWrapper>
          <BigCurrencyInput
            onChange={handleAmountChange}
            symbol={currencyConfig.short}
            usdValue={usdAmount}
            value={amount}
            errorText={
              showMinimalAmountError ? (
                <span>
                  Amount too low{" "}
                  <TooltipWithIcon title="After fees have been applied, the amount you will receive is too little." />
                </span>
              ) : (
                ""
              )
            }
          />
        </BigCurrencyInputWrapper>
        <Fade in={walletConnected}>
          <LabelWithValue
            label={`${currencyConfig.short} Balance`}
            value={
              <>
                {balance !== null && walletConnected && (
                  <Link onClick={handleSetMaxBalance} color="primary">
                    {balance}
                  </Link>
                )}
              </>
            }
          />
        </Fade>
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
            available={supportedReleaseCurrencies}
            balances={balances}
            value={currency}
            onChange={handleCurrencyChange}
          />
        </AssetDropdownWrapper>
        <BigOutlinedTextFieldWrapper>
          <OutlinedTextField
            error={!!address && !isAddressValid}
            placeholder={`Enter a Destination ${releaseChainConfig.full} Address`}
            label="Releasing to"
            onChange={handleAddressChange}
            value={address}
          />
        </BigOutlinedTextFieldWrapper>
      </PaperContent>
      <Divider />
      <PaperContent darker topPadding bottomPadding>
        {walletConnected &&
          (pending ? (
            <CenteredProgress />
          ) : (
            <AssetInfo
              label="Receiving:"
              value={
                <NumberFormatText
                  value={conversionTotal}
                  spacedSuffix={releaseCurrencyConfig.short}
                />
              }
              Icon={<MainIcon fontSize="inherit" />}
            />
          ))}
        <ActionButtonWrapper>
          <ActionButton
            onClick={handleNextStep}
            disabled={walletConnected ? !enabled : false}
          >
            {walletConnected ? "Next" : "Connect Wallet"}
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </>
  );
};
