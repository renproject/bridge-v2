import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import './App.css'
import { AboutPage } from './pages/AboutPage'
import { CatalogPage } from './pages/CatalogPage'
import { MainPage } from './pages/MainPage'
import { paths } from './pages/routes'
import { WelcomePage } from './pages/WelcomePage'

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
