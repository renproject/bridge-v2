import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { AppLoader } from "./components/progress/AppLoader";
import { ImportantInfoModal } from "./features/ui/ImportantInfoModal";
import { SystemMonitor } from "./features/ui/SystemMonitor";
// import { SystemMonitor } from "./features/ui/SystemMonitor";
import MainPage from "./pages/MainPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { paths } from "./pages/routes";
import { WelcomePage } from "./pages/WelcomePage";

// const MainPage = lazy(() => import("./pages/MainPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

const mainPagePaths = [
  paths.HOME,
  paths.MINT,
  paths.MINT__GATEWAY_STANDARD,
  paths.MINT__GATEWAY_H2H,
  paths.BRIDGE,
  paths.BRIDGE_GATEWAY,
  paths.RELEASE,
  paths.RELEASE__GATEWAY_STANDARD,
  paths.RELEASE__GATEWAY_H2H,
  paths.TEST,
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
        <ImportantInfoModal />
        <SystemMonitor />
      </Suspense>
    </Router>
  );
}

export default App;
