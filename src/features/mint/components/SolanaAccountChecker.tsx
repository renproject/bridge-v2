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
  onCreated: any;
}> = ({ provider, network, currency, onCreated }) => {
  const [open, setOpen] = useState(true);
  const [awaiting, setAwaiting] = useState(false);
  const [creationError, setCreationError] = useState<string>();
  const reset = useCallback(async () => {
    setCreationError(undefined);
    setAwaiting(false);
  }, [setCreationError, setAwaiting]);

  const createAccount = useCallback(async () => {
    try {
      setAwaiting(true);
      const r = await new Solana(
        provider,
        network
      ).createAssociatedTokenAccount(currency);
      setOpen(false);
      onCreated(r);
    } catch (err) {
      if (err.error?.message) {
        setCreationError(err.message);
      } else if (err.includes && err.includes("Attempt to debit an account")) {
        setCreationError(
          "No SOL found for this account. Please ensure that you are connected with the correct wallet"
        );
      } else {
        setCreationError("Failed to submit transaction");
      }
    }
  }, [provider, network]);
  return (
    <>
      <ErrorDialog
        actionText="Try Again"
        onAction={reset}
        open={!!creationError}
        reason={creationError?.toString()}
      />
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
