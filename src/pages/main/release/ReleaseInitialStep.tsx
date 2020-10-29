import { Box } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { ActionButton } from "../../../components/buttons/Buttons";
import { AssetDropdown } from "../../../components/dropdowns/AssetDropdown";

export const ReleaseInitialStep: FunctionComponent = () => (
  <div>
    <Box height={200}>
      <AssetDropdown mode="receive" defaultValue="BCH" />
    </Box>
    <ActionButton>Next</ActionButton>
  </div>
);
