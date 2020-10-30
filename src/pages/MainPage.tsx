import React, { FunctionComponent } from 'react'
import { useSelector } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { MainLayout } from '../components/layout/MainLayout'
import { BridgePurePaper } from '../components/layout/Paper'
import { storageKeys } from '../constants/constants'
import { $flow } from '../features/flow/flowSlice'
import { FlowKind } from '../features/flow/flowTypes'
import { useFetchFees } from '../features/renData/renDataHooks'
import { MintFlow } from '../features/mint/MintFlow'
import { ReleaseFlow } from '../features/release/ReleaseFlow'
import { paths } from './routes'

export const MainPage: FunctionComponent<RouteComponentProps> = ({
  history,
}) => {
  const { kind: flowKind } = useSelector($flow);
  if (!localStorage.getItem(storageKeys.TERMS_AGREED)) {
    history.replace(paths.WELCOME);
  }
  useFetchFees();

  return (
    <>
      <MainLayout>
        <BridgePurePaper>
          {flowKind === FlowKind.MINT && <MintFlow />}
          {flowKind === FlowKind.RELEASE && <ReleaseFlow />}
        </BridgePurePaper>
      </MainLayout>
    </>
  );
};
