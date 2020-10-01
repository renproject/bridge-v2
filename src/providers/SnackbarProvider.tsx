import { SnackbarProvider as NotistackSnackbarProvider } from "notistack";
import { FunctionComponent } from "react";
import React from "react";
import { CustomSnackMessage } from "../components/notifications/Snackbars";

export const SnackbarProvider: FunctionComponent = ({ children }) => (
  <NotistackSnackbarProvider
    anchorOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    content={(key) => <CustomSnackMessage />}
  >
    {children}
  </NotistackSnackbarProvider>
);
