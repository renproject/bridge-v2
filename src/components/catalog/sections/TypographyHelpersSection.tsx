import { Box, Divider, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { BridgePaper } from "../../layout/Paper";
import { LabelWithValue } from "../../typography/TypographyHelpers";
import { Section } from "../PresentationHelpers";

export const TypographyHelpersSection: FunctionComponent = () => {
  return (
    <Section header="Typography Helpers">
      <BridgePaper>
        <Box pt={3} />
        <Typography variant="body1" gutterBottom>
          Details
        </Typography>
        <LabelWithValue
          label="Sending"
          value="1.0 BTC"
          valueEquivalent="10,131.65 USD"
        />
        <LabelWithValue label="To" value="Ethereum" />
        <Box mb={1}>
          <Divider />
        </Box>
        <Typography variant="body1" gutterBottom>
          Fees
        </Typography>
        <LabelWithValue
          label="RenVM Fee"
          labelTooltip="Explaining RenVM Fee"
          value="0.10%"
          valueEquivalent="$11.80"
        />
        <LabelWithValue
          label="Bitcoin Miner Fee"
          labelTooltip="Explaining Bitcoin Miner Fee"
          value="0.0007 BTC"
          valueEquivalent="$8.26"
        />
        <LabelWithValue
          label="Esti. Ethereum Fee"
          labelTooltip="Explaining Esti. Ethereum Fee"
          value="200 GWEI"
          valueEquivalent="$6.42"
        />
      </BridgePaper>
    </Section>
  );
};
