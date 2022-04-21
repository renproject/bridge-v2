import { Tab, Tabs, TabsProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import { paths } from "../../../pages/routes";

const useTransactionTypeTabsStyles = makeStyles({
  tab: {
    minWidth: 80,
  },
});

export const TransactionTypeTabs: FunctionComponent<TabsProps> = () => {
  const { t } = useTranslation();
  const styles = useTransactionTypeTabsStyles();
  const history = useHistory();
  const { path } = useRouteMatch();
  const handleTabChange = useCallback(
    (event: React.ChangeEvent<{}>, newPath: string) => {
      history.push(newPath);
    },
    [history]
  );

  return (
    <>
      <Tabs
        value={path}
        onChange={handleTabChange}
        indicatorColor="primary"
        variant="fullWidth"
      >
        <Tab
          className={styles.tab}
          label={t("mint.tab-name")}
          value={paths.MINT}
        />
        <Tab className={styles.tab} label="Bridge" value={paths.BRIDGE} />
        <Tab
          className={styles.tab}
          label={t("release.tab-name")}
          value={paths.RELEASE}
        />
      </Tabs>
    </>
  );
};
