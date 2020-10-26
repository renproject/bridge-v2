import { Box, Button, Tab, Tabs } from "@material-ui/core";
import React, { FunctionComponent, useCallback } from "react";
import { RouteComponentProps } from "react-router";
import { AssetDropdown } from "../components/dropdowns/AssetDropdown";
import { MainLayout } from "../components/layout/MainLayout";
import { BridgePaper } from "../components/layout/Paper";
import { storageKeys } from "../constants/constants";
import { MintFlow } from "./main/Mint";
import { paths } from "./routes";

enum TabPhase {
  MINT,
  RELEASE,
}

export const MainPage: FunctionComponent<RouteComponentProps> = ({
  history,
}) => {
  if (!localStorage.getItem(storageKeys.TERMS_AGREED)) {
    history.replace(paths.WELCOME);
  }
  const [tab, setTab] = React.useState(TabPhase.MINT);
  const handleTabChange = useCallback((event, newValue) => {
    setTab(newValue);
  }, []);

  return (
    <MainLayout>
      <BridgePaper>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab label={tab === TabPhase.MINT ? "Minting" : "Mint"} />
          <Tab label={tab === TabPhase.RELEASE ? "Releasing" : "Release"} />
        </Tabs>
        {tab === TabPhase.MINT && <MintFlow />}
        {tab === TabPhase.RELEASE && (
          <div>
            <Box height={200}>
              <AssetDropdown mode="receive" defaultValue="BCH" />
            </Box>
            <Button variant="contained" color="primary" size="large" fullWidth>
              Next
            </Button>
          </div>
        )}
      </BridgePaper>
    </MainLayout>
  );
};
