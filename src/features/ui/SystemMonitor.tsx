import { DialogContent, Typography } from "@material-ui/core";
import { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { BridgeModal } from "../../components/modals/BridgeModal";
import {
  IndicatorStatus,
  StatusIndicator,
} from "./components/SystemMonitorHelpers";
import {
  $systemMonitor,
  setSystemMonitorOpened,
  SystemStatus,
  SystemType,
} from "./uiSlice";

const criticalSystems = [SystemType.Lightnode];
const supplementalSystems = [SystemType.Coingecko, SystemType.Bandchain];

const systemToIndicatorStatus = (status: SystemStatus) => {
  switch (status) {
    case SystemStatus.Pending:
      return IndicatorStatus.Info;
    case SystemStatus.Operational:
      return IndicatorStatus.Success;
    case SystemStatus.Unknown:
      return IndicatorStatus.Warning;
    case SystemStatus.Failure:
      return IndicatorStatus.Error;
  }
};

export const SystemMonitor: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { systems, dialogOpened } = useSelector($systemMonitor);
  const handleClose = useCallback(() => {
    setSystemMonitorOpened(false);
  }, [dispatch]);

  return (
    <BridgeModal
      open={dialogOpened}
      onClose={handleClose}
      title={t("ui.monitor.dialog-header")}
    >
      <DialogContent>
        <Typography variant="body1">
          {t("ui.monitor.dialog-description")}
        </Typography>
        <Typography variant="body2">
          {t("ui.monitor.dialog-critical-systems-title")}
        </Typography>
        {criticalSystems.map((type) => {
          const system = systems[type];
          return (
            <div key={system.name}>
              {system.name}:{system.status}
            </div>
          );
        })}
        <Typography variant="body2">
          {t("ui.monitor.dialog-supplemental-systems-title")}
        </Typography>
        {supplementalSystems.map((type) => {
          const system = systems[type];
          return (
            <div key={system.name}>
              {system.name}:{system.status}
              <StatusIndicator
                status={systemToIndicatorStatus(system.status)}
              />
            </div>
          );
        })}
      </DialogContent>
    </BridgeModal>
  );
};
