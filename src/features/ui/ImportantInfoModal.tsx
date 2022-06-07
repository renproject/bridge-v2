import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { toHTML } from "slack-markdown";
import { env } from "../../constants/environmentVariables";
import { WarningDialog } from "../transactions/components/TransactionsHelpers";

const getFunctionUrl = () => {
  let base = "";
  if (env.DEV) {
    base = "http://localhost:9999";
  } else {
    base = (window as any).location.origin;
  }
  return base + "/.netlify/functions/ui-message";
};

const fetchInit = {
  // mode: "cors", // no-cors, *cors, same-origin
  headers: {
    // accept: "Accept: application/json",
    // "Content-Type": "application/json",
    // "Access-Control-Allow-Origin": "*",
    // 'Content-Type': 'application/x-www-form-urlencoded',
  },
  // referrerPolicy: "no-referrer",
};

type UIMessage = {
  id: string;
  text: string;
  timestamp: number;
};

const getAckKey = (id: string) => `_ui-message-ack-${id}`;

export const ImportantInfoModal: FunctionComponent = () => {
  const [message, setMessage] = useState<UIMessage | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const url = getFunctionUrl();
    fetch(url, fetchInit as any)
      .then((response) => response.json())
      .then((content) => {
        let message = content.message as UIMessage;
        setMessage(message);
        if (message !== null && !localStorage.getItem(getAckKey(message.id))) {
          setOpen(true);
        }
      });
  }, []);

  const handleAck = useCallback(() => {
    if (message !== null) {
      localStorage.setItem(getAckKey(message.id), "1");
      setOpen(false);
    }
  }, [message]);

  return (
    <WarningDialog
      open={open}
      onMainAction={handleAck}
      mainActionText="Ok, don't show again"
    >
      {message !== null && message && message.text && (
        <div
          dangerouslySetInnerHTML={{
            __html: toHTML(message.text),
          }}
        />
      )}
    </WarningDialog>
  );
};
