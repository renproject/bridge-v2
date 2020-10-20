import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent, useCallback } from "react";
import { ActionButton } from "../components/buttons/Buttons";
import { IconWithLabel } from "../components/icons/IconHelpers";
import {
  BchFullIcon,
  BtcFullIcon,
  DogeFullIcon,
  ZecFullIcon,
} from "../components/icons/RenIcons";
import { NarrowCenteredWrapper } from "../components/layout/LayoutHelpers";
import { MainLayout } from "../components/layout/MainLayout";
import { Link } from "../components/links/Links";
import { UnstyledList } from "../components/typography/TypographyHelpers";

const useStyles = makeStyles((theme) => ({
  root: {},
  heading: {
    marginTop: 112,
    textAlign: "center",
    color: theme.palette.text.primary,
  },
  description: {
    marginTop: 24,
    textAlign: "center",
    color: theme.customColors.textLight,
  },
  continuation: {
    marginTop: 48,
    textAlign: "center",
  },
  button: {
    maxWidth: 400,
    marginTop: 20,
  },
  assets: {
    marginTop: 82,
    textAlign: "center",
  },
  assetsLabel: {
    color: theme.customColors.textLight,
    fontWeight: "bold",
  },
  assetsList: {
    margin: "12px auto",
    display: "flex",
    justifyContent: "space-between",
  },
}));
export const WelcomePage: FunctionComponent = () => {
  const styles = useStyles();
  const handleAgree = useCallback(() => {}, []);
  return (
    <MainLayout variant="welcome">
      <Container maxWidth="sm">
        <Typography variant="h1" className={styles.heading}>
          Transfer assets between blockchains
        </Typography>
        <Typography variant="body1" className={styles.description}>
          An easy, safe, and permissionless way to bridge cross-chain assets
          between blockchains.
        </Typography>
        <Typography variant="body1" className={styles.continuation}>
          To continue, read and agree to the{" "}
          <Link color="primary" underline="hover">
            Terms of Service
          </Link>
        </Typography>
        <NarrowCenteredWrapper>
          <ActionButton className={styles.button} onClick={handleAgree}>
            Agree & Continue
          </ActionButton>
          <div className={styles.assets}>
            <Typography
              variant="overline"
              component="h2"
              className={styles.assetsLabel}
            >
              Supported Assets
            </Typography>
            <UnstyledList className={styles.assetsList}>
              <li>
                <IconWithLabel label="BTC" Icon={BtcFullIcon} />
              </li>
              <li>
                <IconWithLabel label="BCH" Icon={BchFullIcon} />
              </li>
              <li>
                <IconWithLabel label="DOGE" Icon={DogeFullIcon} />
              </li>
              <li>
                <IconWithLabel label="ZEC" Icon={ZecFullIcon} />
              </li>
            </UnstyledList>
          </div>
        </NarrowCenteredWrapper>
      </Container>
    </MainLayout>
  );
};
