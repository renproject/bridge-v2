import React, { FunctionComponent } from 'react'
import { usePageTitle } from '../../hooks/usePageTitle'
import { ReleaseInitialStep } from './steps/ReleaseInitialStep'

export const ReleaseFlow: FunctionComponent = () => {
  usePageTitle("Releasing");

  return (
    <>
      <ReleaseInitialStep />
    </>
  );
};
