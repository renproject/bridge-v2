import React, { FunctionComponent, useCallback, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Route } from "react-router-dom";
import { usePageTitle } from "../../providers/TitleProviders";
import { paths } from "../../pages/routes";
import { TransactionTypeTabs } from "../transactions/components/TransactionTypeTabs";
import { TxConfigurationStep } from "../transactions/transactionsUtils";
import { ReleaseFeesStep } from "./steps/ReleaseFeesStep";
import { ReleaseInitialStep } from "./steps/ReleaseInitialStep";
import { ReleaseProcessStep } from "./steps/ReleaseProcessStep";

const ReleaseConfiguration: FunctionComponent<RouteComponentProps> = () => {
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
          <ReleaseInitialStep onNext={onInitialNext} />
        </>
      )}
      {step === TxConfigurationStep.FEES && (
        <ReleaseFeesStep onPrev={onFeesPrev} />
      )}
    </>
  );
};

export const ReleaseFlow: FunctionComponent = () => {
  usePageTitle("Releasing");

  return (
    <>
      <Route exact path={paths.RELEASE} component={ReleaseConfiguration} />
      <Route
        exact
        path={paths.RELEASE_TRANSACTION}
        component={ReleaseProcessStep}
      />
    </>
  );
};
