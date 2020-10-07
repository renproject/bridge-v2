import { Box, Checkbox, FormControlLabel, Typography } from "@material-ui/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import { BigCurrencyInput } from "../../inputs/BigCurrencyInput";
import { BridgePaper } from "../../layout/Paper";
import { TooltipWithIcon } from "../../tooltips/TooltipWithIcon";
import { Section } from "../PresentationHelpers";

export const InputsSection: FunctionComponent = () => {
  const [value, setValue] = useState();
  const [checked, setChecked] = useState();
  const handleCurrencyChange = useCallback((value) => {
    setValue(value);
  }, []);
  const handleCheckboxChange = useCallback((event) => {
    setChecked(event.target.checked);
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
        <Box display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={handleCheckboxChange}
                name="primary"
                color="primary"
              />
            }
            label={
              <Typography variant="caption">
                I acknowledge this transaction requires ETH{" "}
                <TooltipWithIcon title="Explanation" />
              </Typography>
            }
          />
        </Box>
      </BridgePaper>
    </Section>
  );
};
