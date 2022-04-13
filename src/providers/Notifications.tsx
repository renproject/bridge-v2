import { makeStyles } from "@material-ui/core/styles";
import {
  OptionsObject,
  SnackbarProvider as NotistackSnackbarProvider,
  useSnackbar as useDefaultSnackbar,
  VariantType,
} from "notistack";
import React, {
  FunctionComponent,
  ReactElement,
  useEffect,
  useMemo,
} from "react";
import { NotificationMessage } from "../components/notifications/NotificationMessage";

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

const useNotificationProviderStyles = makeStyles({
  containerRoot: {
    position: "fixed",
    top: "115px",
  },
  containerAnchorOriginTopLeft: {
    "@media (min-width: 1300px)": {
      left: `calc((100% - 1184px)/2 + 24px)`,
    },
  },
});

export const NotificationsProvider: FunctionComponent = ({ children }) => {
  const classes = useNotificationProviderStyles();
  return (
    <NotistackSnackbarProvider
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      classes={classes}
      maxSnack={4}
      domRoot={document.getElementById("notifications") || undefined}
      autoHideDuration={20000}
    >
      {children}
    </NotistackSnackbarProvider>
  );
};

const getFavicon = (alert: boolean, ext = "png", size = 0) => {
  const mode = alert ? "-alert" : "";
  const sizes = size ? `-${size}x${size}` : "";
  return `/favicon${mode}${sizes}.${ext}`;
};

const changeFavicons = (alert: boolean) => {
  const sizes = [180, 32, 16];

  for (let size of sizes) {
    const href = getFavicon(alert, "png", size);
    const link: HTMLLinkElement | null = document.querySelector(
      `link[rel='icon'][sizes='${size}x${size}']`
    );
    if (link) {
      link.type = "image/png";
      link.rel = "icon";
      link.href = href;
    }
  }

  const link: HTMLLinkElement | null = document.querySelector(
    `link[rel='shortcut icon']`
  );
  const href = getFavicon(alert, "png");
  if (link) {
    link.rel = "shortcut icon";
    link.href = href;
  }
};

export const useAlertFavicon = (alert: boolean) => {
  useEffect(() => {
    changeFavicons(alert);
    return () => changeFavicons(false);
    // document.getElementsByTagName("head")[0].appendChild(link);
  }, [alert]);
};
