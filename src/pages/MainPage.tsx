import React, { FunctionComponent, useEffect } from "react";
import { RouteComponentProps } from "react-router";
import { Route } from "react-router-dom";
import { createStateContext } from "react-use";
import { MainLayout } from "../components/layout/MainLayout";
import { BridgePaperWrapper, BridgePurePaper } from '../components/layout/Paper'
import { storageKeys } from "../constants/constants";
import {
  useExchangeRates,
  useGasPrices,
} from "../features/marketData/marketDataHooks";
import { MintFlow } from "../features/mint/MintFlow";
import { ReleaseFlow } from "../features/release/ReleaseFlow";
import { paths } from "./routes";

const [usePaperTitle, PaperTitleProvider] = createStateContext("Transaction");

export const useSetPaperTitle = (title: string) => {
  const [, setTitle] = usePaperTitle();
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
};

export { PaperTitleProvider, usePaperTitle };

export const MainPage: FunctionComponent<RouteComponentProps> = ({
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
  return (
    <>
      <MainLayout>
        <PaperTitleProvider>
          <BridgePaperWrapper>
            <BridgePurePaper>
              <Route path={paths.MINT} component={MintFlow} />
              <Route path={paths.RELEASE} component={ReleaseFlow} />
            </BridgePurePaper>
          </BridgePaperWrapper>
        </PaperTitleProvider>
      </MainLayout>
    </>
  );
};
