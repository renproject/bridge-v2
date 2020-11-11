import React, { FunctionComponent, useCallback, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Route } from "react-router-dom";
import { Debug } from "../../components/utils/Debug";
import { usePageTitle } from "../../hooks/usePageTitle";
import { paths } from "../../pages/routes";
import { FlowTabs } from "../transactions/components/FlowTabs";
import { useExchangeRates } from "../marketData/marketDataHooks";
import { TxConfigurationStep } from "../transactions/transactionsUtils";
import { PaperTitleProvider } from "./mintUtils";
import { MintDepositStep } from "./steps/MintDepositStep";
import { MintFeesStep } from "./steps/MintFeesStep";
import { MintInitialStep } from "./steps/MintInitialStep";

// TBD: that is possibly transaction generic component
const MintConfiguration: FunctionComponent<RouteComponentProps> = () => {
  const [step, setStep] = useState(TxConfigurationStep.INITIAL);
  const onInitialNext = useCallback(() => {
    setStep(TxConfigurationStep.FEES);
  }, []);
  const onFeesPrev = useCallback(() => {
    setStep(TxConfigurationStep.INITIAL);
  }, []);

  return (
    <>
      {step === TxConfigurationStep.INITIAL && (
        <>
          <FlowTabs />
          <MintInitialStep onNext={onInitialNext} />
        </>
      )}
      {step === TxConfigurationStep.FEES && (
        <MintFeesStep onPrev={onFeesPrev} />
      )}
    </>
  );
};

export const MintFlow: FunctionComponent<RouteComponentProps> = ({ match }) => {
  usePageTitle("Minting");
  useExchangeRates();

  return (
    <PaperTitleProvider>
      <Debug it={{ match }} />
      <Route exact path={paths.MINT} component={MintConfiguration} />
      <Route exact path={paths.MINT_TRANSACTION} component={MintDepositStep} />
    </PaperTitleProvider>
  );
};
