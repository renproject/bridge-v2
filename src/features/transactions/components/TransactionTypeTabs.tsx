import { Tab, Tabs, TabsProps } from "@material-ui/core";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import { paths } from "../../../pages/routes";

export const TransactionTypeTabs: FunctionComponent<TabsProps> = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { path } = useRouteMatch();
  const onTabChange = useCallback(
    (event: React.ChangeEvent<{}>, newPath: string) => {
      history.push(newPath);
    },
    [history]
  );

  return (
    <>
      <Tabs
        value={path}
        onChange={onTabChange}
        indicatorColor="primary"
        variant="fullWidth"
      >
        <Tab
          label={
            path === paths.MINT
              ? t("mint.tab-current-name")
              : t("mint.tab-name")
          }
          value={paths.MINT}
        />
        <Tab
          label={
            path === paths.RELEASE
              ? t("release.tab-current-name")
              : t("release.tab-name")
          }
          value={paths.RELEASE}
        />
      </Tabs>
    </>
  );
};
