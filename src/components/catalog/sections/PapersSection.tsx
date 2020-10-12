import {
  Box,
  Button,
  Fade,
  Grow,
  IconButton,
  Typography,
  Zoom,
} from "@material-ui/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import { ToggleIconButton } from "../../buttons/Buttons";
import { BackArrowIcon } from "../../icons/RenIcons";
import {
  BridgePaper,
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../layout/Paper";
import { Link } from "../../links/Links";
import { Section } from "../PresentationHelpers";

const SLIDES = 3;
export const ExampleContent: FunctionComponent = () => {
  return (
    <PaperContent>
      <Typography variant="h5" align="center" gutterBottom>
        Limited wallet support
      </Typography>
      <Typography variant="body2" align="center" gutterBottom>
        RenBridge has only been tested and confirmed working with some
        WalletConnect wallets.
      </Typography>
      <Typography variant="body2" align="center" gutterBottom>
        If you continue with a wallet that has not been tested you are risking
        loss of funds.
      </Typography>
      <Typography variant="body2" align="center">
        <Link href="/" color="primary" align="center">
          View the full list before continuing ↗
        </Link>
      </Typography>
    </PaperContent>
  );
};

const CurrencyReceivedContent: FunctionComponent = () => {
  return (
    <PaperContent>
      <Button variant="contained" color="primary" size="large" fullWidth>
        Return
      </Button>
      <Box display="flex" justifyContent="space-between" py={2}>
        <Link external color="primary" variant="button" underline="hover">
          Ethereum transaction
        </Link>
        <Link external color="primary" variant="button" underline="hover">
          Bitcoin transaction
        </Link>
      </Box>
    </PaperContent>
  );
};

export const PapersSection: FunctionComponent = () => {
  const [current, setCurrent] = useState(2);
  const [settings, setSettings] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const handleNext = useCallback(() => {
    setCurrent((current) => (current + 1) % SLIDES);
  }, []);
  const handlePrev = useCallback(() => {
    setCurrent((curr) => (curr > 0 ? curr - 1 : SLIDES - 1));
  }, []);
  const toggleSettings = useCallback(() => {
    setSettings(!settings);
  }, [settings]);
  const toggleNotifications = useCallback(() => {
    setNotifications(!notifications);
  }, [notifications]);

  return (
    <Section header="Paper variants">
      <Button onClick={handleNext}>Next</Button>
      {current === 0 && (
        <Zoom in={current === 0}>
          <BridgePaper>
            <PaperHeader>
              <PaperNav />
              <PaperTitle>Fees</PaperTitle>
              <PaperActions>
                <ToggleIconButton
                  variant="settings"
                  pressed={settings}
                  onClick={toggleSettings}
                />
                <ToggleIconButton
                  variant="notifications"
                  pressed={notifications}
                  onClick={toggleNotifications}
                />
              </PaperActions>
            </PaperHeader>
            <ExampleContent />
          </BridgePaper>
        </Zoom>
      )}
      {current === 1 && (
        <Fade in={current === 1}>
          <BridgePaper>
            <PaperHeader>
              <PaperNav>
                <IconButton onClick={handlePrev}>
                  <BackArrowIcon />
                </IconButton>
              </PaperNav>
              <PaperTitle>Fees</PaperTitle>
              <PaperActions>
                <ToggleIconButton
                  variant="settings"
                  pressed={settings}
                  onClick={toggleSettings}
                />
                <ToggleIconButton
                  variant="notifications"
                  pressed={notifications}
                  onClick={toggleNotifications}
                />
              </PaperActions>
            </PaperHeader>
            <ExampleContent />
          </BridgePaper>
        </Fade>
      )}
      {current === 2 && (
        <Grow in={current === 2}>
          <BridgePaper>
            <PaperHeader>
              <PaperNav />
              <PaperTitle />
              <PaperActions></PaperActions>
            </PaperHeader>
            <CurrencyReceivedContent />
          </BridgePaper>
        </Grow>
      )}
    </Section>
  );
};
