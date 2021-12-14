import { makeStyles, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

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
