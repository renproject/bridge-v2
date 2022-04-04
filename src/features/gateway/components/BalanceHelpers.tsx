import { Fade } from "@material-ui/core";
import { makeStyles, styled } from "@material-ui/core/styles";
import { Asset, Chain } from "@renproject/chains";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { HorizontalPadder } from "../../../components/layout/LayoutHelpers";
import { InlineSkeleton } from "../../../components/progress/ProgressHelpers";
import { LabelWithValue } from "../../../components/typography/TypographyHelpers";
import { getChainConfig } from "../../../utils/chainsConfig";

const useBalanceInfoStyles = makeStyles((theme) => ({
  value: {
    color: theme.palette.text.primary,
  },
}));

export const BalanceInfoPlaceholder = styled("div")({
  height: 17,
  marginBottom: 8,
});

type BalanceInfoProps = {
  balance: string | number | null;
  asset: Asset | string;
  chain?: Chain | string;
  error?: any;
};

export const BalanceInfo: FunctionComponent<BalanceInfoProps> = ({
  balance,
  asset,
  chain,
  error,
}) => {
  const styles = useBalanceInfoStyles();
  const { t } = useTranslation();
  if (error) {
    return <BalanceInfoPlaceholder />;
  }
  return (
    <HorizontalPadder>
      <LabelWithValue
        label={
          <>
            {t("common.balance")} {t("common.on")}{" "}
            {chain ? getChainConfig(chain).shortName : null}
            {":"}
          </>
        }
        value={
          <span className={styles.value}>
            {balance === null ? (
              <InlineSkeleton
                variant="text"
                animation="pulse"
                width={40}
                height={14}
              />
            ) : (
              <Fade in={true}>
                <span>{Number(balance).toString()}</span>
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
