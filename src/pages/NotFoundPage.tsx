import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
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
  usePageTitle("Not Found");
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
          We couldn't find this page
        </Typography>
        <Typography
          align="center"
          color="textSecondary"
          variant="body1"
          className={styles.supplement}
        >
          Try visiting{" "}
          <Link color="primary" to="/" underline="hover">
            RenBridge
          </Link>{" "}
          - or{" "}
          <Link
            color="primary"
            href="mailto:support@renproject.io"
            underline="hover"
          >
            get in touch
          </Link>{" "}
          if you believe there is an issue
        </Typography>
      </Container>
    </MobileLayout>
  );
};
