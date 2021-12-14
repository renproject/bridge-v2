import { Asset } from "@renproject/chains";
import React, { useCallback } from "react";
import { Divider } from "@material-ui/core";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RichDropdown } from "../../../components/dropdowns/RichDropdown";
import { PaperContent } from "../../../components/layout/Paper";
import { supportedLockAssets } from "../../../utils/tokensConfig";
import { getAssetOptionData } from "../components/DropdownHelpers";
import { $gateway, setAsset } from "../gatewaySlice";
import { GatewayStepProps } from "./stepUtils";

const assets = supportedLockAssets;

export const GatewayInitialStep: FunctionComponent<GatewayStepProps> = ({
  onNext,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { asset } = useSelector($gateway);
  const handleAssetChange = useCallback((event) => {
    dispatch(setAsset(event.target.value as Asset));
  }, []);

  const actionLabel = "Mint"; //t("common.move-label");
  return (
    <>
      <PaperContent bottomPadding>
        {/*// TODO: fix rentx deps*/}
        {/*<MintIntro />*/}
        <RichDropdown
          label={actionLabel}
          assetLabel={t("common.asset-label")}
          blockchainLabel={t("common.blockchain-label")}
          options={assets}
          getOptionData={getAssetOptionData}
          value={asset}
          onChange={handleAssetChange}
          // available={supportedLockCurrencies}
          // value={currency}
          // onChange={handleCurrencyChange}
        />
      </PaperContent>
      <Divider />
    </>
  );
};
