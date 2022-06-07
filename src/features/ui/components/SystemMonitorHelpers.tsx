import { makeStyles } from "@material-ui/core";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { TooltipWithIcon } from "../../../components/tooltips/TooltipWithIcon";
import { createIndicatorClass } from "../../wallet/components/WalletHelpers";
import { SystemStatus } from "../uiSlice";

export enum IndicatorStatus {
  Success = "success",
  Error = "error",
  Info = "info",
  Warning = "warning",
}

type StatusIndicatorStyles = Record<IndicatorStatus | string, string>;

const useStatusIndicatorStyles = makeStyles((theme) => {
  return {
    root: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.palette.divider,
    },
    ...createIndicatorClass("success", theme.palette.success.main),
    ...createIndicatorClass("error", theme.palette.error.main),
    ...createIndicatorClass("warning", theme.palette.warning.main),
    ...createIndicatorClass("info", theme.palette.grey.A700),
  };
});

type StatusIndicatorProps = {
  status: IndicatorStatus;
  className?: string;
};

export const StatusIndicator: FunctionComponent<StatusIndicatorProps> = ({
  status,
  className: classNameProp,
}) => {
  const styles = useStatusIndicatorStyles() as StatusIndicatorStyles;
  const className = classNames(styles.root, classNameProp, {
    [styles.success]: status === "success",
    [styles.error]: status === "error",
    [styles.info]: status === "info",
    [styles.warning]: status === "warning",
  });
  return <div className={className} />;
};

export const systemToIndicatorStatus = (status: SystemStatus) => {
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

type SystemInfoProps = {
  status: SystemStatus;
  name: string;
  description?: string;
};

const useSystemInfoStyles = makeStyles(() => ({
  root: {
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    // justifyContent: "space-between",
  },
  status: {
    marginRight: 8,
  },
}));

export const SystemInfo: FunctionComponent<SystemInfoProps> = ({
  status,
  name,
  description,
}) => {
  const styles = useSystemInfoStyles();

  return (
    <div className={styles.root}>
      <span className={styles.status}>
        <StatusIndicator status={systemToIndicatorStatus(status)} />
      </span>
      <span>
        {name}
        {description && <TooltipWithIcon title={description} />}
      </span>
    </div>
  );
};
