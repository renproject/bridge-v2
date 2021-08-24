import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { AppLoader } from "./components/progress/AppLoader";
import { SystemMonitor } from "./features/ui/SystemMonitor";
import { NotFoundPage } from "./pages/NotFoundPage";
import { paths } from "./pages/routes";
import { LegacyBridgeModal } from "./pages/Shared";
import { WelcomePage } from "./pages/WelcomePage";

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
      <Suspense fallback={<AppLoader />}>
        <Switch>
          <Route exact path={paths.WELCOME} component={WelcomePage} />
          <Route exact path={paths.ABOUT} component={AboutPage} />
          <Route exact path={mainPagePaths} component={MainPage} />
          <Route component={NotFoundPage} />
        </Switch>
        <LegacyBridgeModal />
        <SystemMonitor />
      </Suspense>
    </Router>
  );
}

export default App;
