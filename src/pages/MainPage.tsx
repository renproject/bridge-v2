import React, { FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Route } from "react-router-dom";
import {
  BridgePaperWrapper,
  BridgePurePaper,
} from "../components/layout/Paper";
import { storageKeys } from "../constants/constants";
import { GatewayFlow } from "../features/gateway/GatewayFlow";
import {
  useExchangeRates,
  useGasPrices,
} from "../features/marketData/marketDataHooks";
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
      {/*<ConnectedMainLayout>*/}
      <PaperTitleProvider>
        <BridgePaperWrapper>
          <BridgePurePaper shaking={paperShaking}>
            <Route path={[paths.MINT, paths.RELEASE]} component={GatewayFlow} />
          </BridgePurePaper>
        </BridgePaperWrapper>
      </PaperTitleProvider>
      {/*</ConnectedMainLayout>*/}
    </>
  );
};

export default MainPage;
