import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import ftxInfo from "../assets/images/ftx.png";
import { RenLogoFullIcon, RenVMLogoIcon } from "../components/icons/RenIcons";
import { MobileLayout } from "../components/layout/MobileLayout";
import { usePageTitle } from "../providers/TitleProviders";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 54,
  },
  logos: {
    marginTop: 48,
    display: "flex",
    alignItems: "center",
  },
  ren: {
    fontSize: 50,
    display: "inline-flex",
    alignItems: "center",
    paddingRight: 25,
    borderRight: `2px solid ${theme.palette.text.primary}`,
  },
  renVM: {
    fontSize: 26,
    display: "inline-flex",
    alignItems: "center",
    paddingTop: 2,
    paddingLeft: 25,
  },
  ftx: {
    maxWidth: "100%",
  },
}));

const FtxPage: FunctionComponent<RouteComponentProps> = () => {
  const { t } = useTranslation();
  usePageTitle(t("about.title"));
  const styles = useStyles();

  return (
    <MobileLayout>
      <Container maxWidth="sm" className={styles.root}>
        <img src={ftxInfo} alt="FTX info" className={styles.ftx} />
        <div className={styles.logos}>
          <span className={styles.ren}>
            <RenLogoFullIcon fontSize="inherit" />
          </span>
          <span className={styles.renVM}>
            <RenVMLogoIcon fontSize="inherit" />
          </span>
        </div>
      </Container>
    </MobileLayout>
  );
};

export default FtxPage;
