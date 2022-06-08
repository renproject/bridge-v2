import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "../../components/links/Links";
import { useNotifications } from "../../providers/Notifications";
import { useBrowserNotifications } from "../notifications/notificationsUtils";
import { setCurrentTxHash } from "./transactionsSlice";

export const useSetCurrentTxHash = (hash = "") => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setCurrentTxHash(hash));
    return () => {
      dispatch(setCurrentTxHash(""));
    };
  }, [dispatch, hash]);
};

export const useTxSuccessNotification = (
  txUrl: string | null,
  notificationMessage: string,
  viewChainTxLinkMessage: string
) => {
  const { showNotification } = useNotifications();
  const { showBrowserNotification } = useBrowserNotifications();

  const txSuccessNotification = useCallback(() => {
    if (txUrl !== null) {
      showNotification(
        <span>
          {notificationMessage}{" "}
          <Link external href={txUrl}>
            {viewChainTxLinkMessage}
          </Link>
        </span>
      );
      showBrowserNotification(notificationMessage);
    }
  }, [
    showNotification,
    showBrowserNotification,
    notificationMessage,
    viewChainTxLinkMessage,
    txUrl,
  ]);

  return { txSuccessNotification };
};
