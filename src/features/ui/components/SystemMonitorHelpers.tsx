import { makeStyles } from "@material-ui/core";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { createIndicatorClass } from "../../../components/wallet/WalletHelpers";

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
    ...createIndicatorClass("info", theme.palette.info.main),
    ...createIndicatorClass("warning", theme.palette.warning.main),
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
