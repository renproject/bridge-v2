import React, { FunctionComponent, useCallback, useState } from "react";
import { AssetTextField } from "../../inputs/AssetTextField";
import { BridgePaper } from "../../layout/Paper";
import { Section } from "../PresentationHelpers";

export const InputsSection: FunctionComponent = () => {
  const [amount, setAmount] = useState();
  const handleChange = useCallback((event) => {
    setAmount(event.target.value);
  }, []);
  return (
    <Section header="Typography Helpers">
      <BridgePaper>
        <AssetTextField
          value={amount}
          onChange={handleChange}
          placeholder="0"
          symbol="BTC"
        />
      </BridgePaper>
    </Section>
  );
};
