import React, { FunctionComponent } from 'react'
import { RouteComponentProps } from 'react-router'
import { Route } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { BridgePurePaper } from '../components/layout/Paper'
import { storageKeys } from '../constants/constants'
import { MintFlow } from '../features/mint/MintFlow'
import { ReleaseFlow } from '../features/release/ReleaseFlow'
import { useFetchFees } from '../features/renData/renDataHooks'
import { paths } from './routes'

export const MainPage: FunctionComponent<RouteComponentProps> = ({
  history,
}) => {
  if (!localStorage.getItem(storageKeys.TERMS_AGREED)) {
    history.replace(paths.WELCOME);
  }
  useFetchFees();

  return (
    <>
      <MainLayout>
        <BridgePurePaper>
          <Route path={paths.MINT} component={MintFlow} />
          <Route path={paths.RELEASE} component={ReleaseFlow} />
        </BridgePurePaper>
      </MainLayout>
    </>
  );
};
