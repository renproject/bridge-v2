import { Tab, Tabs, TabsProps } from "@material-ui/core";
import React, { FunctionComponent, useCallback } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { paths } from "../../../pages/routes";

export type FlowTabsProps = TabsProps & {};

export const FlowTabs: FunctionComponent<FlowTabsProps> = () => {
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
          label={path === paths.MINT ? "Minting" : "Mint"}
          value={paths.MINT}
        />
        <Tab
          label={path === paths.RELEASE ? "Releasing" : "Release"}
          value={paths.RELEASE}
        />
      </Tabs>
    </>
  );
};
