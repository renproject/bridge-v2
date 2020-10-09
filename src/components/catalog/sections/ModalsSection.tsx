import {
  Button,
  DialogContent,
  Typography,
  Link,
  DialogActions,
} from "@material-ui/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import { BridgeModal } from "../../modals/BridgeModal";
import { Section } from "../PresentationHelpers";

export const ModalsSection: FunctionComponent = () => {
  const [opened, setOpened] = useState(false);
  const handleOpen = useCallback(() => {
    setOpened(true);
  }, []);
  const handleClose = useCallback(() => {
    setOpened(false);
  }, []);
  return (
    <Section header="Modals">
      <Button onClick={handleOpen}>Open</Button>
      <BridgeModal open={opened} title="Warning" onClose={handleClose}>
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
            onClick={handleClose}
            fullWidth
          >
            Continue with WalletConnect
          </Button>
        </DialogActions>
      </BridgeModal>
    </Section>
  );
};
