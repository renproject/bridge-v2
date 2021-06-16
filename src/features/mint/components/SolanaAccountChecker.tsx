import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Link,
  Typography,
} from "@material-ui/core";
import { BridgeModal } from "../../../components/modals/BridgeModal";
import { RenNetwork } from "@renproject/interfaces";
import { BridgeCurrency } from "../../../utils/assetConfigs";
import { Solana } from "@renproject/chains-solana";
import { ErrorDialog } from "../../transactions/components/TransactionsHelpers";

export const SolanaTokenAccountModal: React.FunctionComponent<{
  provider: any;
  network: RenNetwork;
  currency: BridgeCurrency;
}> = ({ provider, network, currency }) => {
  const [open, setOpen] = useState(true);
  const [awaiting, setAwaiting] = useState(false);
  const [creationError, setCreationError] = useState<Error>();

  const createAccount = useCallback(async () => {
    try {
      setAwaiting(true);
      await new Solana(provider, network).createAssociatedTokenAccount(
        currency
      );
      setOpen(false);
    } catch (err) {
      setCreationError(err);
    }
  }, [provider, network]);
  return (
    <>
      <ErrorDialog open={!!creationError} reason={creationError?.toString()} />
      <BridgeModal open={open} title="Solana Token Account">
        <DialogContent>
          <Typography variant="h5" align="center" gutterBottom>
            Solana Associated Token Account Required
          </Typography>
          <Typography variant="body2" align="center" gutterBottom>
            Solana requires the creation of an account for each new token you
            want to interact with.
          </Typography>
          <Typography variant="body2" align="center" gutterBottom>
            This will require you to sign a transaction and spend some SOL.
          </Typography>
          {awaiting && (
            <Typography variant="body1" align="center" gutterBottom>
              Please check your wallet to confirm the transaction
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={awaiting}
            onClick={createAccount}
            fullWidth
          >
            Create Token Account
          </Button>
        </DialogActions>
      </BridgeModal>
    </>
  );
};
