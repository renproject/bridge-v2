import { Tab, Tabs, TabsProps } from "@material-ui/core";
import React, { FunctionComponent, useCallback } from "react";
import { FlowKind } from "../flowTypes";

export type FlowTabsProps = TabsProps & {
  onKindChange: (kind: FlowKind) => void;
};

export const FlowTabs: FunctionComponent<FlowTabsProps> = ({
  onKindChange,
  value,
}) => {
  const onTabChange = useCallback(
    (event: React.ChangeEvent<{}>, value: any) => {
      onKindChange(value as FlowKind);
    },
    [onKindChange]
  );

  return (
    <>
      <Tabs
        value={value}
        onChange={onTabChange}
        indicatorColor="primary"
        variant="fullWidth"
      >
        <Tab
          label={value === FlowKind.MINT ? "Minting" : "Mint"}
          value={FlowKind.MINT}
        />
        <Tab
          label={value === FlowKind.RELEASE ? "Releasing" : "Release"}
          value={FlowKind.RELEASE}
        />
      </Tabs>
    </>
  );
};
