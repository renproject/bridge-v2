import { Collapse, Divider } from "@material-ui/core";
import { Asset, Chain } from "@renproject/chains";
import BigNumber from "bignumber.js";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useRouteMatch } from "react-router-dom";
import { ActionButton } from "../../../components/buttons/Buttons";
import {
  RichDropdown,
  RichDropdownWrapper,
} from "../../../components/dropdowns/RichDropdown";
import {
  BigCurrencyInput,
  BigCurrencyInputWrapper,
} from "../../../components/inputs/BigCurrencyInput";
import {
  BigOutlinedTextFieldWrapper,
  OutlinedTextField,
} from "../../../components/inputs/OutlinedTextField";
import { HorizontalPadder } from "../../../components/layout/LayoutHelpers";
import { PaperContent } from "../../../components/layout/Paper";
import { InlineSkeleton } from "../../../components/progress/ProgressHelpers";
import { TooltipWithIcon } from "../../../components/tooltips/TooltipWithIcon";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { paths } from "../../../pages/routes";
import { chainsConfig, getChainConfig } from "../../../utils/chainsConfig";
import {
  getAssetConfig,
  getRenAssetName,
  supportedAssets,
} from "../../../utils/tokensConfig";
import { $exchangeRates } from "../../marketData/marketDataSlice";
import { findAssetExchangeRate } from "../../marketData/marketDataUtils";
import { useCurrentNetworkChains } from "../../network/networkHooks";
import { useCurrentChainWallet, useWallet } from "../../wallet/walletHooks";
import { setChain, setPickerOpened } from "../../wallet/walletSlice";
import {
  getAssetOptionData,
  getChainOptionData,
} from "../components/DropdownHelpers";
import { MintIntro } from "../components/MintHelpers";
import {
  useAddressValidator,
  useEthereumChainAssetBalance,
  useGatewayMeta,
} from "../gatewayHooks";
import {
  $gateway,
  setAmount,
  setAsset,
  setFrom,
  setFromTo,
  setTo,
  setToAddress,
} from "../gatewaySlice";
import { GatewayStepProps } from "./stepUtils";

const assets = supportedAssets;
const allChains = Object.keys(chainsConfig);

const forceShowDropdowns = false;

export const GatewayInitialStep: FunctionComponent<GatewayStepProps> = ({
  onNext,
}) => {
  const dispatch = useDispatch();
  const { path } = useRouteMatch();
  const isMint = path === paths.MINT;
  const isRelease = path === paths.RELEASE;
  const { t } = useTranslation();
  const { asset, from, to, amount, toAddress } = useSelector($gateway);
  const meta = useGatewayMeta(asset, from, to);
  const { isFromContractChain, isH2H } = meta;
  const [fromChains, setFromChains] = useState(allChains);
  const [toChains, setToChains] = useState(allChains);

  const filterChains = useCallback(
    (asset: Asset) => {
      const { lockChain, mintChains } = getAssetConfig(asset);
      if (isMint) {
        setFromChains([lockChain]);
        setToChains(mintChains);
        dispatch(setFromTo({ from: lockChain, to: mintChains[0] }));
      } else if (isRelease) {
        setFromChains(mintChains);
        setToChains([lockChain]);
        dispatch(setFromTo({ from: mintChains[0], to: lockChain }));
      }
    },
    [dispatch, isMint, isRelease]
  );

  const [amountTouched, setAmountTouched] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);
  const reset = useCallback(() => {
    setAmountTouched(false);
    setAddressTouched(false);
  }, []);

  useEffect(() => {
    filterChains(asset);
  }, [asset, filterChains]);

  const handleAssetChange = useCallback(
    (event) => {
      const newAsset = event.target.value as Asset;
      dispatch(setAsset(newAsset));
      filterChains(newAsset);
    },
    [dispatch, filterChains]
  );
  const handleFromChange = useCallback(
    (event) => {
      dispatch(setFrom(event.target.value as Chain));
    },
    [dispatch]
  );
  const handleToChange = useCallback(
    (event) => {
      dispatch(setTo(event.target.value as Chain));
    },
    [dispatch]
  );

  const handleAmountChange = useCallback(
    (value) => {
      setAmountTouched(true);
      dispatch(setAmount(value));
    },
    [dispatch]
  );

  const requiresValidAddress = isRelease && !isH2H;
  const handleAddressChange = useCallback(
    (event) => {
      setAddressTouched(true);
      dispatch(setToAddress(event.target.value));
    },
    [dispatch]
  );
  const { validateAddress } = useAddressValidator(to);
  const isAddressValid = validateAddress(toAddress);
  const hasAddressError =
    requiresValidAddress && addressTouched && !isAddressValid;

  useEffect(() => {
    const assetConfig = getAssetConfig(asset);
    reset();
    console.log(assetConfig, from, to);
    if (isMint) {
      if (assetConfig.lockChainConnectionRequired) {
        console.log("setting wallet chain", assetConfig.lockChain);
        dispatch(setChain(assetConfig.lockChain));
      } else {
        console.log("setting wallet chain", to);
        dispatch(setChain(to));
      }
    } else if (isRelease) {
      console.log("setting wallet chain", from);
      dispatch(setChain(from));
    }
  }, [dispatch, reset, isMint, isRelease, asset, from, to]);

  const hideFrom = isMint && fromChains.length === 1;
  const hideTo = isRelease && toChains.length === 1;

  const toChainConfig = getChainConfig(to);
  // TODO: fix
  const renAsset = getRenAssetName(asset);
  const { connected } = useCurrentChainWallet();
  const handleConnect = useCallback(() => {
    dispatch(setPickerOpened(true));
  }, [dispatch]);

  const rates = useSelector($exchangeRates);
  const assetUsdRate = findAssetExchangeRate(rates, asset);
  const amountUsd =
    assetUsdRate !== null
      ? new BigNumber(amount).multipliedBy(assetUsdRate).toFixed()
      : "";

  // useEffect(() => {
  //   if (isFromContractChain) {
  //     dispatch(setChain(from));
  //   }
  // }, [isFromContractChain]);

  const chains = useCurrentNetworkChains();
  const { account } = useWallet(from);
  const { balance } = useEthereumChainAssetBalance(
    chains[from].chain as any,
    asset,
    account
  );

  const requiresInitialAmount = isFromContractChain;
  const hasInitialAmount = amount !== "";
  const hasMinimalAmountBalanceError =
    requiresInitialAmount &&
    balance !== null &&
    (Number(amount) > Number(balance) || !hasInitialAmount);

  const showAmountError = amountTouched && hasMinimalAmountBalanceError;

  console.log(
    balance,
    amount,
    Number(amount) > Number(balance),
    hasMinimalAmountBalanceError
  );

  const handleNext = useCallback(() => {
    if (onNext) {
      let ok = true;
      if (requiresValidAddress && !isAddressValid) {
        setAddressTouched(true);
        ok = false;
      }
      if (requiresInitialAmount && hasMinimalAmountBalanceError) {
        setAmountTouched(true);
        ok = false;
      }
      if (ok) {
        onNext();
      }
    }
  }, [
    onNext,
    requiresValidAddress,
    isAddressValid,
    requiresInitialAmount,
    hasMinimalAmountBalanceError,
  ]);

  return (
    <>
      <PaperContent bottomPadding>
        {isMint && !isFromContractChain && <MintIntro />}
        {requiresInitialAmount && (
          <BigCurrencyInputWrapper>
            <BigCurrencyInput
              onChange={handleAmountChange}
              symbol={renAsset}
              usdValue={amountUsd}
              value={amount}
              errorText={
                showAmountError && hasMinimalAmountBalanceError ? (
                  <span>
                    {t("release.amount-too-low-error")}{" "}
                    <TooltipWithIcon
                      title={
                        <span>{t("release.amount-too-low-error-tooltip")}</span>
                      }
                    />
                  </span>
                ) : (
                  ""
                )
              }
            />
          </BigCurrencyInputWrapper>
        )}
        {connected && isFromContractChain ? (
          <HorizontalPadder>
            <LabelWithValue
              label={`${renAsset} ${t("common.balance")}:`}
              value={
                balance !== null ? (
                  balance
                ) : (
                  <InlineSkeleton height={17} width={45} />
                )
              }
            />
          </HorizontalPadder>
        ) : null}
        <RichDropdownWrapper>
          <RichDropdown
            label={isMint ? t("mint.mint-label") : t("release.release-label")}
            supplementalLabel={t("common.asset-label")}
            options={assets}
            getOptionData={getAssetOptionData}
            optionMode={isRelease}
            value={asset}
            onChange={handleAssetChange}
          />
        </RichDropdownWrapper>
        <Collapse in={!hideFrom || forceShowDropdowns}>
          <RichDropdownWrapper>
            <RichDropdown
              label={t("release.from-label")}
              supplementalLabel={t("common.blockchain-label")}
              getOptionData={getChainOptionData}
              options={fromChains}
              value={from}
              onChange={handleFromChange}
              multipleNames={false}
            />
          </RichDropdownWrapper>
        </Collapse>
        <Collapse in={!hideTo || forceShowDropdowns}>
          <RichDropdownWrapper>
            <RichDropdown
              label={t("release.to-label")}
              supplementalLabel={t("common.blockchain-label")}
              getOptionData={getChainOptionData}
              options={toChains}
              value={to}
              onChange={handleToChange}
              multipleNames={false}
            />
          </RichDropdownWrapper>
        </Collapse>
        <Collapse in={isRelease && !isH2H}>
          <BigOutlinedTextFieldWrapper>
            <OutlinedTextField
              error={hasAddressError}
              helperText={
                hasAddressError
                  ? t("release.releasing-to-error-text")
                  : undefined
              }
              placeholder={t("release.releasing-to-placeholder", {
                chain: toChainConfig.fullName,
              })}
              label={t("release.releasing-to-label")}
              onChange={handleAddressChange}
              value={toAddress}
            />
          </BigOutlinedTextFieldWrapper>
        </Collapse>
      </PaperContent>
      <Divider />
      <PaperContent darker bottomPadding topPadding>
        {connected ? (
          <ActionButton
            onClick={handleNext}
            disabled={hasAddressError || hasMinimalAmountBalanceError}
          >
            {t("common.next-label")}
          </ActionButton>
        ) : (
          <ActionButton onClick={handleConnect}>
            {t("wallet.connect")}
          </ActionButton>
        )}
      </PaperContent>
      <Debug
        it={{
          meta,
          amountTouched,
          addressTouched,
          addressError: hasAddressError,
        }}
      />
    </>
  );
};
