import { Paper, PaperProps } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { PaperContent, PaperContentProps } from "./PaperContent";

type BridgePaperProps = PaperContentProps & PaperProps;

export const BridgePaper: FunctionComponent<BridgePaperProps> = ({
  top,
  bottom,
  children,
}) => {
  return (
    <Paper>
      <PaperContent top={top} bottom={bottom}>
        {children}
      </PaperContent>
    </Paper>
  );
};
