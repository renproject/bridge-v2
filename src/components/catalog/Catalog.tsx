import { Button, Paper, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { theme } from "../../theme/theme";
import { Debug } from "../utils/Debug";
import { Wrapper } from "./PresentationHelpers";

export const Catalog: FunctionComponent = () => {
  return (
    <div>
      <Typography variant="h1">Component Catalog</Typography>
      <Typography variant="h2">Buttons</Typography>
      <Paper>
        <Typography variant="body1">Body</Typography>
      </Paper>
      <Wrapper>
        <Button variant="contained" color="primary" disabled>
          Inactive
        </Button>
        <Button variant="contained" color="primary">
          Normal
        </Button>
        <Button variant="contained" color="primary" size="large" disabled>
          Inactive
        </Button>
        <Button variant="contained" color="primary" size="large">
          Normal
        </Button>
      </Wrapper>
      <Wrapper>
        <Button variant="contained" color="secondary" disabled>
          Inactive
        </Button>
        <Button variant="contained" color="secondary">
          Normal
        </Button>
        <Button variant="contained" color="secondary" size="large" disabled>
          Inactive
        </Button>
        <Button variant="contained" color="secondary" size="large" >
          Normal
        </Button>
      </Wrapper>
      <Debug force it={theme} />
    </div>
  );
};
