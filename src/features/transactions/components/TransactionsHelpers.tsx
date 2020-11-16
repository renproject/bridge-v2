import { Button, styled, Typography, useTheme } from "@material-ui/core";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import { PaperContent } from "../../../components/layout/Paper";
import { NestedDrawer } from "../../../components/modals/BridgeModal";
import {
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusInfo,
} from "../../../components/progress/ProgressHelpers";
import { usePaperTitle } from "../../../pages/MainPage";

export const ProcessingTimeWrapper = styled("div")({
  marginTop: 5,
  marginBottom: 5,
});

export const SpacedPaperContent = styled(PaperContent)({
  minHeight: 200,
});

type BookmarkPageWarningProps = {
  onClosed?: () => void;
};

export const BookmarkPageWarning: FunctionComponent<BookmarkPageWarningProps> = ({
  onClosed,
}) => {
  const [open, setOpen] = useState(true);
  const handleClose = useCallback(() => {
    if (onClosed) {
      onClosed();
    }
    setOpen(false);
  }, []);
  return (
    <NestedDrawer title="Warning" open={open} onClose={handleClose}>
      <SpacedPaperContent topPadding bottomPadding>
        <Typography variant="h5" align="center" gutterBottom>
          Bookmark this page
        </Typography>
        <Typography variant="body2" align="center" gutterBottom>
          To ensure you don’t lose track of your transaction, please bookmark
          this page.
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <ActionButton onClick={handleClose}>I understand</ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </NestedDrawer>
  );
};

type EnableNotificationsWarningProps = {
  onClosed?: () => void;
};

export const EnableNotificationsWarning: FunctionComponent<EnableNotificationsWarningProps> = ({
  onClosed,
}) => {
  const [open, setOpen] = useState(true);
  const handleClose = useCallback(() => {
    if (onClosed) {
      onClosed();
    }
    setOpen(false);
  }, [onClosed]);
  return (
    <NestedDrawer title="Warning" open={open} onClose={handleClose}>
      <SpacedPaperContent topPadding bottomPadding>
        <Typography variant="h5" align="center" gutterBottom>
          Bookmark this page
        </Typography>
        <Typography variant="body2" align="center" gutterBottom>
          To ensure you don’t lose track of your transaction, please bookmark
          this page.
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <Button variant="text" color="primary">
          Do not enable
        </Button>
        <ActionButtonWrapper>
          <ActionButton onClick={handleClose}>
            Enable Browser Notifications
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </NestedDrawer>
  );
};

type ProgressStatusProps = {
  reason?: string;
  processing?: boolean;
};

export const ProgressStatus: FunctionComponent<ProgressStatusProps> = ({
  reason = "Loading...",
  processing = true,
}) => {
  const theme = useTheme();
  const [, setTitle] = usePaperTitle();
  useEffect(() => {
    setTitle(reason);
  }, [setTitle, reason]);
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent
          processing={processing}
          color={theme.palette.primary.main}
        >
          <TransactionStatusInfo status={reason} />
        </ProgressWithContent>
      </ProgressWrapper>
    </>
  );
};
