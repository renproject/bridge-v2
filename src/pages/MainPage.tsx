import React, { FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import {
  BridgePaperWrapper,
  BridgePurePaper,
} from "../components/layout/Paper";
import { storageKeys } from "../constants/constants";
import { GatewayRoutes } from "../features/gateway/GatewayRoutes";
import {
  useExchangeRates,
  useGasPrices,
} from "../features/marketData/marketDataHooks";
import { $ui } from "../features/ui/uiSlice";
import { PaperTitleProvider } from "../providers/TitleProviders";
import { GatewayContextProvider } from "../providers/TransactionProviders";
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
        <GatewayContextProvider>
          <PaperTitleProvider>
            <BridgePaperWrapper>
              <BridgePurePaper shaking={paperShaking}>
                <GatewayRoutes />
              </BridgePurePaper>
            </BridgePaperWrapper>
          </PaperTitleProvider>
        </GatewayContextProvider>
      </ConnectedMainLayout>
    </>
  );
};

export default MainPage;
