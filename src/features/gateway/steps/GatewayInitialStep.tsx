import React from "react";
import { Divider } from "@material-ui/core";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
  AssetDropdown,
  AssetDropdownWrapper,
} from "../../../components/dropdowns/AssetDropdown";
import { PaperContent } from "../../../components/layout/Paper";
import { MintIntro } from "../../mint/components/MintHelpers";
import { GatewayStepProps } from "./stepUtils";

export const GatewayInitialStep: FunctionComponent<GatewayStepProps> = ({
  onNext,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <PaperContent bottomPadding>
        <MintIntro />
        <AssetDropdownWrapper>
          <AssetDropdown
            label={t("mint.send-label")}
            assetLabel={t("common.asset-label")}
            blockchainLabel={t("common.blockchain-label")}
            // available={supportedLockCurrencies}
            // value={currency}
            // onChange={handleCurrencyChange}
          />
        </AssetDropdownWrapper>
        <AssetDropdownWrapper>
          <AssetDropdown
            label={t("mint.destination-label")}
            assetLabel={t("common.asset-label")}
            blockchainLabel={t("common.blockchain-label")}
            mode="chain"
            // available={supportedMintDestinationChains}
            // value={chain}
            // onChange={handleChainChange}
          />
        </AssetDropdownWrapper>
      </PaperContent>
      <Divider />
    </>
  );
};
