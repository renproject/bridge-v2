import {
  Button,
  DialogProps,
  styled,
  Typography,
  useTheme,
} from "@material-ui/core";
import { GatewaySession } from "@renproject/ren-tx";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useInterval } from "react-use";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import { WarningIcon } from "../../../components/icons/RenIcons";
import { PaperContent } from "../../../components/layout/Paper";
import { Link } from "../../../components/links/Links";
import {
  BridgeModal,
  NestedDrawer,
} from "../../../components/modals/BridgeModal";
import {
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusInfo,
} from "../../../components/progress/ProgressHelpers";
import { links } from "../../../constants/constants";
import { usePaperTitle } from "../../../providers/TitleProviders";
import { getFormattedHMS } from "../../../utils/dates";

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

export type TransactionItemProps = {
  tx: GatewaySession;
  onAction?: () => void;
  onRestart?: () => void;
};

type HMSCountdownProps = { milliseconds: number };

export const HMSCountdown: FunctionComponent<HMSCountdownProps> = ({
  milliseconds,
}) => {
  const [count, setCount] = useState(milliseconds);
  useInterval(() => {
    setCount((ms) => ms - 1000);
  }, 1000);
  const time = getFormattedHMS(count);

  return <strong>{time}</strong>;
};

const ErrorIconWrapper = styled("div")(({ theme }) => ({
  fontSize: 72,
  lineHeight: 1,
  marginTop: 8,
  textAlign: "center",
  color: theme.customColors.textLight,
}));

type ErrorWithActionProps = DialogProps & {
  onAction?: () => void;
  reason?: string;
  actionText?: string;
};

export const ErrorDialog: FunctionComponent<ErrorWithActionProps> = ({
  open,
  reason = "",
  actionText = "",
  onAction,
  children,
}) => {
  return (
    <BridgeModal open={open} title="Error" maxWidth="xs">
      <SpacedPaperContent>
        <ErrorIconWrapper>
          <WarningIcon fontSize="inherit" color="inherit" />
        </ErrorIconWrapper>
        <Typography variant="h5" align="center" gutterBottom>
          {reason}
        </Typography>
        <Typography color="textSecondary" align="center" gutterBottom>
          {children}
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <ActionButton onClick={onAction}>{actionText}</ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </BridgeModal>
  );
};

export const SubmitErrorDialog: FunctionComponent<ErrorWithActionProps> = (
  props
) => (
  <ErrorDialog
    reason="Error submitting"
    actionText="Return to submission screen"
    {...props}
  >
    <span>Return to previous screen to resubmit</span>
  </ErrorDialog>
);

export const GeneralErrorDialog: FunctionComponent<ErrorWithActionProps> = (
  props
) => (
  <ErrorDialog
    reason="An error has occurred"
    actionText="Refresh page"
    {...props}
  >
    <span>
      Please ensure you have this page bookmarked before refreshing. If this
      error persists, please{" "}
      <Link external href={links.BUGS_LOG} color="primary" underline="hover">
        submit a bug here
      </Link>
      .
    </span>
  </ErrorDialog>
);
