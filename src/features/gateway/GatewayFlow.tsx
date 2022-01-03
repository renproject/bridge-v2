import React, { FunctionComponent, useCallback, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Route } from "react-router-dom";
import { paths } from "../../pages/routes";
import { usePageTitle } from "../../providers/TitleProviders";
import { TransactionTypeTabs } from "./components/TransactionTypeHelpers";
import { GatewayInitialStep } from "./steps/GatewayInitialStep";
import { GatewayFeesStep } from "./steps/GatewayFeesStep";
import { MintStandardProcess } from "./steps/substeps/MintStandard";

export enum GatewayConfigurationStep {
  INITIAL = "initial",
  FEES = "fees",
}

type GatewayConfigurationProps = {
  mode: "mint" | "release";
};

const GatewayConfigurationSteps: FunctionComponent<
  GatewayConfigurationProps
> = ({ mode }) => {
  const [step, setStep] = useState(GatewayConfigurationStep.INITIAL);

  // clear the current tx so that history starts processing again
  // useSetCurrentSessionData("");

  const handleInitialNext = useCallback(() => {
    setStep(GatewayConfigurationStep.FEES);
  }, []);
  const handleFeesPrev = useCallback(() => {
    setStep(GatewayConfigurationStep.INITIAL);
  }, []);

  return (
    <>
      {step === GatewayConfigurationStep.INITIAL && (
        <>
          <TransactionTypeTabs />
          <GatewayInitialStep onNext={handleInitialNext} />
        </>
      )}
      {step === GatewayConfigurationStep.FEES && (
        <GatewayFeesStep onPrev={handleFeesPrev} />
      )}
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
        exact
        path={[paths.MINT, paths.RELEASE]}
        component={GatewayConfigurationSteps}
      />
      <Route
        exact
        path={[paths.MINT_GATEWAY]}
        component={MintStandardProcess}
      />
    </>
  );
};
