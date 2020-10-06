import React, { FunctionComponent, useCallback, useState } from "react";
import { BigCurrencyInput } from "../../inputs/BigCurrencyInput";
import { BridgePaper } from "../../layout/Paper";
import { Section } from "../PresentationHelpers";

export const InputsSection: FunctionComponent = () => {
  const [value, setValue] = useState();
  const handleCurrencyChange = useCallback((value) => {
    setValue(value);
  }, []);
  return (
    <Section header="Typography Helpers">
      <BridgePaper topPadding>
        <BigCurrencyInput
          onChange={handleCurrencyChange}
          value={value}
          symbol="BTC"
          placeholder="0"
          usdValue={value * 9730}
        />
      </BridgePaper>
    </Section>
  );
};
