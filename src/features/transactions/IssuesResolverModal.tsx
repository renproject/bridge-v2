import { DialogContent, DialogTitle, Divider } from "@material-ui/core";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { BridgeModalTitle } from "../../components/modals/BridgeModal";
import { Debug } from "../../components/utils/Debug";
import { WideDialog } from "./components/TransactionHistoryHelpers";
import {
  $currentSession,
  $currentTxId,
  $issueResolver,
  setIssueResolverOpened,
} from "./transactionsSlice";

export const IssuesResolverModal: FunctionComponent = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { dialogOpened } = useSelector($issueResolver);
  const currentTxId = useSelector($currentTxId);
  const { data, txId } = useSelector($currentSession);

  const handleClose = useCallback(() => {
    dispatch(setIssueResolverOpened(false));
  }, [dispatch]);

  return (
    <WideDialog
      open={dialogOpened}
      onEscapeKeyDown={handleClose}
      onBackdropClick={handleClose}
    >
      <BridgeModalTitle onClose={handleClose}>
        {t("tx.issue-resolver-title")}
      </BridgeModalTitle>
      <DialogContent></DialogContent>
      <Divider />
      <DialogContent>
        <Debug it={{ data: data, txId, currentTxId }} />
      </DialogContent>
    </WideDialog>
  );
};
