import { Paper, PaperProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import { PaperContent, PaperContentProps } from "./PaperContent";

type BridgePaperProps = PaperContentProps & PaperProps;

const useStyles = makeStyles({
  root: {
    maxWidth: 400,
    margin: "0 auto",
  },
});
export const BridgePaper: FunctionComponent<BridgePaperProps> = ({
  topPadding,
  bottomPadding,
  children,
}) => {
  const styles = useStyles();
  return (
    <Paper className={styles.root}>
      <PaperContent topPadding={topPadding} bottomPadding={bottomPadding}>
        {children}
      </PaperContent>
    </Paper>
  );
};
