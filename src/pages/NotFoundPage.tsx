import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { MobileLayout } from "../components/layout/MobileLayout";
import { Link } from "../components/links/Links";
import { usePageTitle } from "../providers/TitleProviders";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 54,
  },
  heading: {
    fontWeight: 700,
    lineHeight: 1,
    fontSize: 150,
    [theme.breakpoints.up("sm")]: {
      fontSize: 220,
    },
    [theme.breakpoints.up("md")]: {
      fontSize: 300,
    },
  },
  description: {
    fontSize: 42,
    [theme.breakpoints.up("sm")]: {
      fontSize: 52,
    },
    lineHeight: 1,
    fontWeight: 700,
    marginBottom: 20,
  },
  supplement: {
    fontSize: 22,
  },
}));
export const NotFoundPage: FunctionComponent<RouteComponentProps> = () => {
  const { t } = useTranslation();
  usePageTitle(t("navigation.404-title"));
  const styles = useStyles();

  return (
    <MobileLayout>
      <Container maxWidth="md" className={styles.root}>
        <Typography
          align="center"
          color="textPrimary"
          variant="h2"
          component="h1"
          className={styles.heading}
        >
          404
        </Typography>
        <Typography
          align="center"
          color="textPrimary"
          variant="body1"
          className={styles.description}
        >
          {t("navigation.404-header")}
        </Typography>
        <Typography
          align="center"
          color="textSecondary"
          variant="body1"
          className={styles.supplement}
        >
          {t("navigation.404-message-1")}{" "}
          <Link color="primary" to="/" underline="hover">
            RenBridge
          </Link>{" "}
          - {t("navigation.404-message-or")}{" "}
          <Link
            color="primary"
            href="mailto:support@renproject.io"
            underline="hover"
          >
            {t("navigation.404-message-link-text")}
          </Link>{" "}
          {t("navigation.404-message-2")}
        </Typography>
      </Container>
    </MobileLayout>
  );
};
