import { Asset, Chain } from "@renproject/chains";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Divider } from "@material-ui/core";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  RichDropdown,
  RichDropdownWrapper,
} from "../../../components/dropdowns/RichDropdown";
import { PaperContent } from "../../../components/layout/Paper";
import { chainsConfig } from "../../../utils/chainsConfig";
import {
  getAssetConfig,
  supportedLockAssets,
} from "../../../utils/tokensConfig";
import {
  getAssetOptionData,
  getChainOptionData,
} from "../components/DropdownHelpers";
import { $gateway, setAsset, setFrom } from "../gatewaySlice";
import { GatewayStepProps } from "./stepUtils";

const assets = supportedLockAssets;
const chains = Object.keys(chainsConfig);

export const GatewayInitialStep: FunctionComponent<GatewayStepProps> = ({
  onNext,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { asset, from } = useSelector($gateway);
  const handleAssetChange = useCallback((event) => {
    dispatch(setAsset(event.target.value as Asset));
  }, []);
  const handleFromChange = useCallback((event) => {
    dispatch(setFrom(event.target.value as Chain));
  }, []);

  const [fromChains, setFromChains] = useState(chains);
  useEffect(() => {
    const config = getAssetConfig(asset);
    if (config.lockChain === Chain.Ethereum) {
      setFromChains(config.mintChains);
      dispatch(setFrom(config.mintChains[0]));
    } else {
      setFromChains([config.lockChain]);
      dispatch(setFrom(config.lockChain));
    }
  }, [asset]);

  return (
    <>
      <PaperContent bottomPadding>
        {/*// TODO: fix rentx deps*/}
        {/*<MintIntro />*/}
        <RichDropdownWrapper>
          <RichDropdown
            label={t("mint.send-label")}
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
      </PaperContent>
      <Divider />
    </>
  );
};
