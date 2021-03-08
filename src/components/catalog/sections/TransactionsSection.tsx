import { Button, Dialog } from "@material-ui/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import { Section } from "../PresentationHelpers";

export const TransactionsSection: FunctionComponent = () => {
  const [opened, setOpened] = useState(false);
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
      <Dialog
        open={opened}
        maxWidth="sm"
        fullWidth
        onBackdropClick={handleClose}
      >
        .
      </Dialog>
    </Section>
  );
};
