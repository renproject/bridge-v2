import React, { FunctionComponent, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FlowTabs } from '../../features/flow/components/FlowTabs'
import { $flow, setFlowKind } from '../../features/flow/flowSlice'
import { FlowStep } from '../../features/flow/flowTypes'
import { useMarketDataRates } from '../../features/marketData/marketDataHooks'
import { MintFeesStep } from './mint/MintFeesStep'
import { MintInitialStep } from './mint/MintInitialStep'

export const MintFlow: FunctionComponent = () => {
  console.log("rerendering");
  useMarketDataRates();
  const { kind } = useSelector($flow);
  const { step } = useSelector($flow);
  const dispatch = useDispatch();
  const handleTabChange = useCallback(
    (kind) => {
      //TODO: check if flow is in progress. Inform with e.g. useConfirm()
      dispatch(setFlowKind(kind));
    },
    [dispatch]
  );

  return (
    <>
      {step === FlowStep.INITIAL && (
        <FlowTabs value={kind} onKindChange={handleTabChange} />
      )}
      {step === FlowStep.INITIAL && <MintInitialStep />}
      {step === FlowStep.FEES && <MintFeesStep />}
    </>
  );
};
