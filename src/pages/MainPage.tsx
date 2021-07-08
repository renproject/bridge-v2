import { Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Route } from "react-router-dom";
import {
  BridgePaper,
  BridgePaperWrapper,
  BridgePurePaper,
} from "../components/layout/Paper";
import { storageKeys } from "../constants/constants";
import {
  useExchangeRates,
  useGasPrices,
} from "../features/marketData/marketDataHooks";
import { MintFlow } from "../features/mint/MintFlow";
import { ReleaseFlow } from "../features/release/ReleaseFlow";
import { $ui } from "../features/ui/uiSlice";
import { PaperTitleProvider } from "../providers/TitleProviders";
import { ConnectedMainLayout } from "./MainLayout";
import { paths } from "./routes";

const MainPage: FunctionComponent<RouteComponentProps> = ({
  history,
  location,
}) => {
  if (!localStorage.getItem(storageKeys.TERMS_AGREED)) {
    history.replace(paths.WELCOME);
  }
  if (location.pathname === "/") {
    history.replace(paths.MINT);
  }
  useExchangeRates();
  useGasPrices();
  const { paperShaking } = useSelector($ui);
  return (
    <>
      <ConnectedMainLayout>
        <PaperTitleProvider>
          <BridgePaperWrapper>
            <BridgePaper topPadding shaking={paperShaking}>
              <Typography>
                Legacy Bridge does not support the creation of new transactions.
              </Typography>
              <br />
              <Typography>
                You can continue historical transactions by connecting your
                wallet and using the transaction history button
              </Typography>

              <br />
              <Typography>
                Please use{" "}
                <a href="https://bridge.renproject.io">Current Bridge</a> to
                continue minting and releasing.
              </Typography>

              <Route path={paths.MINT} component={MintFlow} />
              <Route path={paths.RELEASE} component={ReleaseFlow} />
            </BridgePaper>
          </BridgePaperWrapper>
        </PaperTitleProvider>
      </ConnectedMainLayout>
    </>
  );
};

export default MainPage;
