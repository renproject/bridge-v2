import { Container, Grid } from '@material-ui/core'
import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import './App.css'
import { Catalog } from './components/catalog/Catalog'
import { MainLayout } from './components/layout/MainLayout'

function App() {
  return (
    <Router>
      <MainLayout>
        <Switch>
          <Route path="/app">.</Route>
          <Route path="/">
            <Container maxWidth="lg">
              <Grid container item>
                <Catalog />
              </Grid>
            </Container>
          </Route>
        </Switch>
      </MainLayout>
    </Router>
  );
}

export default App;
