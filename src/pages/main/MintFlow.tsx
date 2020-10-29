import React, { FunctionComponent } from "react";
import { FlowStep } from "../../components/utils/types";
import { useStore } from "../../providers/Store";
import { State } from "../store";
import { MintFeesStep } from "./mint/MintFeesStep";
import { MintInitialStep } from "./mint/MintInitialStep";

// TODO: add state based calcuation
const resolveStep = (store: State) => {
  return store.flow.step;
};

export const MintFlow: FunctionComponent = () => {
  const [store] = useStore();
  const step = resolveStep(store); // TODO: this should be sth like selector
  return (
    <>
      {step === FlowStep.INITIAL && <MintInitialStep />}
      {step === FlowStep.FEES && <MintFeesStep />}
    </>
  );
};
