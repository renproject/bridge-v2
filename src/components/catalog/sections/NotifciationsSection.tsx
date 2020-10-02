import { Button, Link } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { FunctionComponent, useCallback, useEffect } from "react";
import { useNotifications } from "../../../providers/Notifications";
import {
  Cartesian,
  RandomText,
  Section,
  SeparationWrapper,
} from "../PresentationHelpers";

export const NotificationsSection: FunctionComponent = () => {
  const { showNotification } = useNotifications();

  const showNotifications = useCallback(() => {
    showNotification("Error", { variant: "error" });
    showNotification("Warning", { variant: "warning" });
    showNotification("Info", { variant: "info" });
    showNotification("Success", { variant: "success" });
  }, [showNotification]);

  useEffect(showNotifications, []);

  const showAdvancedSnackbar = useCallback(() => {
    showNotification("Advanced Snackbar content", {
      variant: "info",
      autoHideDuration: 10000,
    });
    showNotification(
      <span>
        <RandomText /> <Link href="/">a link</Link>
      </span>,
      {
        variant: "warning",
      }
    );
    showNotification(<span>Persistent notification</span>, {
      variant: "success",
      persist: true,
    });
  }, [showNotification]);

  return (
    <Section header="Notifications (Alerts / Snackbars)">
      <Cartesian
        Component={Alert}
        Wrapper={SeparationWrapper}
        propVariants={{
          onClose: [() => {}],
          severity: ["error", "warning", "info", "success"],
        }}
      >
        <span>
          <RandomText /> <Link href="/">a link</Link>
        </span>
      </Cartesian>
      <Button onClick={showNotifications} color="primary">
        Show snackbars
      </Button>
      <Button onClick={showAdvancedSnackbar} color="secondary">
        Show advanced snackbars
      </Button>
    </Section>
  );
};
