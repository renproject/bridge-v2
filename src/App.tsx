import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import { AboutPage } from "./pages/AboutPage";
import { CatalogPage } from "./pages/CatalogPage";
import { MainPage } from "./pages/MainPage";
import { WelcomePage } from "./pages/WelcomePage";
import { paths } from "./pages/routes";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path={paths.WELCOME} component={WelcomePage} />
        <Route exact path={paths.CATALOG} component={CatalogPage} />
        <Route exact path={paths.ABOUT} component={AboutPage} />
        <Route path={paths.HOME} component={MainPage} />
      </Switch>
    </Router>
  );
}

export default App;
