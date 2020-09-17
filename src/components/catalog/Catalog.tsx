import { Button, Paper, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { theme } from "../../theme/theme";
import { Debug } from "../utils/Debug";

export const Catalog: FunctionComponent = () => {
  return (
    <div>
      <Typography variant="h1">Component Catalog</Typography>
      <Typography variant="h2">Buttons</Typography>
      <Paper>
        <Typography variant="body1">Body</Typography>
      </Paper>
      <div>
        <Button variant="contained" color="primary" disabled>
          Inactive
        </Button>
        <Button variant="contained" color="primary">
          Normal
        </Button>
      </div>
      <div>
        <Button variant="contained" color="secondary" disabled>
          Inactive
        </Button>
        <Button variant="contained" color="secondary">
          Normal
        </Button>
      </div>
      <Debug force it={theme} />
    </div>
  );
};
