import { Box, Checkbox, FormControlLabel, Typography } from '@material-ui/core'
import React, { FunctionComponent, useCallback, useState } from 'react'
import { BitcoinInCircleIcon } from '../../icons/RenIcons'
import { AddressInput } from '../../inputs/AddressInput'
import { BigCurrencyInput } from '../../inputs/BigCurrencyInput'
import { BridgePaper } from '../../layout/Paper'
import { Link } from '../../links/Links'
import { TooltipWithIcon } from '../../tooltips/TooltipWithIcon'
import { AssetInfo, LabelWithValue } from '../../typography/TypographyHelpers'
import { Section } from '../PresentationHelpers'

export const InputsSection: FunctionComponent = () => {
  const [value, setValue] = useState(0);
  const [checked, setChecked] = useState(false);
  const handleCurrencyChange = useCallback((value) => {
    setValue(value);
  }, []);
  const handleCheckboxChange = useCallback((event) => {
    setChecked(event.target.checked);
  }, []);
  const [address, setAddress] = useState("");
  const handleAddressChange = useCallback((event) => {
    setAddress(event.target.value);
  }, []);
  return (
    <Section header="Inputs">
      <BridgePaper topPadding>
        <BigCurrencyInput
          onChange={handleCurrencyChange}
          value={value}
          symbol="BTC"
          placeholder="0"
          usdValue={value * 9730}
        />
        <LabelWithValue
          label="renBTC Balance"
          value={<Link color="primary">0.23132</Link>}
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
                Something to agree{" "}
                <TooltipWithIcon title="Explanation" />
              </Typography>
            }
          />
        </Box>
        <Box>
          <AssetInfo
            label="Receiving:"
            value="0.31256113 BTC"
            valueEquivalent=" = $3,612.80 USD"
            Icon={<BitcoinInCircleIcon fontSize="inherit" />}
          />
        </Box>
        <Box>
          <AddressInput
            label="Releasing to:"
            onChange={handleAddressChange}
            value={address}
          />
        </Box>
      </BridgePaper>
    </Section>
  );
};
