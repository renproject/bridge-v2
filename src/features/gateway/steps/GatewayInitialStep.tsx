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
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
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
import { PaperContent } from "../../../components/layout/Paper";
import { TooltipWithIcon } from "../../../components/tooltips/TooltipWithIcon";
import { Debug } from "../../../components/utils/Debug";
import { paths } from "../../../pages/routes";
import {
  getAssetConfig,
  getRenAssetConfig,
  supportedAssets,
} from "../../../utils/assetsConfig";
import { chainsConfig, getChainConfig } from "../../../utils/chainsConfig";
import { $exchangeRates } from "../../marketData/marketDataSlice";
import { findAssetExchangeRate } from "../../marketData/marketDataUtils";
import { useCurrentNetworkChains } from "../../network/networkHooks";
import { TransactionSafetyWarning } from "../../transactions/components/TransactionsHistoryHelpers";
import { useCurrentChainWallet, useWallet } from "../../wallet/walletHooks";
import { setChain, setPickerOpened } from "../../wallet/walletSlice";
import {
  BalanceInfo,
  BalanceInfoPlaceholder,
} from "../components/BalanceHelpers";
import {
  getAssetOptionData,
  getChainOptionData,
} from "../components/DropdownHelpers";
import { MintIntro } from "../components/MintHelpers";
import {
  GatewayIOType,
  useAddressValidator,
  useContractChainAssetBalance,
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
import { getSendLabel } from "./shared/TransactionStatuses";
import { GatewayStepProps } from "./stepUtils";

const allAssets = supportedAssets;
const contractAssets = allAssets.filter(
  (asset) => getAssetConfig(asset).lockChainConnectionRequired === true
);
const allChains = Object.keys(chainsConfig);

const forceShowDropdowns = false;

const getIoTypeFromPath = (path: string) => {
  if (path === paths.MINT) {
    return GatewayIOType.lockAndMint;
  } else if (path === paths.BRIDGE) {
    return GatewayIOType.burnAndMint;
  } else if (path === paths.RELEASE) {
    return GatewayIOType.burnAndRelease;
  }
  return GatewayIOType.burnAndMint;
};

export const GatewayInitialStep: FunctionComponent<GatewayStepProps> = ({
  onNext,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const { path } = useRouteMatch();
  const isMint = path === paths.MINT;
  const isRelease = path === paths.RELEASE;
  const isMove = path === paths.BRIDGE;

  const ioType = getIoTypeFromPath(path);

  const { t } = useTranslation();
  const { asset, from, to, amount, toAddress } = useSelector($gateway);
  const meta = useGatewayMeta(asset, from, to);
  const { isFromContractChain, isH2H } = meta;
  const [assets, setAssets] = useState(allAssets);
  const [fromChains, setFromChains] = useState(allChains);
  const [toChains, setToChains] = useState(allChains);

  // clean state when creating new page
  useEffect(() => {
    console.log("init", location.state);
    if (
      location.state !== undefined &&
      JSON.stringify(location.state) !== "{}"
    ) {
      history.replace({ ...location, state: {} });
    }
  }, [history, location]);

  // the main filtering flow when navigating through tabs
  const filterChains = useCallback(
    (asset: Asset) => {
      const { lockChain, mintChains } = getAssetConfig(asset);
      console.log("mintChains", mintChains);
      if (ioType === "lockAndMint") {
        setAssets(allAssets);
        // dispatch(setAsset(allAssets[0]));
        setFromChains([lockChain]);
        setToChains(mintChains);
        dispatch(setFromTo({ from: lockChain, to: mintChains[0] }));
      } else if (ioType === "burnAndRelease") {
        setAssets(allAssets);
        // dispatch(setAsset(allAssets[0]));
        setFromChains(mintChains);
        setToChains([lockChain]);
        dispatch(setFromTo({ from: mintChains[0], to: lockChain }));
      } else if (ioType === "burnAndMint") {
        // move is allowed to all contract chains except assets lockChain (originChain)
        setAssets(contractAssets);
        const nonOriginChains = mintChains.filter(
          (chain) => chain !== lockChain
        );
        setFromChains(nonOriginChains);
        const newFrom = nonOriginChains[0];
        dispatch(setFrom(newFrom));
      }
    },
    [dispatch, ioType]
  );

  useEffect(() => {
    if (ioType === "burnAndMint") {
      const { lockChain, mintChains } = getAssetConfig(asset);
      const nonOriginNotFromChains = mintChains.filter(
        (chain) => chain !== lockChain && chain !== from
      );
      setToChains(nonOriginNotFromChains);
      dispatch(setTo(nonOriginNotFromChains[0]));
    }
  }, [dispatch, ioType, asset, from]);

  useEffect(() => {
    filterChains(asset);
  }, [asset, filterChains]);

  useEffect(() => {
    dispatch(setAsset(assets[0]));
  }, [dispatch, assets]);

  const [amountTouched, setAmountTouched] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);
  const reset = useCallback(() => {
    setAmountTouched(false);
    setAddressTouched(false);
  }, []);

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

  const handleSetMaxAmount = useCallback(
    (newAmount: string) => {
      handleAmountChange(newAmount);
    },
    [handleAmountChange]
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
    } else if (isMove) {
      console.log("setting wallet chain", from);
      dispatch(setChain(from));
    }
  }, [dispatch, reset, isMint, isRelease, isMove, asset, from, to]);

  const hideFrom = isMint && fromChains.length === 1;
  const hideTo = isRelease && toChains.length === 1;

  const toChainConfig = getChainConfig(to);
  // TODO: fix
  const renAssetConfig = getRenAssetConfig(asset);
  const assetConfig = getAssetConfig(asset);
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

  const chains = useCurrentNetworkChains();
  const { account, targetNetwork, connected: fromConnected } = useWallet(from);
  const { balance } = useContractChainAssetBalance(
    chains[from].chain as any,
    asset,
    account,
    isFromContractChain ? fromConnected : undefined
  );
  // const balanceAsset = isH2H ? assetConfig.shortName : renAssetConfig.shortName;
  const balanceAsset =
    isRelease || isMove
      ? renAssetConfig.shortName
      : isH2H
      ? assetConfig.shortName
      : renAssetConfig.shortName;
  const balanceChain = isRelease ? from : isH2H ? from : to;

  const requiresInitialAmount = isFromContractChain;
  const hasInitialAmount = amount !== "";
  const hasAmountBalanceError =
    requiresInitialAmount &&
    balance !== null &&
    Number(amount) > Number(balance);

  const showAmountError = amountTouched && hasAmountBalanceError;

  // console.log(
  //   balance,
  //   amount,
  //   Number(amount) > Number(balance),
  //   hasMinimalAmountBalanceError
  // );

  const handleNext = useCallback(() => {
    if (onNext) {
      let ok = true;
      if (requiresValidAddress && !isAddressValid) {
        setAddressTouched(true);
        ok = false;
      }
      if (requiresInitialAmount && hasAmountBalanceError) {
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
    hasAmountBalanceError,
  ]);

  return (
    <>
      <TransactionSafetyWarning />
      <PaperContent bottomPadding>
        {isMint && !requiresInitialAmount && <MintIntro />}
        {requiresInitialAmount && (
          <BigCurrencyInputWrapper>
            <BigCurrencyInput
              onChange={handleAmountChange}
              symbol={renAssetConfig.shortName}
              usdValue={amountUsd}
              value={amount}
              errorText={
                showAmountError && hasAmountBalanceError ? (
                  <span>
                    {t("gateway.amount-too-big-error")}{" "}
                    <TooltipWithIcon
                      title={
                        <span>{t("gateway.amount-too-big-error-tooltip")}</span>
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
        {fromConnected && isFromContractChain ? (
          <BalanceInfo
            balance={balance}
            asset={balanceAsset}
            chain={balanceChain}
            onSetMaxAmount={handleSetMaxAmount}
          />
        ) : (
          <BalanceInfoPlaceholder />
        )}
        <RichDropdownWrapper>
          <RichDropdown
            label={getSendLabel(asset, ioType, t)}
            supplementalLabel={t("common.asset-label")}
            options={assets}
            getOptionData={getAssetOptionData}
            optionMode={isRelease || isMove}
            value={asset}
            onChange={handleAssetChange}
          />
        </RichDropdownWrapper>
        <Collapse in={!hideFrom || forceShowDropdowns}>
          <RichDropdownWrapper>
            <RichDropdown
              label={t("common.from-label")}
              supplementalLabel={t("common.blockchain-label")}
              getOptionData={getChainOptionData}
              options={fromChains}
              value={from}
              onChange={handleFromChange}
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
            disabled={
              hasAddressError ||
              hasAmountBalanceError ||
              (requiresInitialAmount && !Number(amount))
            }
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
          targetNetwork,
          meta,
          amountTouched,
          addressTouched,
          hasAmountBalanceError,
          hasInitialAmount,
          requiresInitialAmount,
          addressError: hasAddressError,
        }}
      />
    </>
  );
};
