import { DialogContent, Typography } from "@material-ui/core";
import { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { FooterTextLink } from "../../components/layout/Footer";
import { MediumWrapper } from "../../components/layout/LayoutHelpers";
import { BridgeModal } from "../../components/modals/BridgeModal";
import { TooltipWithIcon } from "../../components/tooltips/TooltipWithIcon";
import { SystemInfo } from "./components/SystemMonitorHelpers";
import { $systemMonitor, setSystemMonitorOpened, SystemType } from "./uiSlice";

const criticalSystems = [SystemType.Lightnode];
const supplementalSystems = [
  SystemType.Coingecko,
  SystemType.Anyblock,
  SystemType.MaticGasStation,
];

export const SystemMonitorFooterButton: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleOpen = useCallback(() => {
    dispatch(setSystemMonitorOpened(true));
  }, [dispatch]);

  return (
    <FooterTextLink onClick={handleOpen}>
      {t("ui.monitor.footer-button-label")}
    </FooterTextLink>
  );
};

export const SystemMonitor: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { systems, dialogOpened } = useSelector($systemMonitor);
  const handleClose = useCallback(() => {
    dispatch(setSystemMonitorOpened(false));
  }, [dispatch]);

  return (
    <BridgeModal
      open={dialogOpened}
      onClose={handleClose}
      title={t("ui.monitor.dialog-header")}
      maxWidth="xs"
    >
      <DialogContent>
        <Typography variant="body2" paragraph>
          {t("ui.monitor.dialog-description")}
        </Typography>
        <Typography variant="caption">
          {t("ui.monitor.dialog-systems-critical-title")}{" "}
          <TooltipWithIcon
            title={t("ui.monitor.dialog-systems-critical-tooltip")}
          />
        </Typography>
        <MediumWrapper>
          {criticalSystems.map((type) => {
            const status = systems[type];
            return <SystemInfo key={type} status={status} name={type} />;
          })}
        </MediumWrapper>
        <Typography variant="caption">
          {t("ui.monitor.dialog-systems-supplemental-title")}{" "}
          <TooltipWithIcon
            title={t("ui.monitor.dialog-systems-supplemental-tooltip")}
          />
        </Typography>
        <MediumWrapper>
          {supplementalSystems.map((type) => {
            const status = systems[type];
            return <SystemInfo key={type} status={status} name={type} />;
          })}
        </MediumWrapper>
      </DialogContent>
    </BridgeModal>
  );
};
