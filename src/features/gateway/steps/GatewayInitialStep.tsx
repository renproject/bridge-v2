import { Collapse, Divider } from "@material-ui/core";
import { Asset, Chain } from "@renproject/chains";
import BigNumber from "bignumber.js";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
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
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
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
import { MessageWithTooltip } from "../../../components/tooltips/TooltipWithIcon";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { paths } from "../../../pages/routes";
import { useNotifications } from "../../../providers/Notifications";
import {
  getAssetConfig,
  getUIAsset,
  supportedAssets,
} from "../../../utils/assetsConfig";
import { chainsConfig, getChainConfig } from "../../../utils/chainsConfig";
import { $exchangeRates } from "../../marketData/marketDataSlice";
import { findAssetExchangeRate } from "../../marketData/marketDataUtils";
import { useCurrentNetworkChains } from "../../network/networkHooks";
import { TransactionSafetyWarning } from "../../transactions/components/TransactionsHistoryHelpers";
import {
  useCurrentChainWallet,
  useSyncScreening,
  useWallet,
} from "../../wallet/walletHooks";
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
  useGatewayFeesWithoutGateway,
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
import { useWhitelist } from "../renJSHooks";
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

  const { whitelistAssets, whitelistToChains, whitelistFromChains } =
    useWhitelist();

  const { t } = useTranslation();
  const { asset, from, to, amount, toAddress } = useSelector($gateway);
  const meta = useGatewayMeta(asset, from, to);
  const { isFromContractChain, isH2H, error } = meta;
  const { minimumAmount } = useGatewayFeesWithoutGateway(
    asset as Asset,
    from,
    to,
    amount
  );
  const { showNotification, closeNotification } = useNotifications();
  const hasNetworkError = Boolean(error);
  useEffect(() => {
    let key: any;
    if (error) {
      console.error("network error", error);
      const fromChainConfig = getChainConfig(from);
      const toChainConfig = getChainConfig(to);
      key = showNotification(
        `We detected network instability for either ${fromChainConfig.shortName} or ${toChainConfig.shortName}, which will prevent processing of deposits for the moment. Please revisit soon.`,
        {
          variant: "warning",
        }
      );
    }
    return () => {
      if (key) {
        closeNotification(key);
      }
    };
  }, [showNotification, closeNotification, error, from, to]);
  const [assets, setAssets] = useState(allAssets);
  const [fromChains, setFromChains] = useState(allChains);
  const [toChains, setToChains] = useState(allChains);

  // clean state when creating new page
  useEffect(() => {
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
    dispatch(setToAddress(""));
    filterChains(asset);
  }, [dispatch, asset, filterChains]);

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
    if (isMint) {
      if (assetConfig.lockChainConnectionRequired) {
        console.info("setting wallet chain", assetConfig.lockChain);
        dispatch(setChain(assetConfig.lockChain));
      } else {
        console.info("setting wallet chain", to);
        dispatch(setChain(to));
      }
    } else if (isRelease) {
      console.info("setting wallet chain", from);
      dispatch(setChain(from));
    } else if (isMove) {
      console.info("setting wallet chain", from);
      dispatch(setChain(from));
    }
  }, [dispatch, reset, isMint, isRelease, isMove, asset, from, to]);

  const hideFrom = isMint && fromChains.length === 1;
  const hideTo = isRelease && toChains.length === 1;

  const toChainConfig = getChainConfig(to);

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
  const { balance, error: balanceError } = useContractChainAssetBalance(
    chains[from].chain as any,
    asset,
    account,
    isFromContractChain ? fromConnected : undefined
  );

  const uiAsset = getUIAsset(asset, from);
  // const balanceChain = isRelease ? from : isH2H ? from : to;

  const requiresInitialAmount = isFromContractChain;
  const hasInitialAmount = amount !== "";
  const hasAmountBalanceError =
    requiresInitialAmount &&
    balance !== null &&
    Number(amount) > Number(balance);
  const hasMinimumAmountError =
    isRelease &&
    requiresInitialAmount &&
    !!minimumAmount &&
    Number(amount) < Number(minimumAmount) &&
    Number(amount) > 0;
  const showAmountError = amountTouched && hasAmountBalanceError;
  const showMinimumAmountError = amountTouched && hasMinimumAmountError;
  let errorMessage, errorTooltip;
  if (showAmountError) {
    errorMessage = t("gateway.amount-too-big-error");
    errorTooltip = t("gateway.amount-too-big-error-tooltip");
  } else if (showMinimumAmountError) {
    errorMessage = t("gateway.amount-too-low-error");
    errorTooltip = t("gateway.amount-too-low-error-tooltip");
  } else {
    errorMessage = "";
    errorTooltip = "";
  }

  useSyncScreening({
    fromAddress: account,
    fromStart: Boolean(account),
    toAddress,
    toStart: isAddressValid,
  });
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

  const filteredAssets = useMemo(() => {
    return assets.filter((entry) => {
      return whitelistAssets(entry, ioType);
    });
  }, [assets, ioType, whitelistAssets]);

  const filteredFromChains = useMemo(() => {
    return fromChains.filter((entry) => {
      return whitelistFromChains(asset, ioType, entry as Chain);
    });
  }, [asset, fromChains, whitelistFromChains, ioType]);

  const filteredToChains = useMemo(() => {
    return toChains.filter((entry) => {
      return whitelistToChains(asset, ioType, entry as Chain);
    });
  }, [asset, toChains, whitelistToChains, ioType]);

  return (
    <>
      <TransactionSafetyWarning />
      <PaperContent bottomPadding>
        {isMint && !requiresInitialAmount && <MintIntro />}
        {requiresInitialAmount && (
          <BigCurrencyInputWrapper>
            <BigCurrencyInput
              onChange={handleAmountChange}
              symbol={uiAsset.shortName}
              usdValue={amountUsd}
              value={amount}
              errorText={
                showAmountError || showMinimumAmountError ? (
                  <MessageWithTooltip
                    message={errorMessage}
                    tooltip={errorTooltip}
                  />
                ) : (
                  ""
                )
              }
            />
          </BigCurrencyInputWrapper>
        )}

        {isRelease && minimumAmount && (
          <HorizontalPadder>
            <LabelWithValue
              label={<>{t("mint.gateway-minimum-amount-label")}: </>}
              value={
                <NumberFormatText
                  value={minimumAmount}
                  spacedSuffix={uiAsset.shortName}
                  decimalScale={10}
                  fixedDecimalScale={false}
                />
              }
            />
          </HorizontalPadder>
        )}
        {fromConnected && isFromContractChain ? (
          <BalanceInfo
            balance={balance}
            asset={uiAsset.shortName}
            chain={from}
            onSetMaxAmount={handleSetMaxAmount}
            error={balanceError}
          />
        ) : (
          <BalanceInfoPlaceholder />
        )}
        <RichDropdownWrapper>
          <RichDropdown
            label={getSendLabel(asset, ioType, t)}
            supplementalLabel={t("common.asset-label")}
            options={filteredAssets}
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
              options={filteredFromChains}
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
              options={filteredToChains}
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
              hasMinimumAmountError ||
              hasNetworkError ||
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
