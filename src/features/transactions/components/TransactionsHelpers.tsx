import {
  Button,
  Checkbox,
  DialogProps,
  FormControl,
  FormControlLabel,
  FormLabel,
  styled,
  Tooltip,
  Typography,
  useTheme,
} from "@material-ui/core";
import {
  BurnSession,
  ErroringBurnSession,
  GatewaySession,
} from "@renproject/ren-tx";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import { useInterval } from "react-use";
import {
  ActionButton,
  ActionButtonWrapper,
  RedButton,
} from "../../../components/buttons/Buttons";
import {
  SpecialAlertIcon,
  WarningIcon,
} from "../../../components/icons/RenIcons";
import { CheckboxWrapper } from "../../../components/inputs/InputHelpers";
import { Hide } from "../../../components/layout/LayoutHelpers";
import {
  PaperContent,
  SpacedPaperContent,
} from "../../../components/layout/Paper";
import { Link } from "../../../components/links/Links";
import {
  BridgeModal,
  NestedDrawer,
  NestedDrawerActions,
  NestedDrawerContent,
  NestedDrawerWrapper,
} from "../../../components/modals/BridgeModal";
import {
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusInfo,
} from "../../../components/progress/ProgressHelpers";
import {
  SpacedTypography,
  UnderlinedSpan,
} from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { links } from "../../../constants/constants";
import { paths } from "../../../pages/routes";
import { usePaperTitle } from "../../../providers/TitleProviders";
import { getFormattedHMS, millisecondsToHMS } from "../../../utils/dates";
import { trimAddress } from "../../../utils/strings";

export type AnyBurnSession =
  | BurnSession<any, any>
  | ErroringBurnSession<any, any>;

export const ProcessingTimeWrapper = styled("div")({
  marginTop: 5,
  marginBottom: 5,
});

type BookmarkPageWarningProps = {
  onClosed?: () => void;
};

export const BookmarkPageWarning: FunctionComponent<BookmarkPageWarningProps> = ({
  onClosed,
}) => {
  const handleClose = useCallback(() => {
    if (onClosed) {
      onClosed();
    }
  }, [onClosed]);
  return (
    <NestedDrawer title="Warning" onClose={handleClose} open>
      <NestedDrawerWrapper>
        <NestedDrawerContent>
          <PaperContent topPadding bottomPadding>
            <Typography variant="h5" align="center" gutterBottom>
              Bookmark this page
            </Typography>
            <Typography variant="body2" align="center" gutterBottom>
              To ensure you don’t lose track of your transaction, please
              bookmark this page.
            </Typography>
          </PaperContent>
        </NestedDrawerContent>
        <NestedDrawerActions>
          <PaperContent bottomPadding>
            <ActionButtonWrapper>
              <ActionButton onClick={handleClose}>I understand</ActionButton>
            </ActionButtonWrapper>
          </PaperContent>
        </NestedDrawerActions>
      </NestedDrawerWrapper>
    </NestedDrawer>
  );
};

type FinishTransactionWarningProps = {
  onClosed?: () => void;
  timeRemained: number;
  lockChainConfirmations: number;
  lockChainBlockTime: number;
  lockCurrencyLabel: string;
  mintCurrencyLabel: string;
  mintChainLabel: string;
};

export const FinishTransactionWarning: FunctionComponent<FinishTransactionWarningProps> = ({
  onClosed,
  timeRemained,
  lockChainBlockTime,
  lockChainConfirmations,
  lockCurrencyLabel,
  mintCurrencyLabel,
  mintChainLabel,
}) => {
  const [checked, setChecked] = useState(true);

  const handleCheckboxChange = useCallback(() => {
    setChecked(!checked);
  }, [checked]);

  const handleClose = useCallback(() => {
    if (onClosed) {
      onClosed();
    }
  }, [onClosed]);
  const txTimeMinutes = lockChainBlockTime * lockChainConfirmations;
  return (
    <NestedDrawer title="Warning" open onClose={handleClose} fixed={false}>
      <NestedDrawerWrapper>
        <NestedDrawerContent>
          <PaperContent topPadding>
            <SpacedTypography variant="h5" align="center">
              You only have <HCountdown milliseconds={timeRemained} /> to
              complete this transaction
            </SpacedTypography>
            <SpacedTypography
              variant="body2"
              align="center"
              color="textSecondary"
            >
              This transaction takes{" "}
              <Tooltip title="Block confirmation time depends on factors such as blockchain activity and the fee you set for your transaction">
                <UnderlinedSpan>about {txTimeMinutes} minutes</UnderlinedSpan>
              </Tooltip>{" "}
              to complete. For security reasons, you will need to wait for{" "}
              {lockChainConfirmations} block confirmations before you can mint{" "}
              {mintCurrencyLabel} on {mintChainLabel}.
            </SpacedTypography>{" "}
            <SpacedTypography
              variant="body2"
              align="center"
              color="textSecondary"
            >
              If you cannot complete this transaction within the required time,
              please return at a later date.
            </SpacedTypography>
            <SpacedTypography
              variant="body2"
              align="center"
              color="textSecondary"
            >
              <strong>
                If you do not finish it within this window, your assets will be
                lost.
              </strong>
            </SpacedTypography>
          </PaperContent>
        </NestedDrawerContent>
        <NestedDrawerActions>
          <PaperContent bottomPadding>
            <CheckboxWrapper>
              <FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={handleCheckboxChange}
                      name="ack"
                      color="primary"
                    />
                  }
                  label={
                    <FormLabel htmlFor="ack" component={Typography}>
                      <Typography variant="caption" color="textPrimary">
                        I can complete this transaction within the time
                      </Typography>
                    </FormLabel>
                  }
                />
              </FormControl>
            </CheckboxWrapper>
            <ActionButtonWrapper>
              <ActionButton onClick={handleClose} disabled={!checked}>
                Continue
              </ActionButton>
            </ActionButtonWrapper>
          </PaperContent>
        </NestedDrawerActions>
      </NestedDrawerWrapper>
    </NestedDrawer>
  );
};

type ProgressStatusProps = {
  reason?: string;
  processing?: boolean;
};

export const ProgressStatus: FunctionComponent<ProgressStatusProps> = ({
  reason = "",
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
  tx: GatewaySession<any>;
  isActive?: boolean;
  onContinue?: ((depositHash?: string) => void) | (() => void);
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

export const HCountdown: FunctionComponent<HMSCountdownProps> = ({
  milliseconds,
}) => {
  const [count, setCount] = useState(milliseconds);
  useInterval(() => {
    setCount((ms) => ms - 1000);
  }, 60 * 1000);
  const { hours } = millisecondsToHMS(count);

  return (
    <strong>
      {hours} {hours > 1 ? "hours" : "hour"}
    </strong>
  );
};

const ErrorIconWrapper = styled("div")(({ theme }) => ({
  fontSize: 72,
  lineHeight: 1,
  marginTop: 8,
  textAlign: "center",
  color: theme.customColors.textLight,
}));

type ErrorDetailsProps = {
  error: any;
};

export const ErrorDetails: FunctionComponent<ErrorDetailsProps> = ({
  error,
}) => {
  const [visible, setVisible] = useState(false);
  const handleToggle = useCallback(() => {
    setVisible(!visible);
  }, [visible]);
  return (
    <div>
      <Button variant="text" size="small" onClick={handleToggle}>
        Show {visible ? "less" : "more"}
      </Button>
      <Hide when={!visible}>
        <Debug force it={{ error }} />
      </Hide>
    </div>
  );
};

type ErrorWithActionProps = DialogProps & {
  title?: string;
  onAction?: () => void;
  reason?: string;
  actionText?: string;
  error?: any;
};

export const ErrorDialog: FunctionComponent<ErrorWithActionProps> = ({
  title = "Error",
  open,
  reason = "",
  actionText = "",
  onAction,
  error,
  children,
}) => {
  return (
    <BridgeModal open={open} title={title} maxWidth="xs">
      <SpacedPaperContent>
        <ErrorIconWrapper>
          <WarningIcon fontSize="inherit" color="inherit" />
        </ErrorIconWrapper>
        <Typography variant="h5" align="center" gutterBottom>
          {reason}
        </Typography>
        <Typography
          color="textSecondary"
          align="center"
          gutterBottom
          component="div"
        >
          {children}
        </Typography>
        {Boolean(error) && <ErrorDetails error={error} />}
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

export const GeneralErrorDialog: FunctionComponent<ErrorWithActionProps> = ({
  children,
  ...props
}) => (
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
    {children}
  </ErrorDialog>
);

export const ExpiredErrorDialog: FunctionComponent<ErrorWithActionProps> = (
  props
) => {
  const history = useHistory();
  const goToHome = useCallback(() => {
    history.push(paths.HOME);
  }, [history]);

  return (
    <ErrorDialog
      title="Expired"
      reason="This transaction has expired"
      actionText="Restart transaction"
      {...props}
    >
      <span>
        Transactions expire after 24 hours. Please restart the transaction if
        you wish to continue.
      </span>
      <ActionButtonWrapper>
        <Button variant="text" color="inherit" onClick={goToHome}>
          Back to home
        </Button>
      </ActionButtonWrapper>
    </ErrorDialog>
  );
};

type WarningWithActionsProps = DialogProps & {
  title?: string;
  reason?: string;
  onMainAction?: () => void;
  mainActionText?: string;
  mainActionDisabled?: boolean;
  onAlternativeAction?: () => void;
  alternativeActionText?: string;
  alternativeActionDisabled?: boolean;
};

export const WarningDialog: FunctionComponent<WarningWithActionsProps> = ({
  title = "Warning",
  open,
  reason = "",
  mainActionText = "",
  onMainAction,
  mainActionDisabled,
  alternativeActionText = "",
  onAlternativeAction,
  alternativeActionDisabled,
  children,
}) => {
  const showMainAction = onMainAction && mainActionText;
  return (
    <BridgeModal open={open} title={title} maxWidth="xs">
      <SpacedPaperContent>
        <ErrorIconWrapper>
          <SpecialAlertIcon fontSize="inherit" color="inherit" />
        </ErrorIconWrapper>
        <Typography variant="h5" align="center" gutterBottom>
          {reason}
        </Typography>
        <Typography
          color="textSecondary"
          align="center"
          gutterBottom
          component="div"
        >
          {children}
        </Typography>
      </SpacedPaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <RedButton
            variant="text"
            color="inherit"
            onClick={onAlternativeAction}
            disabled={alternativeActionDisabled}
          >
            {alternativeActionText}
          </RedButton>
        </ActionButtonWrapper>
        {showMainAction && (
          <ActionButtonWrapper>
            <ActionButton onClick={onMainAction} disabled={mainActionDisabled}>
              {mainActionText}
            </ActionButton>
          </ActionButtonWrapper>
        )}
      </PaperContent>
    </BridgeModal>
  );
};

type WrongAddressWarningDialogProps = WarningWithActionsProps & {
  address: string;
  addressExplorerLink: string;
  currency: string;
};

export const WrongAddressWarningDialog: FunctionComponent<WrongAddressWarningDialogProps> = ({
  address,
  addressExplorerLink,
  currency,
  ...props
}) => {
  return (
    <WarningDialog
      reason="Different account detected"
      alternativeActionText="Continue anyway"
      {...props}
    >
      <span>
        This transaction was created with a different account to the current
        account (
        <Link
          external
          href={addressExplorerLink}
          color="primary"
          underline="hover"
        >
          {trimAddress(address, 5)}
        </Link>
        ). If you do not have access to the account that created the
        transaction, you will not be able to access the {currency}. Please
        switch account in your wallet.
      </span>
    </WarningDialog>
  );
};

// POC - keep
export const PageLeaveWarningDialog: FunctionComponent<WarningWithActionsProps> = ({
  ...props
}) => {
  // const [warned, setWarned] = useState(false);
  // const [leaveWarningOpened, setLeaveWarningOpened] = useState(false);
  // const handleLeaveWarningClose = useCallback(() => {
  //   setLeaveWarningOpened(false);
  //   setWarned(true);
  // }, []);
  // usePageLeave(() => {
  //   // alert(`Please don't`);
  //   if (!warned) {
  //     setLeaveWarningOpened(true);
  //   }
  // }, [warned as never]);

  return (
    <WarningDialog
      reason="Are you sure?"
      mainActionText="I understand"
      alternativeActionText="Stop reminding me"
      {...props}
    >
      <span>
        You have unfinished transactions. You should finish them before leaving
        this page.
      </span>
    </WarningDialog>
  );
};
