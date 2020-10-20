import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import { CatalogPage } from "./pages/CatalogPage";
import { HomePage } from "./pages/HomePage";
import { WelcomePage } from "./pages/WelcomePage";
import { paths } from "./pages/routes";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path={paths.HOME} component={HomePage} />
        <Route exact path={paths.WELCOME} component={WelcomePage} />
        <Route exact path={paths.CATALOG} component={CatalogPage} />
      </Switch>
    </Router>
  );
}

export default App;
