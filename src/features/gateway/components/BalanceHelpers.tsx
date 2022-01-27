import { Fade } from "@material-ui/core";
import { Asset, Chain } from "@renproject/chains";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { HorizontalPadder } from "../../../components/layout/LayoutHelpers";
import { InlineSkeleton } from "../../../components/progress/ProgressHelpers";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";

type BalanceInfoProps = {
  balance: string | number | null;
  asset: Asset | string;
  chain?: Chain | string;
};

export const BalanceInfo: FunctionComponent<BalanceInfoProps> = ({
  balance,
  asset,
}) => {
  const { t } = useTranslation();
  return (
    <HorizontalPadder>
      <LabelWithValue
        label={t("common.balance") + ":"}
        value={
          <span>
            {balance === null ? (
              <InlineSkeleton
                variant="rect"
                animation="pulse"
                width={40}
                height={12}
              />
            ) : (
              <Fade in={true}>
                <span>{balance}</span>
              </Fade>
            )}
            <span> {asset}</span>
          </span>
        }
      />
    </HorizontalPadder>
  );
};

type UsdNumberFormatTextProps = {
  amountUsd: string | number | null;
};

export const UsdNumberFormatText: FunctionComponent<
  UsdNumberFormatTextProps
> = ({ amountUsd }) => {
  if (amountUsd === null) {
    return null;
  }
  return (
    <NumberFormatText
      prefix=" = $"
      value={amountUsd}
      spacedSuffix="USD"
      decimalScale={2}
      fixedDecimalScale
    />
  );
};
