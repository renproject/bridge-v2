import { Button, Link } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import React, { FunctionComponent, useCallback, useEffect } from 'react'
import { useNotifications } from '../../../providers/Notifications'
import { Cartesian, RandomText, Section, SeparationWrapper, } from '../PresentationHelpers'

export const NotificationsSection: FunctionComponent = () => {
  const { showNotification } = useNotifications();

  const showNotifications = useCallback(() => {
    showNotification("Success", { variant: "success" });
    showNotification("Warning", { variant: "error" });
  }, [showNotification]);

  useEffect(showNotifications, []);

  const showAdvancedSnackbar = useCallback(() => {
    showNotification("Advanced Snackbar content", {
      variant: "warning",
      autoHideDuration: 10000,
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
