import { Container, Grid } from "@material-ui/core";
import React from "react";
import "./App.css";
import { Catalog } from "./components/catalog/Catalog";
import { WalletConnectionStatus } from "./components/indicators/WalletConnectionStatus";

function App() {
  return (
    <Container maxWidth="lg">
      <Grid container alignItems="center">
        <Grid item xs={3}>
          RenBridge
        </Grid>
        <Grid item xs={9}>
          <WalletConnectionStatus />
        </Grid>
      </Grid>
      <Grid container item>
        <Catalog />
      </Grid>
    </Container>
  );
}

export default App;
