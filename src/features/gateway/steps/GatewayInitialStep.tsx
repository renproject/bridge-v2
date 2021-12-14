import { Asset, Chain } from "@renproject/chains";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Collapse, Divider, Fade, Grow, Slide } from "@material-ui/core";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useRouteMatch } from "react-router-dom";
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
import { paths } from "../../../pages/routes";
import { chainsConfig, getChainConfig } from "../../../utils/chainsConfig";
import {
  getAssetConfig,
  supportedLockAssets,
} from "../../../utils/tokensConfig";
import {
  getAssetOptionData,
  getChainOptionData,
} from "../components/DropdownHelpers";
import { MintIntro } from "../components/MintHelpers";
import {
  $gateway,
  setToAddress,
  setAmount,
  setAsset,
  setFrom,
  setTo,
} from "../gatewaySlice";
import { GatewayStepProps } from "./stepUtils";

const assets = supportedLockAssets;
const chains = Object.keys(chainsConfig);

const forceShowDropdowns = false;

export const GatewayInitialStep: FunctionComponent<GatewayStepProps> = ({
  onNext,
}) => {
  const dispatch = useDispatch();
  const { path } = useRouteMatch();
  const { t } = useTranslation();
  const { asset, from, to, amount, toAddress } = useSelector($gateway);
  const handleAssetChange = useCallback(
    (event) => {
      dispatch(setAsset(event.target.value as Asset));
    },
    [dispatch]
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
      dispatch(setAmount(value));
    },
    [dispatch]
  );
  const handleAddressChange = useCallback(
    (event) => {
      dispatch(setToAddress(event.target.value));
    },
    [dispatch]
  );

  const isMint = path === paths.MINT;
  const isRelease = path === paths.RELEASE;

  const [fromChains, setFromChains] = useState(chains);
  const [toChains, setToChains] = useState(chains);

  useEffect(() => {
    const config = getAssetConfig(asset);
    const { lockChain, mintChains } = config;
    if (isMint) {
      setFromChains([lockChain]);
      dispatch(setFrom(lockChain));
      setToChains(mintChains);
      dispatch(setTo(mintChains[0]));
    } else if (isRelease) {
      setFromChains(mintChains);
      dispatch(setFrom(mintChains[0]));
      setToChains([lockChain]);
      dispatch(setTo(lockChain));
    }
  }, [asset, isMint, isRelease]);

  const hideFrom = isMint && fromChains.length === 1;
  const hideTo = isRelease && toChains.length === 1;

  const toChainConfig = getChainConfig(to);
  // TODO: fix
  const showMinimalAmountError = false;
  const usdAmount = 420.69;
  const renAsset = `ren${asset}`;
  const showAddressError = false;

  return (
    <>
      <PaperContent bottomPadding>
        {isMint && <MintIntro />}
        {isRelease && (
          <BigCurrencyInputWrapper>
            <BigCurrencyInput
              onChange={handleAmountChange}
              symbol={renAsset}
              usdValue={420.69}
              value={amount}
              errorText={
                showMinimalAmountError ? (
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
        <RichDropdownWrapper>
          <RichDropdown
            label={isMint ? t("mint.mint-label") : t("release.release-label")}
            supplementalLabel={t("common.asset-label")}
            options={assets}
            getOptionData={getAssetOptionData}
            value={asset}
            onChange={handleAssetChange}
            // available={supportedLockCurrencies}
            // value={currency}
            // onChange={handleCurrencyChange}
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
              // available={supportedLockCurrencies}
              // value={currency}
              // onChange={handleCurrencyChange}
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
              // available={supportedLockCurrencies}
              // value={currency}
              // onChange={handleCurrencyChange}
            />
          </RichDropdownWrapper>
        </Collapse>
        <Collapse in={isRelease}>
          <BigOutlinedTextFieldWrapper>
            <OutlinedTextField
              error={showAddressError}
              helperText={
                showAddressError
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
    </>
  );
};
