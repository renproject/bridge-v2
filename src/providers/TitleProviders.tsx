import React, { FunctionComponent, useEffect } from "react";
import { createStateContext, useTitle } from "react-use";
import { appName } from "../constants/constants";
import { useAlertFavicon } from "./Notifications";

const [usePaperTitle, PaperTitleProvider] = createStateContext("Transaction");

export const useSetPaperTitle = (title: string) => {
  const [, setTitle] = usePaperTitle();
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
};

const [useActionRequired, ActionRequiredProvider] = createStateContext(false);

export const useSetActionRequired = (required: boolean) => {
  const [, setActionRequired] = useActionRequired();

  useAlertFavicon(required);

  useEffect(() => {
    setActionRequired(required);
    return () => {
      setActionRequired(false);
    };
  }, [setActionRequired, required]);
};

export const useStandardPageTitle = (title: string) =>
  useTitle(`${title} - ${appName}`);

export const usePageTitle = (title: string) => {
  const [actionRequired] = useActionRequired();

  useEffect(() => {
    const baseTitle = `${title} - ${appName}`;
    let newTitle = baseTitle;
    if (actionRequired) {
      newTitle = `Action required! - ${baseTitle}`;
    }
    document.title = newTitle;
  }, [title, actionRequired]);
};

export { PaperTitleProvider, usePaperTitle };

export const TitleProviders: FunctionComponent = ({ children }) => {
  return <ActionRequiredProvider>{children}</ActionRequiredProvider>;
};
