import { IconButton } from '@material-ui/core'
import React, { FunctionComponent, useCallback } from 'react'
import { BackArrowIcon } from '../../../components/icons/RenIcons'
import { PaperHeader, PaperNav, PaperTitle, } from '../../../components/layout/Paper'

export const MintFeesStep: FunctionComponent = () => {
  //TODO: add Paper Header with actions here
  const handlePreviousStepClick = useCallback(() => {}, []);
  return (
    <>
      <PaperHeader>
        <PaperNav>
          <IconButton>
            <BackArrowIcon onClick={handlePreviousStepClick} />
          </IconButton>
        </PaperNav>
        <PaperTitle>Fees</PaperTitle>
      </PaperHeader>
    </>
  );
};
