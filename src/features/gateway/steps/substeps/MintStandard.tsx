import { FunctionComponent } from "react";
import { RouteComponentProps } from "react-router";
import { ToggleIconButton } from "../../../../components/buttons/Buttons";
import {
  PaperActions,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../../components/layout/Paper";
import { Debug } from "../../../../components/utils/Debug";
import { usePaperTitle } from "../../../../providers/TitleProviders";
import { BrowserNotificationButton } from "../../../notifications/components/NotificationsHelpers";
import {
  useBrowserNotifications,
  useBrowserNotificationsConfirmation,
} from "../../../notifications/notificationsUtils";
import { parseGatewayQueryString } from "../../gatewayUtils";
import { useGatewayMenuControl } from "../gatewayUiHooks";

export const MintStandardProcessStep: FunctionComponent<
  RouteComponentProps
> = ({ location }) => {
  const [paperTitle] = usePaperTitle();
  const {
    // modalOpened,
    handleModalOpen,
    handleModalClose,
    tooltipOpened,
    handleTooltipClose,
  } = useBrowserNotificationsConfirmation();
  const { enabled } = useBrowserNotifications(handleModalClose);
  const { menuOpened, handleMenuOpen } = useGatewayMenuControl();
  const gatewayParams = parseGatewayQueryString(location.search);

  return (
    <>
      <PaperHeader>
        <PaperNav />
        <PaperTitle>{paperTitle}</PaperTitle>
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
      <Debug it={{ gatewayParams }} />
    </>
  );
};
