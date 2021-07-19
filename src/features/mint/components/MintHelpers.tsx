import { makeStyles, styled, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
  BridgeChainConfig,
  BridgeCurrencyConfig,
} from "../../../utils/assetConfigs";
import { HMSCountdown } from "../../transactions/components/TransactionsHelpers";

export const mintTooltips = {
  sending: "The amount and asset you’re sending before fees are applied.",
  to: "The blockchain you’re sending the asset to.",
  recipientAddress: "The wallet that will receive the minted assets.",
};

export const getMintDynamicTooltips = (
  chainConfig: BridgeChainConfig,
  chainNativeCurrencyConfig: BridgeCurrencyConfig
) => ({
  acknowledge: `Minting an asset on ${chainConfig.full} requires you to submit a transaction. It will cost you a small amount of ${chainNativeCurrencyConfig.short}.`,
});

export const DepositWrapper = styled("div")({
  position: "relative",
});

type CountdownProps = {
  milliseconds: number;
};

type GatewayAddressValidityMessageProps = CountdownProps & {
  destNetwork: string;
};

export const GatewayAddressValidityMessage: FunctionComponent<GatewayAddressValidityMessageProps> = ({
  milliseconds,
  destNetwork,
}) => {
  const { t } = useTranslation();
  return (
    <span>
      {t("mint.address-validity-message-1")}
      <HMSCountdown milliseconds={milliseconds} />.{" "}
      {t("mint.address-validity-message-2")}.
      <br />
      <br />
      {t("mint.address-validity-message-3")}.
    </span>
  );
};

export const GatewayTransactionValidityMessage: FunctionComponent<CountdownProps> = ({
  milliseconds,
}) => {
  const { t } = useTranslation();
  return (
    <span>
      {t("mint.gateway-validity")} <HMSCountdown milliseconds={milliseconds} />
    </span>
  );
};

export const MultipleDepositsMessage: FunctionComponent = () => {
  const { t } = useTranslation();
  return <span>{t("mint.multiple-deposits")}</span>;
};

export const useMintIntroStyles = makeStyles({
  root: {
    marginTop: 30,
    marginBottom: 30,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
  },
});

export const MintIntro: FunctionComponent = () => {
  const styles = useMintIntroStyles();
  const { t } = useTranslation();
  return (
    <div className={styles.root}>
      <Typography variant="body1" align="center">
        {t("mint.initial-intro")}
      </Typography>
    </div>
  );
};
