import { MuiThemeProvider } from "@material-ui/core";
import "@renproject/fonts/index.css";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
// import { inspect } from "@xstate/inspect";
import "./index.css";
import { NotificationsProvider } from "./providers/Notifications";
import { TitleProviders } from "./providers/TitleProviders";
import * as serviceWorker from "./serviceWorker";
import store from "./store/store";
import { lightTheme } from "./theme/theme";
import "./i18n/i18n";

// process.env.NODE_ENV !== "production" &&
//   inspect({
//     // options
//     // url: 'https://statecharts.io/inspect', // (default)
//     iframe: false, // open in new window
//   });

const render = () => {
  const App = require("./App").default;
  ReactDOM.render(
    <Provider store={store}>
      <MuiThemeProvider theme={lightTheme}>
        <TitleProviders>
          <NotificationsProvider>
            <App />
          </NotificationsProvider>
        </TitleProviders>
      </MuiThemeProvider>
    </Provider>,
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
