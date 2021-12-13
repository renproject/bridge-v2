import React from "react";
import { Divider } from "@material-ui/core";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { RichDropdown } from "../../../components/dropdowns/RichDropdown";
import { PaperContent } from "../../../components/layout/Paper";
import { getAssetOptionData } from "../components/DropdownHelpers";
import { GatewayStepProps } from "./stepUtils";

export const GatewayInitialStep: FunctionComponent<GatewayStepProps> = ({
  onNext,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <PaperContent bottomPadding>
        {/*// TODO: fix rentx deps*/}
        {/*<MintIntro />*/}
        <RichDropdown
          label={t("mint.send-label")}
          assetLabel={t("common.asset-label")}
          blockchainLabel={t("common.blockchain-label")}
          getOptionData={getAssetOptionData}
          // available={supportedLockCurrencies}
          // value={currency}
          // onChange={handleCurrencyChange}
        />
      </PaperContent>
      <Divider />
    </>
  );
};
