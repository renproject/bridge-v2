import { Box, Container, Grid } from "@material-ui/core";
import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import { Catalog } from "./components/catalog/Catalog";
import { WalletConnectionStatus } from "./components/indicators/WalletConnectionStatus";
import { MainLayout } from "./components/layout/MainLayout";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/app">
          <MainLayout />
        </Route>
        <Route path="/">
          <Container maxWidth="lg">
            <Grid container alignItems="center">
              <Grid item xs={3}>
                RenBridge
              </Grid>
              <Grid item xs={9}>
                <Box display="flex" justifyContent="flex-end">
                  <WalletConnectionStatus />
                </Box>
              </Grid>
            </Grid>
            <Grid container item>
              <Catalog />
            </Grid>
          </Container>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
