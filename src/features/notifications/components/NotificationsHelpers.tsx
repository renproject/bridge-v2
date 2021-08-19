import {
  Button,
  ClickAwayListener,
  Tooltip,
  Typography,
} from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import {
  ActionButton,
  ActionButtonWrapper,
  ToggleIconButton,
  ToggleIconButtonProps,
} from "../../../components/buttons/Buttons";
import { PaperContent } from "../../../components/layout/Paper";
import {
  NestedDrawer,
  NestedDrawerActions,
  NestedDrawerContent,
  NestedDrawerWrapper,
} from "../../../components/modals/BridgeModal";

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
      <NestedDrawerWrapper>
        <NestedDrawerContent>
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
        </NestedDrawerContent>
        <NestedDrawerActions>
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
        </NestedDrawerActions>
      </NestedDrawerWrapper>
    </NestedDrawer>
  );
};

type BrowserNotificationButtonProps = ToggleIconButtonProps & {
  onTooltipClose: () => void;
  tooltipOpened: boolean;
};

export const BrowserNotificationButton: FunctionComponent<BrowserNotificationButtonProps> = ({
  pressed,
  onClick,
  onTooltipClose,
  tooltipOpened,
}) => {
  const { t } = useTranslation();
  return (
    <ClickAwayListener onClickAway={onTooltipClose}>
      <Tooltip
        onClose={onTooltipClose}
        open={tooltipOpened}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        title={<span>{t("notifications.browser-off-tooltip")}</span>}
      >
        <span>
          <ToggleIconButton
            pressed={pressed}
            variant="notifications"
            onClick={onClick}
          />
        </span>
      </Tooltip>
    </ClickAwayListener>
  );
};
