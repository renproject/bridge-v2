import React, { FunctionComponent, useCallback, useState } from "react";
import { Route } from "react-router-dom";
import { paths } from "../../pages/routes";
import { usePageTitle } from "../../providers/TitleProviders";
import { TransactionTypeTabs } from "./components/TransactionTypeHelpers";
import { SharedGatewayProvider } from "./gatewaySlice";
import { GatewayFeesStep } from "./steps/GatewayFeesStep";
import { GatewayInitialStep } from "./steps/GatewayInitialStep";
import { MintH2HProcess } from "./steps/mint/MintH2H";
import { MintStandardProcess } from "./steps/mint/MintStandard";

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

export const GatewayFlowRoutes: FunctionComponent = () => {
  usePageTitle("Gateway");

  return (
    <SharedGatewayProvider>
      <Route
        exact
        path={[paths.MINT, paths.RELEASE]}
        component={GatewayConfigurationSteps}
      />
      <Route exact path={paths.MINT__GATEWAY_H2H} component={MintH2HProcess} />
      <Route
        exact
        path={paths.MINT__GATEWAY_STANDARD}
        component={MintStandardProcess}
      />
    </SharedGatewayProvider>
  );
};
