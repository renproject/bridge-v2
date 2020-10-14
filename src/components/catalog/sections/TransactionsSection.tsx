import { Button, Dialog } from "@material-ui/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import { TransactionsGrid } from "../../transactions/TransactionsGrid";
import { Section } from "../PresentationHelpers";

export const TransactionsSection: FunctionComponent = () => {
  const [opened, setOpened] = useState(true);
  const handleOpen = useCallback(() => {
    setOpened(true);
  }, []);
  const handleClose = useCallback(() => {
    setOpened(false);
  }, []);

  return (
    <Section header="Transactions">
      <Button variant="text" onClick={handleOpen}>
        Open Transactions
      </Button>
      <Dialog open={opened} maxWidth="sm" fullWidth onBackdropClick={handleClose}>
        <TransactionsGrid />
      </Dialog>
    </Section>
  );
};
