import { Box, Button, DialogActions, DialogContent, Typography, } from '@material-ui/core'
import React, { FunctionComponent, useCallback, useState } from 'react'
import { ActionButton } from '../../buttons/Buttons'
import { Link } from '../../links/Links'
import { BridgeModal } from '../../modals/BridgeModal'
import { DotStepper } from '../../navigation/DotStepper'
import { RandomText, Section } from '../PresentationHelpers'

export const ModalsSection: FunctionComponent = () => {
  const [simpleOpened, setSimpleOpened] = useState(false);
  const [advancedOpened, setAdvancedOpened] = useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const handleSimpleOpen = useCallback(() => {
    setSimpleOpened(true);
  }, []);
  const handleSimpleClose = useCallback(() => {
    setSimpleOpened(false);
  }, []);
  const handleAdvancedOpen = useCallback(() => {
    setAdvancedOpened(true);
  }, []);
  const handleAdvancedClose = useCallback(() => {
    setAdvancedOpened(false);
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  return (
    <Section header="Modals">
      <Button variant="text" onClick={handleSimpleOpen}>
        Simple
      </Button>
      <Button variant="text" onClick={handleAdvancedOpen}>
        Stepper
      </Button>
      <BridgeModal
        open={simpleOpened}
        title="Warning"
        onClose={handleSimpleClose}
      >
        <DialogContent>
          <Typography variant="h5" align="center" gutterBottom>
            Limited wallet support
          </Typography>
          <Typography variant="body2" align="center" gutterBottom>
            RenBridge has only been tested and confirmed working with some
            WalletConnect wallets.
          </Typography>
          <Typography variant="body2" align="center" gutterBottom>
            If you continue with a wallet that has not been tested you are
            risking loss of funds.
          </Typography>
          <Typography variant="body2" align="center">
            <Link href="/" color="primary" align="center">
              View the full list before continuing ↗
            </Link>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSimpleClose}
            fullWidth
          >
            Continue with WalletConnect
          </Button>
        </DialogActions>
      </BridgeModal>
      <BridgeModal
        open={advancedOpened}
        title="Info"
        onClose={handleAdvancedClose}
      >
        <DialogContent>
          {activeStep === 0 && (
            <>
              <Typography variant="h5" gutterBottom>
                Do not close this browser tab
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                <RandomText words={5} />
              </Typography>
              <Box mt={3}>
                <ActionButton onClick={handleNext}>Next</ActionButton>
              </Box>
            </>
          )}
          {activeStep === 1 && (
            <>
              <Typography variant="h5" gutterBottom>
                <RandomText words={1} />
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                <RandomText words={3} />
              </Typography>
              <Box mt={3}>
                <ActionButton onClick={handleAdvancedClose}>OK</ActionButton>
              </Box>
            </>
          )}
        </DialogContent>
        <DotStepper
          handleNext={handleNext}
          handleBack={handleBack}
          steps={2}
          activeStep={activeStep}
        />
      </BridgeModal>
    </Section>
  );
};
