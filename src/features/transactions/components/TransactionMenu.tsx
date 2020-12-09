import { makeStyles } from "@material-ui/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import { PaperContent } from "../../../components/layout/Paper";
import {
  BridgeModalTitle,
  NestedDrawer,
} from "../../../components/modals/BridgeModal";
import { SpacedPaperContent } from "./TransactionsHelpers";

const useTransactionMenuStyles = makeStyles((theme) => ({
  modalTitle: {
    padding: 20,
  },
}));

type TransactionMenuProps = {
  open: boolean;
  onClose: () => void;
};

export const TransactionMenu: FunctionComponent<TransactionMenuProps> = ({
  open,
  onClose,
}) => {
  const styles = useTransactionMenuStyles();
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);
  return (
    <NestedDrawer open={open} onClose={handleClose}>
      <BridgeModalTitle className={styles.modalTitle} onClose={handleClose}>
        kurde
      </BridgeModalTitle>
      <SpacedPaperContent topPadding bottomPadding>
        content
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <ActionButton onClick={handleClose}>OK</ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </NestedDrawer>
  );
};
