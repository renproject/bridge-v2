import React, { FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { usePageTitle } from "../../hooks/usePageTitle";
import { FlowTabs } from "../flow/components/FlowTabs";
import { $flow } from "../flow/flowSlice";
import { FlowStep } from "../flow/flowTypes";
import { ReleaseInitialStep } from "./steps/ReleaseInitialStep";

export const ReleaseFlow: FunctionComponent = () => {
  usePageTitle("Releasing");
  const { step } = useSelector($flow);

  return (
    <>
      {step === FlowStep.INITIAL && <FlowTabs />}
      {step === FlowStep.INITIAL && <ReleaseInitialStep />}
    </>
  );
};
