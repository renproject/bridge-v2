import i18n from "i18next";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { I18nextProvider } from "react-i18next";
import { Route, Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import CatalogPage from "./CatalogPage";
import store from "../store/store";
import { Provider } from "react-redux";
import { MuiThemeProvider } from "@material-ui/core";

import { NotificationsProvider } from "../providers/Notifications";
import { TitleProviders } from "../providers/TitleProviders";
import { lightTheme } from "../theme/theme";
import { storageKeys } from "../constants/constants";

xtest("Catalog renders", () => {
  localStorage.setItem(storageKeys.TERMS_AGREED, "true");
  const div = document.createElement("div");
  const history = createMemoryHistory();

  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <MuiThemeProvider theme={lightTheme}>
          <TitleProviders>
            <NotificationsProvider>
              <Router history={history}>
                <Route component={CatalogPage} />
              </Router>
            </NotificationsProvider>
          </TitleProviders>
        </MuiThemeProvider>
      </Provider>
    </I18nextProvider>,
    div
  );

  expect(div.innerHTML).toContain("Mint");
});
