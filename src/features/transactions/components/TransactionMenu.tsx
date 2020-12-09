import React, { FunctionComponent, useCallback, useState } from "react";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import { PaperContent } from "../../../components/layout/Paper";
import { NestedDrawer } from "../../../components/modals/BridgeModal";
import { SpacedPaperContent } from "./TransactionsHelpers";

type TransactionMenuProps = {
  open: boolean;
  onClosed: () => void;
};

export const TransactionMenuDrawer: FunctionComponent<TransactionMenuProps> = ({
  open,
  onClosed,
}) => {
  const handleClose = useCallback(() => {
    if (onClosed) {
      onClosed();
    }
  }, [onClosed]);
  return (
    <NestedDrawer title="Transaction Menu" open={open} onClose={handleClose}>
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
