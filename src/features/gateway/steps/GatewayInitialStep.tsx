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
import { PaperContent } from "../../../components/layout/Paper";
import { paths } from "../../../pages/routes";
import { chainsConfig } from "../../../utils/chainsConfig";
import {
  getAssetConfig,
  supportedLockAssets,
} from "../../../utils/tokensConfig";
import {
  getAssetOptionData,
  getChainOptionData,
} from "../components/DropdownHelpers";
import { MintIntro } from "../components/MintHelpers";
import { $gateway, setAsset, setFrom, setTo } from "../gatewaySlice";
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
  const { asset, from, to } = useSelector($gateway);
  const handleAssetChange = useCallback((event) => {
    dispatch(setAsset(event.target.value as Asset));
  }, []);
  const handleFromChange = useCallback((event) => {
    dispatch(setFrom(event.target.value as Chain));
  }, []);
  const handleToChange = useCallback((event) => {
    dispatch(setTo(event.target.value as Chain));
  }, []);

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

  return (
    <>
      <PaperContent bottomPadding>
        {isMint && <MintIntro />}
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
      </PaperContent>
      <Divider />
    </>
  );
};
