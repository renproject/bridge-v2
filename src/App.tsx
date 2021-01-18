import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { NotFoundPage } from "./pages/NotFoundPage";
import { paths } from "./pages/routes";
import { WelcomePage } from "./pages/WelcomePage";

const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const MainPage = lazy(() => import("./pages/MainPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

const mainPagePaths = [
  paths.HOME,
  paths.MINT,
  paths.MINT_TRANSACTION,
  paths.RELEASE,
  paths.RELEASE_TRANSACTION,
];
function App() {
  return (
    <Router>
      <Suspense
        fallback={
          <div id="root">
            <div className="loader">
              <div className="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
        }
      >
        <Switch>
          <Route exact path={paths.WELCOME} component={WelcomePage} />
          <Route exact path={paths.CATALOG} component={CatalogPage} />
          <Route exact path={paths.ABOUT} component={AboutPage} />
          <Route exact path={mainPagePaths} component={MainPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </Suspense>
    </Router>
  );
}

export default App;
