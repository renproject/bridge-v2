import {
  SnackbarProvider as NotistackSnackbarProvider,
  VariantType,
} from "notistack";
import { FunctionComponent, ReactElement } from "react";
import React from "react";
import { NotificationMessage } from "../components/notifications/NotificationMessage";

import { useSnackbar as useDefaultSnackbar, OptionsObject } from "notistack";

export const useNotifications = () => {
  const {
    enqueueSnackbar: enqueueDefaultSnackbar,
    closeSnackbar: closeNotification,
  } = useDefaultSnackbar();

  const showNotification = (
    message: string | ReactElement,
    options?: OptionsObject & Partial<{ variant: VariantType }>
  ) => {
    enqueueDefaultSnackbar(message, {
      ...options,
      content: (key) => {
        const { variant } = options || { variant: undefined };
        return (
          <NotificationMessage id={key} message={message} variant={variant} />
        );
      },
    });
  };

  return { showNotification, closeNotification };
};

export const NotificationsProvider: FunctionComponent = ({ children }) => (
  <NotistackSnackbarProvider
    anchorOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    maxSnack={4}
  >
    {children}
  </NotistackSnackbarProvider>
);
