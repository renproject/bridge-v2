import "@renproject/fonts/index.css";
import { MuiThemeProvider } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { MultiwalletProvider } from "./providers/multiwallet/Multiwallet";
import { NotificationsProvider } from "./providers/Notifications";
import { StoreProvider } from "./providers/Store";
import * as serviceWorker from "./serviceWorker";
import { lightTheme } from "./theme/theme";

const render = (Component: FunctionComponent) =>
  ReactDOM.render(
    <StoreProvider>
      <MuiThemeProvider theme={lightTheme}>
        <MultiwalletProvider>
          <NotificationsProvider>
            <Component />
          </NotificationsProvider>
        </MultiwalletProvider>
      </MuiThemeProvider>
    </StoreProvider>,
    document.getElementById("root")
  );

render(App);

// tslint:disable-next-line: no-any
if ((module as any).hot) {
  // tslint:disable-next-line: no-any
  (module as any).hot.accept("./App", () => {
    const NextApp = require("./App").App;
    render(NextApp);
  });
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
