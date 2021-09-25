import {
  Box,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@material-ui/core";
import { styled } from "@material-ui/core/styles";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../components/buttons/Buttons";
import { externalLinkAttributes } from "../../components/links/Links";
import { BridgeModalTitle } from "../../components/modals/BridgeModal";
import { Debug } from "../../components/utils/Debug";
import { WideDialog } from "./components/TransactionHistoryHelpers";
import {
  $currentSession,
  $issueResolver,
  setIssueResolverOpened,
} from "./transactionsSlice";
import { getRenExplorerLink } from "./transactionsUtils";

const FundsChip = styled("p")(({ theme }) => ({
  padding: `16px 47px`,
  border: `1px solid ${theme.palette.primary.light}`,
  borderRadius: 20,
  textAlign: "center",
  color: theme.palette.primary.main,
  display: "inline-block",
}));

export const IssuesResolverModal: FunctionComponent = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { dialogOpened } = useSelector($issueResolver);
  const { data, txId, depositHash } = useSelector($currentSession);

  const handleClose = useCallback(() => {
    dispatch(setIssueResolverOpened(false));
  }, [dispatch]);

  const deposit = data?.transactions[depositHash] || {};

  const explorer = getRenExplorerLink("testnet", depositHash);
  return (
    <WideDialog
      open={dialogOpened}
      onEscapeKeyDown={handleClose}
      onBackdropClick={handleClose}
    >
      <BridgeModalTitle onClose={handleClose}>
        {t("tx.issue-resolver-title")}
      </BridgeModalTitle>
      <DialogContent>
        <Typography variant="body2">
          {t("tx.issue-resolver-description")}
        </Typography>
        <Box display="flex" justifyContent="center">
          <FundsChip>{t("tx.issue-resolver-funds-label")}</FundsChip>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {t("tx.issue-resolver-instructions-text")}
        </Typography>
      </DialogContent>
      <Divider />
      <ActionButtonWrapper>
        <ActionButton href={explorer} {...externalLinkAttributes}>
          {t("tx.issue-resolver-go-to-explorer-label")}
        </ActionButton>
      </ActionButtonWrapper>
      <DialogContent>
        <Debug it={{ depositHash, deposit, data: data, txId }} />
      </DialogContent>
    </WideDialog>
  );
};
