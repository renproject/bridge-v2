import i18n from "i18next";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { I18nextProvider } from "react-i18next";
import { Route, Router } from "react-router-dom";
import { createMemoryHistory } from "history";

import MainPage from "./MainPage";
import store from "../store/store";
import { Provider } from "react-redux";
import { MuiThemeProvider } from "@material-ui/core";

import { NotificationsProvider } from "../providers/Notifications";
import { TitleProviders } from "../providers/TitleProviders";
import { lightTheme } from "../theme/theme";
import { storageKeys } from "../constants/constants";

xtest("MainPage renders", (a) => {
  localStorage.setItem(storageKeys.TERMS_AGREED, "true");
  const div = document.createElement("div");

  const history = createMemoryHistory();
  act(() => {
    ReactDOM.render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MuiThemeProvider theme={lightTheme}>
            <TitleProviders>
              <NotificationsProvider>
                <Router history={history}>
                  <Route component={MainPage} />
                </Router>
              </NotificationsProvider>
            </TitleProviders>
          </MuiThemeProvider>
        </I18nextProvider>
      </Provider>,
      div
    );
  });

  expect(div.innerHTML).toBeTruthy();
});
