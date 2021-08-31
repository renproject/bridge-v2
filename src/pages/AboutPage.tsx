import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import { Trans, useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { RenLogoFullIcon, RenVMLogoIcon } from "../components/icons/RenIcons";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Link } from "../components/links/Links";
import { MarkText } from "../components/typography/TypographyHelpers";
import { links } from "../constants/constants";
import { usePageTitle } from "../providers/TitleProviders";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 54,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  description: {
    marginBottom: 20,
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
}));

const components = {
  orange: <MarkText color="orange" />,
  blue: <MarkText color="blue" />,
  grey: <MarkText color="grey" />,
};

const AboutPage: FunctionComponent<RouteComponentProps> = () => {
  const { t } = useTranslation();
  usePageTitle(t("about.title"));
  const styles = useStyles();

  return (
    <MobileLayout>
      <Container maxWidth="sm" className={styles.root}>
        <Typography variant="h2" component="h1" className={styles.heading}>
          {t("about.what-is-header")}
        </Typography>
        <Typography variant="body1" className={styles.description}>
          <Trans i18nKey="about.what-is-description" components={components} />
        </Typography>
        <Typography variant="h2" className={styles.heading}>
          {t("about.work-header")}
        </Typography>
        <Typography variant="body1" className={styles.description}>
          <Trans i18nKey="about.work-description" components={components} />{" "}
          <Link external href={links.WIKI}>
            {t("about.work-link-text")}
          </Link>
          .
        </Typography>
        <Typography variant="h2" className={styles.heading}>
          {t("about.safety-header")}
        </Typography>
        <Typography variant="body1" className={styles.description}>
          {t("about.safety-description-1")}{" "}
          <Link external href={links.SECURITY_AUDITS}>
            {t("about.safety-audits-link-text")}
          </Link>{" "}
          {t("about.safety-description-2")}
        </Typography>
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

export default AboutPage;
