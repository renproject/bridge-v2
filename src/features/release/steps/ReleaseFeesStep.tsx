import React, { FunctionComponent } from "react";
import { ActionButton } from "../../../components/buttons/Buttons";
import { BigCurrencyInputWrapper } from "../../../components/inputs/BigCurrencyInput";
import { PaperContent } from "../../../components/layout/Paper";
import { TxConfigurationStepProps } from "../../transactions/transactionsUtils";

export const ReleaseFeesStep: FunctionComponent<TxConfigurationStepProps> = () => (
  <PaperContent bottomPadding>
    <BigCurrencyInputWrapper>Fees</BigCurrencyInputWrapper>
    <ActionButton>Next</ActionButton>
  </PaperContent>
);
