import React, { FunctionComponent, useCallback, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { Route } from 'react-router-dom'
import { paths } from '../../pages/routes'
import { usePageTitle } from '../../providers/TitleProviders'
import { TransactionTypeTabs } from '../transactions/components/TransactionTypeTabs'
import { TxConfigurationStep } from '../transactions/transactionsUtils'
import { MintFeesStep } from './steps/MintFeesStep'
import { MintInitialStep } from './steps/MintInitialStep'
import { MintProcessStep } from './steps/MintProcessStep'

const MintConfiguration: FunctionComponent<RouteComponentProps> = () => {
  const [step, setStep] = useState(TxConfigurationStep.INITIAL);

  const onInitialNext = useCallback(() => {
    setStep(TxConfigurationStep.FEES);
  }, []);
  const onFeesPrev = useCallback(() => {
    setStep(TxConfigurationStep.INITIAL);
  }, []);

  return (
    <>
      {step === TxConfigurationStep.INITIAL && (
        <>
          <TransactionTypeTabs />
          <MintInitialStep onNext={onInitialNext} />
        </>
      )}
      {step === TxConfigurationStep.FEES && (
        <MintFeesStep onPrev={onFeesPrev} />
      )}
    </>
  );
};

export const MintFlow: FunctionComponent<RouteComponentProps> = ({ match }) => {
  usePageTitle("Minting");
  return (
    <>
      <Route exact path={paths.MINT} component={MintConfiguration} />
      <Route exact path={paths.MINT_TRANSACTION} component={MintProcessStep} />
    </>
  );
};
