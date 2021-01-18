import { Container, styled, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import React, { FunctionComponent, useCallback, useEffect } from 'react'
import { RouteComponentProps } from 'react-router'
import { ActionButton } from '../components/buttons/Buttons'
import { IconWithLabel } from '../components/icons/IconHelpers'
import { BchFullIcon, BtcFullIcon, DogeFullIcon, WarningIcon, ZecFullIcon, } from '../components/icons/RenIcons'
import { NarrowCenteredWrapper } from '../components/layout/LayoutHelpers'
import { MainLayout } from '../components/layout/MainLayout'
import { Link } from '../components/links/Links'
import { UnstyledList } from '../components/typography/TypographyHelpers'
import { links, storageKeys } from '../constants/constants'
import { useNotifications } from '../providers/Notifications'
import { usePageTitle } from '../providers/TitleProviders'
import { paths } from './routes'

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

const AdjustedWarningIcon = styled(WarningIcon)({
  marginBottom: -5,
});

export const WelcomePage: FunctionComponent<RouteComponentProps> = ({
  history,
}) => {
  usePageTitle("Welcome");
  const { showNotification } = useNotifications();
  const styles = useStyles();
  useEffect(() => {
    showNotification(
      <Typography variant="caption">
        <AdjustedWarningIcon fontSize="small" /> RenVM is new technology, and{" "}
        <Link
          href={links.SECURITY_AUDITS}
          target="_blank"
          color="primary"
          underline="hover"
        >
          security audits
        </Link>{" "}
        don't completely eliminate risks. Please don’t supply assets you can’t
        afford to lose.
      </Typography>,
      {
        variant: "specialInfo",
        persist: true,
        anchorOrigin: {
          horizontal: "center",
          vertical: "top",
        },
      }
    );
  }, [showNotification]);
  const handleAgree = useCallback(() => {
    localStorage.setItem(storageKeys.TERMS_AGREED, "1");
    history.replace(paths.HOME);
  }, [history]);

  return (
    <MainLayout variant="intro">
      <Container maxWidth="sm">
        <Typography variant="h1" className={styles.heading}>
          Transfer assets between blockchains
        </Typography>
        <Typography variant="body1" className={styles.description}>
          An easy way to bridge cross-chain assets between blockchains.
        </Typography>
        <Typography variant="body1" className={styles.continuation}>
          To continue, read and agree to the{" "}
          <Link
            color="primary"
            underline="hover"
            target="_blank"
            href={links.TERMS_OF_SERVICE}
          >
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
                <IconWithLabel label="ZEC" Icon={ZecFullIcon} />
              </li>
              <li>
                <IconWithLabel label="DOGE" Icon={DogeFullIcon} />
              </li>
            </UnstyledList>
          </div>
        </NarrowCenteredWrapper>
      </Container>
    </MainLayout>
  );
};
