import React, { FunctionComponent, useCallback, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Route } from "react-router-dom";
import { paths } from "../../pages/routes";
import { usePageTitle } from "../../providers/TitleProviders";
import { TransactionTypeTabs } from "../transactions/components/TransactionTypeTabs";
import { GatewayInitialStep } from "./steps/GatewayInitialStep";

export enum GatewayConfigurationStep {
  INITIAL = "initial",
  FEES = "fees",
}

type GatewayConfigurationProps = {
  mode: "mint" | "release";
};

const GatewayConfigurationSteps: FunctionComponent<GatewayConfigurationProps> = ({
  mode,
}) => {
  const [step, setStep] = useState(GatewayConfigurationStep.INITIAL);

  // clear the current tx so that history starts processing again
  // useSetCurrentSessionData("");

  const onInitialNext = useCallback(() => {
    setStep(GatewayConfigurationStep.FEES);
  }, []);
  const onFeesPrev = useCallback(() => {
    setStep(GatewayConfigurationStep.INITIAL);
  }, []);

  return (
    <>
      {step === GatewayConfigurationStep.INITIAL && (
        <>
          <TransactionTypeTabs />
          {/*<span>aaa</span>*/}
          <GatewayInitialStep />
        </>
      )}
      {step === GatewayConfigurationStep.FEES && <span> fees {mode}</span>}
    </>
  );
};

export const GatewayFlow: FunctionComponent<RouteComponentProps> = ({
  match,
}) => {
  usePageTitle("Gateway");
  return (
    <>
      <Route
        path={[paths.MINT, paths.RELEASE]}
        component={GatewayConfigurationSteps}
      />
    </>
  );
};
