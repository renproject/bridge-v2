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
import { useTranslation } from "react-i18next";
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

// currently unused
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
  const { t } = useTranslation();
  const [checked, setChecked] = useState(true);
  const history = useHistory();

  const handleCheckboxChange = useCallback(() => {
    setChecked(!checked);
  }, [checked]);

  const handleClose = useCallback(() => {
    if (onClosed) {
      onClosed();
    }
  }, [onClosed]);

  const handleCancel = useCallback(() => {
    history.push(paths.MINT);
  }, [history]);

  const txTimeMinutes = lockChainBlockTime * lockChainConfirmations;
  return (
    <NestedDrawer
      title={t("common.warning-label")}
      open
      onClose={handleCancel}
      fixed={false}
    >
      <NestedDrawerWrapper>
        <NestedDrawerContent>
          <PaperContent topPadding>
            <SpacedTypography variant="h5" align="center">
              {t("mint.gateway-session-popup-message-1")}{" "}
              <HCountdown milliseconds={timeRemained} />
              {t("mint.gateway-session-popup-message-2")}
            </SpacedTypography>
            <SpacedTypography
              variant="body2"
              align="center"
              color="textSecondary"
            >
              {t("mint.gateway-session-popup-tx-time-message-1")}{" "}
              <Tooltip
                title={
                  <span>{t("mint.gateway-session-popup-tx-time-tooltip")}</span>
                }
              >
                <UnderlinedSpan>
                  {txTimeMinutes} {t("common.minutes")}
                </UnderlinedSpan>
              </Tooltip>{" "}
              {t("mint.gateway-session-popup-tx-time-message-2", {
                confirmations: lockChainConfirmations,
                currency: mintCurrencyLabel,
                chain: mintChainLabel,
              })}
            </SpacedTypography>{" "}
            <SpacedTypography
              variant="body2"
              align="center"
              color="textSecondary"
            >
              {t("mint.gateway-session-popup-tx-completion-message-1")}
            </SpacedTypography>
            <SpacedTypography
              variant="body2"
              align="center"
              color="textSecondary"
            >
              <strong>
                {t("mint.gateway-session-popup-tx-completion-message-2")}
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
                        {t(
                          "mint.gateway-session-popup-tx-completion-ack-label"
                        )}
                      </Typography>
                    </FormLabel>
                  }
                />
              </FormControl>
            </CheckboxWrapper>
            <ActionButtonWrapper>
              <ActionButton onClick={handleClose} disabled={!checked}>
                {t("common.continue-label")}
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
  const { t } = useTranslation();
  const [count, setCount] = useState(milliseconds);
  useInterval(() => {
    setCount((ms) => ms - 1000);
  }, 60 * 1000);
  const { hours } = millisecondsToHMS(count);

  return (
    <strong>
      {hours} {t("common.hour", { count: hours })}
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
) => {
  const { t } = useTranslation();
  return (
    <ErrorDialog
      title={t("common.error-label")}
      reason={t("tx.submitting-error-popup-header")}
      actionText={t("tx.submitting-error-popup-action-text")}
      {...props}
    >
      <span>{t("tx.submitting-error-popup-message")}</span>
    </ErrorDialog>
  );
};

export const GeneralErrorDialog: FunctionComponent<ErrorWithActionProps> = ({
  children,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <ErrorDialog
      reason={t("tx.general-error-popup-header")}
      actionText={t("tx.general-error-popup-action-text")}
      {...props}
    >
      <span>
        {t("tx.general-error-popup-message-1")}{" "}
        <Link external href={links.BUGS_LOG} color="primary" underline="hover">
          {t("tx.general-error-popup-submit-label")}
        </Link>
        .
      </span>
      {children}
    </ErrorDialog>
  );
};

export const ExpiredErrorDialog: FunctionComponent<ErrorWithActionProps> = (
  props
) => {
  const { t } = useTranslation();
  const history = useHistory();
  const goToHome = useCallback(() => {
    history.push(paths.HOME);
  }, [history]);

  return (
    <ErrorDialog
      title={t("tx.expired-error-popup-title")}
      reason={t("tx.expired-error-popup-header")}
      actionText={t("tx.expired-error-popup-action-text")}
      {...props}
    >
      <span>{t("tx.expired-error-popup-message-1", { hours: 24 })}</span>
      <ActionButtonWrapper>
        <Button variant="text" color="inherit" onClick={goToHome}>
          {t("tx.expired-error-popup-back-to-home")}
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
  const { t } = useTranslation();
  return (
    <WarningDialog
      title={t("common.warning-label")}
      reason={t("tx.address-error-popup-header")}
      alternativeActionText={t("tx.address-error-popup-action-text")}
      {...props}
    >
      <span>
        {t("tx.address-error-popup-message-1")} (
        <Link
          external
          href={addressExplorerLink}
          color="primary"
          underline="hover"
        >
          {trimAddress(address, 5)}
        </Link>
        ).{" "}
        {t("tx.address-error-popup-message-2", {
          currency,
        })}
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
