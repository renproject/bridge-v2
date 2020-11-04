import React, { FunctionComponent, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { usePageTitle } from '../../hooks/usePageTitle'
import { FlowTabs } from '../flow/components/FlowTabs'
import { $flow, setFlowKind } from '../flow/flowSlice'
import { FlowStep } from '../flow/flowTypes'
import { ReleaseInitialStep } from './steps/ReleaseInitialStep'

export const ReleaseFlow: FunctionComponent = () => {
  usePageTitle("Releasing");
  const { kind } = useSelector($flow);
  const { step } = useSelector($flow);
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
      {step === FlowStep.INITIAL && <ReleaseInitialStep />}
    </>
  );
};
