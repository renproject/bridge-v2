import { IconButton } from "@material-ui/core";
import React, { FunctionComponent, useCallback } from "react";
import { useDispatch } from "react-redux";
import { BackArrowIcon } from "../../../components/icons/RenIcons";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import { setFlowStep } from "../../flow/flowSlice";
import { FlowStep } from "../../flow/flowTypes";

export const MintFeesStep: FunctionComponent = () => {
  //TODO: add Paper Header with actions here
  const dispatch = useDispatch();
  const handlePreviousStepClick = useCallback(() => {
    dispatch(setFlowStep(FlowStep.INITIAL));
  }, [dispatch]);
  return (
    <>
      <PaperHeader>
        <PaperNav>
          <IconButton>
            <BackArrowIcon onClick={handlePreviousStepClick} />
          </IconButton>
        </PaperNav>
        <PaperTitle>Fees & Confirm</PaperTitle>
        <PaperActions />
      </PaperHeader>
      <PaperContent>
        fees details
      </PaperContent>
    </>
  );
};
