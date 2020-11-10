import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Route } from "react-router-dom";
import { Debug } from "../../components/utils/Debug";
import { usePageTitle } from "../../hooks/usePageTitle";
import { paths } from "../../pages/routes";
import { FlowTabs } from "../flow/components/FlowTabs";
import { $flow, setFlowStep } from "../flow/flowSlice";
import { FlowStep } from "../flow/flowTypes";
import { useExchangeRates } from "../marketData/marketDataHooks";
import {
  TxConfigurationStep,
  useTxParam,
} from "../transactions/transactionsUtils";
import { PaperTitleProvider } from "./mintUtils";
import { MintDepositStep } from "./steps/MintDepositStep";
import { MintFeesStep } from "./steps/MintFeesStep";
import { MintInitialStep } from "./steps/MintInitialStep";

const MintConfiguration: FunctionComponent<RouteComponentProps> = ({
  match,
}) => {
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
        <MintInitialStep onNext={onInitialNext} />
      )}
      {step === TxConfigurationStep.FEES && (
        <MintFeesStep onPrev={onFeesPrev} />
      )}
    </>
  );
};

export const MintFlow: FunctionComponent<RouteComponentProps> = ({ match }) => {
  usePageTitle("Minting");
  useExchangeRates();
  const dispatch = useDispatch();
  const { tx } = useTxParam();
  const { step } = useSelector($flow);
  // TODO: this should be route based, not mixed
  useEffect(() => {
    if (tx && step !== FlowStep.DEPOSIT) {
      dispatch(setFlowStep(FlowStep.DEPOSIT));
    }
  }, [dispatch, step, tx]);
  return (
    <PaperTitleProvider>
      <Debug it={{ match }} />
      {step === FlowStep.INITIAL && <FlowTabs />}
      <Route exact path={paths.MINT} component={MintConfiguration} />
      {step === FlowStep.FEES && <MintFeesStep />}
      {step === FlowStep.DEPOSIT && <MintDepositStep />}
    </PaperTitleProvider>
  );
};
