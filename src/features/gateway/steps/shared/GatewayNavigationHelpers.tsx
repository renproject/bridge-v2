import { Box, Dialog, Typography } from "@material-ui/core";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  ActionButton,
  ToggleIconButton,
} from "../../../../components/buttons/Buttons";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../../components/layout/Paper";
import {
  BrowserNotificationButton,
  BrowserNotificationsDrawer,
} from "../../../notifications/components/NotificationsHelpers";
import {
  useBrowserNotifications,
  useBrowserNotificationsConfirmation,
} from "../../../notifications/notificationsUtils";
import { TransactionMenu } from "../../../transactions/components/TransactionMenu";
import { $transactions } from "../../../transactions/transactionsSlice";
import { useGatewayMenuControl } from "../gatewayUiHooks";

type GatewayPaperHeaderProps = {
  title: string;
};

export const GatewayPaperHeader: FunctionComponent<GatewayPaperHeaderProps> = ({
  title,
  children,
}) => {
  const { currentTxHash } = useSelector($transactions);
  const {
    modalOpened,
    handleModalOpen,
    handleModalClose,
    tooltipOpened,
    handleTooltipClose,
  } = useBrowserNotificationsConfirmation();
  const { enabled, handleEnable } = useBrowserNotifications(handleModalClose);
  const { menuOpened, handleMenuOpen, handleMenuClose } =
    useGatewayMenuControl();

  return (
    <>
      <PaperHeader>
        <PaperNav>{children}</PaperNav>
        <PaperTitle>{title}</PaperTitle>
        <PaperActions>
          <BrowserNotificationButton
            pressed={enabled}
            onClick={handleModalOpen}
            tooltipOpened={tooltipOpened}
            onTooltipClose={handleTooltipClose}
          />
          <ToggleIconButton
            variant="settings"
            disabled={!currentTxHash}
            onClick={handleMenuOpen}
            pressed={menuOpened}
          />
        </PaperActions>
      </PaperHeader>
      <TransactionMenu
        txHash={currentTxHash}
        open={menuOpened}
        onClose={handleMenuClose}
      />
      <BrowserNotificationsDrawer
        open={modalOpened}
        onClose={handleModalClose}
        onEnable={handleEnable}
      />
    </>
  );
};

type TransactionRecoveringModalProps = {
  recoveryMode?: boolean;
};

export const TransactionRecoveryModal: FunctionComponent<
  TransactionRecoveringModalProps
> = ({ recoveryMode }) => {
  const [show, setShow] = useState(false);

  const [countDone, setCountDone] = useState(false);

  useEffect(() => {
    if (recoveryMode) {
      setShow(true);
    }
    const timeout = setTimeout(() => {
      setCountDone(true);
    }, 7000);
    return () => clearTimeout(timeout);
  }, [recoveryMode]);

  const handleResume = useCallback(() => {
    setShow(false);
  }, []);

  return (
    <Dialog open={show} fullWidth maxWidth="sm">
      <PaperContent topPadding bottomPadding>
        <Box display="flex" justifyContent="center">
          <Box mb={5} maxWidth={400}>
            <Typography variant="h6" align="center">
              RenBridge is fetching your TX at the moment.
            </Typography>
            <Typography variant="h6" align="center">
              Once the process is complete you can resume your transaction with
              the button below.
            </Typography>
          </Box>
        </Box>
        <Box display="flex" justifyContent="center">
          <Box maxWidth={250}>
            <ActionButton onClick={handleResume} disabled={!countDone}>
              Resume Transaction
            </ActionButton>
          </Box>
        </Box>
      </PaperContent>
    </Dialog>
  );
};
