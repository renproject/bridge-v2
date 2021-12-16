import { Divider, IconButton } from "@material-ui/core";
import { Asset } from "@renproject/chains";
import React, { FunctionComponent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { BackArrowIcon } from "../../../components/icons/RenIcons";
import { OutlinedTextField } from "../../../components/inputs/OutlinedTextField";
import {
  MediumTopWrapper,
  MediumWrapper,
} from "../../../components/layout/LayoutHelpers";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import {
  AssetInfo,
  LabelWithValue,
} from "../../../components/typography/TypographyHelpers";
import {
  assetsConfig,
  getAssetConfig,
  getRenAssetName,
} from "../../../utils/tokensConfig";
import { $gateway } from "../gatewaySlice";
import { GatewayStepProps } from "./stepUtils";

export const GatewayFeesStep: FunctionComponent<GatewayStepProps> = ({
  onNext,
  onPrev,
}) => {
  const { t } = useTranslation();
  const { asset, from, to } = useSelector($gateway);
  const { Icon, shortName } = getAssetConfig(asset);
  const renAsset = getRenAssetName(asset);

  const [amount, setAmount] = useState("42");
  const handleAmountChange = useCallback((event) => {
    const newValue = event.target.value.replace(",", ".");
    if (!isNaN(newValue)) {
      setAmount(newValue);
    }
  }, []);

  const balance = 42.1;
  const showBalance = true;
  const receivingFormatted = "42.0";
  const receivingFormattedUsd = "69.0";

  const Header = (
    <PaperHeader>
      <PaperNav>
        <IconButton onClick={onPrev}>
          <BackArrowIcon />
        </IconButton>
      </PaperNav>
      <PaperTitle>{t("mint.fees-title")}</PaperTitle>
      <PaperActions />
    </PaperHeader>
  );
  return (
    <>
      {Header}
      <PaperContent bottomPadding>
        {showBalance && (
          <LabelWithValue
            label={t("common.balance-label")}
            value={`${balance} ${asset}`}
          />
        )}
        <OutlinedTextField
          value={amount}
          onChange={handleAmountChange}
          label="How much will you send?"
          InputProps={{ endAdornment: shortName }}
        />
        <MediumTopWrapper>
          <AssetInfo
            label={t("common.receiving-label")}
            value={
              <NumberFormatText
                value={receivingFormatted}
                spacedSuffix={renAsset}
              />
            }
            valueEquivalent={
              <NumberFormatText
                prefix=" = $"
                value={receivingFormattedUsd}
                spacedSuffix="USD"
                decimalScale={2}
                fixedDecimalScale
              />
            }
            Icon={<Icon fontSize="inherit" />}
          />
        </MediumTopWrapper>
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <span>Feessss</span>
      </PaperContent>
    </>
  );
};
