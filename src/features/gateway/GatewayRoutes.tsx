import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Route, useHistory, useLocation } from "react-router-dom";
import { paths } from "../../pages/routes";
import { usePageTitle } from "../../providers/TitleProviders";
import { AddressScreeningWarningDialog } from "../wallet/components/WalletHelpers";
import { GatewayPaperLoader } from "./components/GatewayHelpers";
import { TransactionTypeTabs } from "./components/TransactionTypeHelpers";
import { ReleaseH2HProcess } from "./steps/flows/ReleaseH2H";
import { ReleaseStandardProcess } from "./steps/flows/ReleaseStandard";
import { TestProcess } from "./steps/flows/Test";
import { GatewayFeesStep } from "./steps/GatewayFeesStep";
import { GatewayInitialStep } from "./steps/GatewayInitialStep";
import { MintH2HProcess } from "./steps/flows/MintH2H";
import { MintStandardProcess } from "./steps/flows/MintStandard";
import { useGatewayLocationState } from "./gatewayRoutingUtils";

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
      <AddressScreeningWarningDialog />
    </>
  );
};

const GatewayLifecycleGuard: FunctionComponent = ({ children }) => {
  const history = useHistory();
  const location = useLocation();
  const { reload } = useGatewayLocationState();

  useEffect(() => {
    let timeout: any;
    if (reload) {
      timeout = setTimeout(() => {
        history.replace({ ...location, state: {} });
      }, 1500);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [history, location, reload]);

  if (reload) {
    return <GatewayPaperLoader reason="Loading gateway..." />;
  }

  return <>{children}</>;
};

export const GatewayRoutes: FunctionComponent = () => {
  usePageTitle("Gateway");

  return (
    <GatewayLifecycleGuard>
      <Route
        exact
        path={[paths.MINT, paths.RELEASE, paths.BRIDGE]}
        component={GatewayConfigurationSteps}
      />
      <Route exact path={paths.MINT__GATEWAY_H2H} component={MintH2HProcess} />
      <Route
        exact
        path={paths.MINT__GATEWAY_STANDARD}
        component={MintStandardProcess}
      />
      <Route
        exact
        path={paths.RELEASE__GATEWAY_STANDARD}
        component={ReleaseStandardProcess}
      />
      <Route
        exact
        path={paths.RELEASE__GATEWAY_H2H}
        component={ReleaseH2HProcess}
      />
      <Route exact path={paths.BRIDGE_GATEWAY} component={ReleaseH2HProcess} />
      <Route exact path={paths.TEST} component={TestProcess} />
    </GatewayLifecycleGuard>
  );
};
