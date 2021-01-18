import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import { RouteComponentProps } from "react-router";
import { RenLogoFullIcon, RenVMLogoIcon } from "../components/icons/RenIcons";
import { ConnectedMainLayout } from "../components/layout/ConnectedMainLayout";
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
export const AboutPage: FunctionComponent<RouteComponentProps> = () => {
  usePageTitle("About");
  const styles = useStyles();

  return (
    <ConnectedMainLayout variant="about">
      <Container maxWidth="sm" className={styles.root}>
        <Typography variant="h2" component="h1" className={styles.heading}>
          What is RenBridge?
        </Typography>
        <Typography variant="body1" className={styles.description}>
          RenBridge enables the simple wrapping of digital assets on different
          blockchains. For example, RenBridge allows users to take{" "}
          <MarkText color="orange">BTC</MarkText> and put it on{" "}
          <MarkText color="blue">Ethereum</MarkText>, as an ERC-20 called{" "}
          <MarkText color="grey">renBTC</MarkText>.
        </Typography>
        <Typography variant="h2" className={styles.heading}>
          How does it work?
        </Typography>
        <Typography variant="body1" className={styles.description}>
          Using RenVM, a universal translator, it converts digital assets to the
          format needed by its destination chain. For example, RenVM takes{" "}
          <MarkText color="orange">BTC</MarkText>, holds it, and then converts
          it to an <MarkText color="blue">ERC-20</MarkText> with a 1:1 ratio to
          ensure your <MarkText color="grey">renBTC</MarkText> is always backed
          by the same amount of <MarkText color="orange">BTC</MarkText>. Find
          out more{" "}
          <Link external href={links.WIKI}>
            here
          </Link>
          .
        </Typography>
        <Typography variant="h2" className={styles.heading}>
          How safe is it?
        </Typography>
        <Typography variant="body1" className={styles.description}>
          RenVM holds on to your assets when they are on other blockchains.
          RenVM is new technology, and{" "}
          <Link external href={links.SECURITY_AUDITS}>
            security audits
          </Link>{" "}
          don't completely eliminate risks. Please don't supply assets you can't
          afford to lose!
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
    </ConnectedMainLayout>
  );
};
