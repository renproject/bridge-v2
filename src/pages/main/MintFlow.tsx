import React, { FunctionComponent } from 'react'
import { useSelector } from 'react-redux'
import { FlowStep } from '../../components/utils/types'
import { $flow } from '../../features/flow/flowSlice'
import { useMarketDataRates } from '../../features/marketData/marketDataHooks'
import { MintFeesStep } from './mint/MintFeesStep'
import { MintInitialStep } from './mint/MintInitialStep'

export const MintFlow: FunctionComponent = () => {
  console.log("rerendering");
  useMarketDataRates();
  const { step } = useSelector($flow);
  return (
    <>
      {step === FlowStep.INITIAL && <MintInitialStep />}
      {step === FlowStep.FEES && <MintFeesStep />}
    </>
  );
};
