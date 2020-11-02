import { Box } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { ActionButton } from "../../../components/buttons/Buttons";
import { AssetDropdown } from "../../../components/dropdowns/AssetDropdown";
import { PaperContent } from "../../../components/layout/Paper";

export const ReleaseInitialStep: FunctionComponent = () => (
  <PaperContent>
    <Box height={200}>
      <AssetDropdown mode="receive" defaultValue="BCH" />
    </Box>
    <ActionButton>Next</ActionButton>
  </PaperContent>
);
