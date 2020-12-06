import {
  SnackbarProvider as NotistackSnackbarProvider,
  VariantType,
} from "notistack";
import { FunctionComponent, ReactElement, useMemo } from "react";
import React from "react";
import { NotificationMessage } from "../components/notifications/NotificationMessage";

import { useSnackbar as useDefaultSnackbar, OptionsObject } from "notistack";

type ExtendedVariantType = VariantType | "specialInfo";

export const useNotifications = () => {
  const {
    enqueueSnackbar: enqueueDefaultSnackbar,
    closeSnackbar: closeNotification,
  } = useDefaultSnackbar();

  const showNotification = useMemo(
    () => (
      message: string | ReactElement,
      options?: Omit<OptionsObject, "variant"> &
        Partial<{ variant: ExtendedVariantType }>
    ) => {
      return enqueueDefaultSnackbar(message, {
        ...options,
        content: (key) => {
          const { variant } = options || { variant: undefined };
          return (
            <NotificationMessage
              id={key}
              message={message}
              variant={variant as VariantType}
            />
          );
        },
      } as OptionsObject);
    },
    [enqueueDefaultSnackbar]
  );

  return { showNotification, enqueueDefaultSnackbar, closeNotification };
};

export const NotificationsProvider: FunctionComponent = ({ children }) => (
  <NotistackSnackbarProvider
    anchorOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    maxSnack={4}
    autoHideDuration={20000}
  >
    {children}
  </NotistackSnackbarProvider>
);
