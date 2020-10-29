import React, { FunctionComponent } from "react";
import { FlowStep } from "../../components/utils/types";
import { ReleaseInitialStep } from "./release/ReleaseInitialStep";

const step: FlowStep = FlowStep.INITIAL;

export const ReleaseFlow: FunctionComponent = () => {
  return <>{step === "initial" && <ReleaseInitialStep />}</>;
};
