import React, { useCallback, useState } from "react";
import {
  Button,
  DialogActions,
  DialogContent,
  Typography,
} from "@material-ui/core";
import { Trans, useTranslation } from "react-i18next";
import { BridgeModal } from "../../../components/modals/BridgeModal";
import { RenNetwork } from "@renproject/interfaces";
import { BridgeCurrency } from "../../../utils/assetConfigs";
import { Solana } from "@renproject/chains-solana";
import { ErrorDialog } from "../../transactions/components/TransactionsHelpers";
import { Link } from "../../../components/links/Links";
import { links } from "../../../constants/constants";

export const SolanaTokenAccountModal: React.FunctionComponent<{
  provider: any;
  network: RenNetwork;
  currency: BridgeCurrency;
  onCreated: any;
}> = ({ provider, network, currency, onCreated }) => {
  const { t } = useTranslation();
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
        console.error(err);
        setCreationError("Failed to submit transaction");
      }
    }
  }, [provider, network, currency, onCreated]);
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
            {t("mint.solana-token-account-required-title")}
          </Typography>
          <Typography variant="body2" align="center" gutterBottom>
            {t("mint.solana-token-account-required-description-1")}
          </Typography>
          <Typography variant="body2" align="center" gutterBottom>
            {t("mint.solana-token-account-required-description-2")}G{" "}
          </Typography>
          <br />
          <Typography variant="body2" align="center" gutterBottom>
            <Trans
              i18nKey="mint.solana-token-account-ledger-description"
              components={[<Link external href={links.LEDGER_BLIND_SIGNING} />]}
            />
          </Typography>
          <br />
          <Typography
            variant="body2"
            align="center"
            color="textSecondary"
            gutterBottom
          >
            {t("mint.solana-token-account-sol-required-message")}
          </Typography>
          {awaiting && (
            <Typography variant="body1" align="center" gutterBottom>
              {t("mint.solana-token-account-check-wallet-message")}
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
            {t("mint.solana-token-account-create-token-account-label")}
          </Button>
        </DialogActions>
      </BridgeModal>
    </>
  );
};
