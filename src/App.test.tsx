import { MuiThemeProvider } from "@material-ui/core";
import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import { lightTheme } from "./theme/theme";

test("App renders", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <MuiThemeProvider theme={lightTheme}>
      <App />
    </MuiThemeProvider>,
    div
  );

  expect(div.innerHTML).toContain("loader");
});
