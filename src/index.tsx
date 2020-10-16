import "@renproject/fonts/index.css";
import { MuiThemeProvider } from "@material-ui/core";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { MultiwalletProvider } from "./providers/Multiwallet";
import { NotificationsProvider } from "./providers/Notifications";
import * as serviceWorker from "./serviceWorker";
import { lightTheme } from "./theme/theme";

ReactDOM.render(
  <MuiThemeProvider theme={lightTheme}>
    <MultiwalletProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </MultiwalletProvider>
  </MuiThemeProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
