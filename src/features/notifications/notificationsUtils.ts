import { useCallback, useState } from "react";

export const useBrowserNotifications = (onEnabled = () => {}) => {
  let enabled = false;
  if ((window as any).Notification) {
    enabled = Notification.permission === "granted";
  }

  const handleEnable = useCallback(() => {
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
        // window.open(location.href); // TODO: TBD: redirect here?
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
  const [tooltipOpened, setTooltipOpened] = useState(false);

  const handleTooltipClose = useCallback(() => {
    setTooltipOpened(false);
  }, []);

  const handleModalOpen = useCallback(() => {
    if (!enabled) {
      setModalOpened(true);
    } else {
      setTooltipOpened(!tooltipOpened);
    }
  }, [enabled, tooltipOpened]);

  const handleModalClose = useCallback(() => {
    setModalOpened(false);
  }, []);

  return {
    modalOpened,
    handleModalOpen,
    handleModalClose,
    tooltipOpened,
    handleTooltipClose,
  };
};
