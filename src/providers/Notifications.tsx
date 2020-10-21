import {
  SnackbarProvider as NotistackSnackbarProvider,
  VariantType,
} from "notistack";
import { FunctionComponent, ReactElement } from "react";
import React from "react";
import { NotificationMessage } from "../components/notifications/NotificationMessage";

import { useSnackbar as useDefaultSnackbar, OptionsObject } from "notistack";

// type SpecialInfoVariantType = "specialInfo";

type ExtendedVariantType = VariantType | "specialInfo";

export const useNotifications = () => {
  const {
    enqueueSnackbar: enqueueDefaultSnackbar,
    closeSnackbar: closeNotification,
  } = useDefaultSnackbar();

  const showNotification = (
    message: string | ReactElement,
    options?: Omit<OptionsObject, "variant"> & Partial<{ variant: ExtendedVariantType }>
  ) => {
    enqueueDefaultSnackbar(message, {
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
