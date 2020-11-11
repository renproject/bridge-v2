import React, { FunctionComponent, useCallback, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Route } from "react-router-dom";
import { DebugProps } from "../../components/utils/Debug";
import { usePageTitle } from "../../hooks/usePageTitle";
import { paths } from "../../pages/routes";
import { useExchangeRates } from "../marketData/marketDataHooks";
import { TransactionTypeTabs } from "../transactions/components/TransactionTypeTabs";
import { TxConfigurationStep } from "../transactions/transactionsUtils";
import { MintFeesStep } from "./steps/MintFeesStep";
import { MintInitialStep } from "./steps/MintInitialStep";

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
          <TransactionTypeTabs />
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
    <>
      <Route exact path={paths.MINT} component={MintConfiguration} />
      <Route exact path={paths.MINT_TRANSACTION} component={DebugProps} />
    </>
  );
};
