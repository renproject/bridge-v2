import { MuiThemeProvider } from "@material-ui/core";
import "@renproject/fonts/index.css";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "./index.css";
import { MultiwalletProvider } from "./providers/multiwallet/Multiwallet";
import { NotificationsProvider } from "./providers/Notifications";
import { TitleProviders } from "./providers/TitleProviders";
import * as serviceWorker from "./serviceWorker";
import store from "./store/store";
import { lightTheme } from "./theme/theme";

const render = () => {
  const App = require("./App").default;
  ReactDOM.render(
    <Provider store={store}>
      <MuiThemeProvider theme={lightTheme}>
        <MultiwalletProvider>
          <TitleProviders>
            <NotificationsProvider>
              <App />
            </NotificationsProvider>
          </TitleProviders>
        </MultiwalletProvider>
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
