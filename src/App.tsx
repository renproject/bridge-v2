import { Container, Grid } from "@material-ui/core";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import { Catalog } from "./components/catalog/Catalog";
import { MainLayout } from "./components/layout/MainLayout";

function App() {
  return (
    <Router>
      <MainLayout>
        <Container maxWidth="lg">
          <Grid container item>
            <Switch>
              <Route path="/">.</Route>
              <Route path="/catalog">
                <Catalog />
              </Route>
            </Switch>
          </Grid>
        </Container>
      </MainLayout>
    </Router>
  );
}

export default App;
