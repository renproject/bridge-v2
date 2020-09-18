import { Paper, PaperProps } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { PaperContent, PaperContentProps } from "./PaperContent";

type BridgePaperProps = PaperContentProps & PaperProps;

export const BridgePaper: FunctionComponent<BridgePaperProps> = ({
  topPadding,
  bottomPadding,
  children,
}) => {
  return (
    <Paper>
      <PaperContent topPadding={topPadding} bottomPadding={bottomPadding}>
        {children}
      </PaperContent>
    </Paper>
  );
};
