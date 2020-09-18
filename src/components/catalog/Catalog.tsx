import { Button, Paper, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { theme } from "../../theme/theme";
import { Debug } from "../utils/Debug";
import { Cartesian, Wrapper } from "./PresentationHelpers";

export const Catalog: FunctionComponent = () => {
  return (
    <div>
      <Typography variant="h1">Component Catalog</Typography>
      <Typography variant="h2">Buttons</Typography>
      <Paper>
        <Typography variant="body1">Body</Typography>
      </Paper>
      <Wrapper>
        <Button variant="contained" color="primary" size="large">
          Primary Button
        </Button>
        <Button variant="contained" color="secondary" size="large">
          Secondary Button
        </Button>
      </Wrapper>
      <Cartesian
        Component={Button}
        Wrapper={Wrapper}
        content={(props: any) => `${props.color}`}
        propVariants={{
          variant: ["contained"],
          color: ["primary", "secondary"],
          size: ["large"],
          disabled: [true, false],
        }}
      />
      <Debug force it={theme} />
    </div>
  );
};
