import React, { FunctionComponent, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePageTitle } from '../../hooks/usePageTitle'
import { FlowTabs } from "../flow/components/FlowTabs";
import { $flow, setFlowKind } from "../flow/flowSlice";
import { FlowStep } from "../flow/flowTypes";
import { useExchangeRates } from "../marketData/marketDataHooks";
import { MintDepositStep } from "./steps/MintDepositStep";
import { MintFeesStep } from "./steps/MintFeesStep";
import { MintInitialStep } from "./steps/MintInitialStep";

export const MintFlow: FunctionComponent = () => {
  usePageTitle("Minting");
  useExchangeRates();
  const { kind, step } = useSelector($flow);
  const dispatch = useDispatch();
  const handleFlowKindChange = useCallback(
    (kind) => {
      //TODO: check if flow is in progress. Inform with e.g. useConfirm()
      dispatch(setFlowKind(kind));
    },
    [dispatch]
  );

  return (
    <>
      {step === FlowStep.INITIAL && (
        <FlowTabs value={kind} onKindChange={handleFlowKindChange} />
      )}
      {step === FlowStep.INITIAL && <MintInitialStep />}
      {step === FlowStep.FEES && <MintFeesStep />}
      {step === FlowStep.DEPOSIT && <MintDepositStep />}
    </>
  );
};
