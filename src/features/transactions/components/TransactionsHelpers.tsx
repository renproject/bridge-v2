import {
  Button,
  Checkbox,
  DialogProps,
  FormControl,
  FormControlLabel,
  FormLabel,
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
import { TooltipWithIcon } from "../../../components/tooltips/TooltipWithIcon";
import { SpacedTypography } from "../../../components/typography/TypographyHelpers";
import { links } from "../../../constants/constants";
import { paths } from "../../../pages/routes";
import { usePaperTitle } from "../../../providers/TitleProviders";
import { getFormattedHMS } from "../../../utils/dates";
import { trimAddress } from "../../../utils/strings";

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
  completionTimeLabel: string;
  targetConfirmations: number;
  sourceChain: string;
  destinationChain: string;
};

export const FinishTransactionWarning: FunctionComponent<FinishTransactionWarningProps> = ({
  onClosed,
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
  const timeFormatted = "69:03:hours";
  return (
    <NestedDrawer title="Warning" open onClose={handleClose}>
      <NestedDrawerWrapper>
        <NestedDrawerContent>
          <PaperContent topPadding bottomPadding>
            <SpacedTypography variant="h5" align="center">
              You only have <strong>{timeFormatted}</strong> hours to complete
              this transaction
            </SpacedTypography>
            <SpacedTypography
              variant="body2"
              align="center"
              color="textSecondary"
            >
              This transaction takes about 1 hour to complete.
            </SpacedTypography>
            <SpacedTypography
              variant="body2"
              align="center"
              color="textSecondary"
            >
              For security reasons, after RenVM receives your BTC you will need
              to wait for 6 block confirmations before you can mint renBTC on
              Ethereum.
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
                If you do not finish it within this window your assets will be
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
                        I can complete this transaction within the time{" "}
                        <TooltipWithIcon title={`TODO: tooltip`} />
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
  tx: GatewaySession;
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

const ErrorIconWrapper = styled("div")(({ theme }) => ({
  fontSize: 72,
  lineHeight: 1,
  marginTop: 8,
  textAlign: "center",
  color: theme.customColors.textLight,
}));

type ErrorWithActionProps = DialogProps & {
  title?: string;
  onAction?: () => void;
  reason?: string;
  actionText?: string;
};

export const ErrorDialog: FunctionComponent<ErrorWithActionProps> = ({
  title = "Error",
  open,
  reason = "",
  actionText = "",
  onAction,
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

export const AuthWarningDialog: FunctionComponent<WarningWithActionsProps> = ({
  ...props
}) => {
  return (
    <WarningDialog
      reason="Allow RenBridge to backup transactions"
      mainActionText="Sign & allow to continue"
      {...props}
    >
      <span>
        To continue, you must sign with your wallet to allow RenBridge to backup
        your transactions. This allows you to resume a transaction if you close
        your web browser mid-transaction.
      </span>
    </WarningDialog>
  );
};
