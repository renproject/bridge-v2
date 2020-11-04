import React, { FunctionComponent } from 'react'
import { useSelector } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { usePageTitle } from '../../hooks/usePageTitle'
import { FlowTabs } from '../flow/components/FlowTabs'
import { $flow } from '../flow/flowSlice'
import { FlowStep } from '../flow/flowTypes'
import { useExchangeRates } from '../marketData/marketDataHooks'
import { MintDepositStep } from './steps/MintDepositStep'
import { MintFeesStep } from './steps/MintFeesStep'
import { MintInitialStep } from './steps/MintInitialStep'

export const MintFlow: FunctionComponent<RouteComponentProps> = ({
  history,
}) => {
  usePageTitle("Minting");
  useExchangeRates();
  const { step } = useSelector($flow);


  return (
    <>
      {step === FlowStep.INITIAL && (
        <FlowTabs />
      )}
      {step === FlowStep.INITIAL && <MintInitialStep />}
      {step === FlowStep.FEES && <MintFeesStep />}
      {step === FlowStep.DEPOSIT && <MintDepositStep />}
    </>
  );
};
