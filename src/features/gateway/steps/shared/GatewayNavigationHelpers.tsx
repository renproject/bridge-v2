import { FunctionComponent } from "react";
import { ToggleIconButton } from "../../../../components/buttons/Buttons";
import {
  PaperActions,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../../components/layout/Paper";
import { BrowserNotificationButton } from "../../../notifications/components/NotificationsHelpers";
import {
  useBrowserNotifications,
  useBrowserNotificationsConfirmation,
} from "../../../notifications/notificationsUtils";
import { useGatewayMenuControl } from "../gatewayUiHooks";

type GatewayPaperHeaderProps = {
  title: string;
};

export const GatewayPaperHeader: FunctionComponent<GatewayPaperHeaderProps> = ({
  title,
}) => {
  const {
    // modalOpened,
    handleModalOpen,
    handleModalClose,
    tooltipOpened,
    handleTooltipClose,
  } = useBrowserNotificationsConfirmation();
  const { enabled } = useBrowserNotifications(handleModalClose);
  const { menuOpened, handleMenuOpen } = useGatewayMenuControl();

  return (
    <PaperHeader>
      <PaperNav />
      <PaperTitle>{title}</PaperTitle>
      <PaperActions>
        <BrowserNotificationButton
          pressed={enabled}
          onClick={handleModalOpen}
          tooltipOpened={tooltipOpened}
          onTooltipClose={handleTooltipClose}
        />
        <ToggleIconButton
          disabled={true}
          variant="settings"
          onClick={handleMenuOpen}
          pressed={menuOpened}
        />
      </PaperActions>
    </PaperHeader>
  );
};