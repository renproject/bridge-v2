import { MuiThemeProvider } from "@material-ui/core";
import i18n from "i18next";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { I18nextProvider } from "react-i18next";
import App from "./App";
import { lightTheme } from "./theme/theme";

test("App renders", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <MuiThemeProvider theme={lightTheme}>
        <App />
      </MuiThemeProvider>
    </I18nextProvider>,

    div
  );

  expect(div.innerHTML).toContain("loader");
});
