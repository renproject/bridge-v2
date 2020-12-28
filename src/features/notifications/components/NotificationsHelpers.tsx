import { Button, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import { PaperContent } from "../../../components/layout/Paper";
import { NestedDrawer } from "../../../components/modals/BridgeModal";

type BrowserNotificationsDrawerProps = {
  open: boolean;
  onClose: () => void;
  onEnable: () => void;
};

export const BrowserNotificationsDrawer: FunctionComponent<BrowserNotificationsDrawerProps> = ({
  open,
  onClose,
  onEnable,
}) => {
  return (
    <NestedDrawer title=" " open={open} onClose={onClose}>
      <PaperContent topPadding>
        <Typography variant="h5" align="center" gutterBottom>
          Enable browser notifications
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="textSecondary"
          gutterBottom
        >
          It will let you track transaction progress.
        </Typography>
      </PaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <Button variant="text" color="primary" onClick={onClose}>
            Do not enable
          </Button>
        </ActionButtonWrapper>
        <ActionButtonWrapper>
          <ActionButton onClick={onEnable}>
            Enable Browser Notifications
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </NestedDrawer>
  );
};
