import { makeStyles, Typography } from "@material-ui/core";
import { styled } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { HMSCountdown } from "../../transactions/components/TransactionsHelpers";

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

export const DepositWrapper = styled("div")({
  position: "relative",
});

type CountdownProps = {
  milliseconds: number;
};

type GatewayAddressValidityMessageProps = CountdownProps & {
  destNetwork: string;
};

export const GatewayAddressValidityMessage: FunctionComponent<
  GatewayAddressValidityMessageProps
> = ({ milliseconds, destNetwork }) => {
  const { t } = useTranslation();
  return (
    <span>
      {t("mint.address-validity-message-1")}{" "}
      <strong>
        <HMSCountdown milliseconds={milliseconds} />
      </strong>
      . {t("mint.address-validity-message-2")}.
      <br />
      <br />
      {t("mint.address-validity-message-3", { network: destNetwork })}.
    </span>
  );
};

export const GatewayTransactionValidityMessage: FunctionComponent<
  CountdownProps
> = ({ milliseconds }) => {
  const { t } = useTranslation();
  return (
    <span>
      {t("mint.gateway-validity-message")}{" "}
      <strong>
        <HMSCountdown milliseconds={milliseconds} />
      </strong>
    </span>
  );
};

export const MultipleDepositsMessage: FunctionComponent = () => {
  const { t } = useTranslation();
  return <span>{t("mint.multiple-deposits")}</span>;
};
