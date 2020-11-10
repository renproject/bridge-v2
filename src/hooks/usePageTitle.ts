import { useTitle } from "react-use";

const appName = "RenBridge V2";

export const usePageTitle = (title: string) =>
  useTitle(`${title} - ${appName}`);
