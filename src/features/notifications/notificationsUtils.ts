import { useCallback, useState } from "react";
import { useLocation } from "react-use";

export const useBrowserNotifications = (onEnabled = () => {}) => {
  // const location = useLocation();
  let enabled = false;
  if ((window as any).Notification) {
    enabled = Notification.permission === "granted";
  }

  const handleEnable = useCallback(() => {
    console.log("enabled", enabled);
    if (enabled) {
      if (onEnabled) {
        onEnabled();
      }
    } else {
      Notification.requestPermission().then(() => {
        if (onEnabled) {
          onEnabled();
        }
      });
    }
  }, [enabled, onEnabled]);

  const showBrowserNotification = useCallback((message) => {
    if ((window as any).Notification) {
      const notification = new Notification(message);
      notification.onclick = () => {
        // window.open(location.href);
      };
    }
  }, []);

  return {
    enabled,
    handleEnable,
    Notification,
    showBrowserNotification,
  };
};

export const useBrowserNotificationsConfirmation = () => {
  const { enabled } = useBrowserNotifications();
  const [modalOpened, setModalOpened] = useState(false);

  const handleModalOpen = useCallback(() => {
    if (!enabled) {
      setModalOpened(true);
    }
  }, [enabled]);

  const handleModalClose = useCallback(() => {
    setModalOpened(false);
  }, []);

  return {
    modalOpened,
    handleModalOpen,
    handleModalClose,
  };
};
