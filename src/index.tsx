import { MuiThemeProvider } from "@material-ui/core";
import "@renproject/fonts/fonts.esm.css";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "./index.css";
import { NotificationsProvider } from "./providers/Notifications";
import { TitleProviders } from "./providers/TitleProviders";
import * as serviceWorker from "./serviceWorker";
import store from "./store/store";
import { lightTheme } from "./theme/theme";
import "./i18n/i18n";
import * as Sentry from "@sentry/react";

// clean history state after page reaload
window.history.replaceState({}, document.title);

if (process.env.NODE_ENV !== "development") {
  if (process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: window.location.origin.includes("bridge.renproject.io")
        ? "prod"
        : "staging",
      release: process.env.REACT_APP_VERSION,
    });
  }
}

const render = () => {
  const App = require("./App").default;
  ReactDOM.render(
    <>
      <Provider store={store}>
        <MuiThemeProvider theme={lightTheme}>
          <TitleProviders>
            <NotificationsProvider>
              <App />
            </NotificationsProvider>
          </TitleProviders>
        </MuiThemeProvider>
      </Provider>
    </>,
    document.getElementById("root")
  );
};

render();

// tslint:disable-next-line: no-any
if (process.env.NODE_ENV === "development" && (module as any).hot) {
  (module as any).hot.accept("./App", render);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
