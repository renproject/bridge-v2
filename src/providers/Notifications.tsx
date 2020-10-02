import { SnackbarProvider as NotistackSnackbarProvider, VariantType } from 'notistack'
import { FunctionComponent } from "react";
import React from "react";
import { CustomSnackMessage } from "../components/notifications/Snackbars";

import { useSnackbar as useDefaultSnackbar, OptionsObject } from "notistack";

export const useNotifications = () => {
  const {
    enqueueSnackbar: enqueueDefaultSnackbar,
    closeSnackbar: closeNotification,
  } = useDefaultSnackbar();

  const showNotification = (
    message: string,
    options?: OptionsObject & Partial<{ variant: VariantType }>
  ) => {
    enqueueDefaultSnackbar(message, {
      ...options,
      content: (key) => {
        const { variant } = options || { variant: undefined };
        return (
          <CustomSnackMessage id={key} message={message} variant={variant} />
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
  >
    {children}
  </NotistackSnackbarProvider>
);
