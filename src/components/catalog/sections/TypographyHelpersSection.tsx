import { Box, Divider, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { BitcoinInCircleIcon } from "../../icons/RenIcons";
import { BridgePaper } from "../../layout/Paper";
import {
  AssetInfo,
  LabelWithValue,
  MiddleEllipsisText,
} from "../../typography/TypographyHelpers";
import { Section } from "../PresentationHelpers";

export const TypographyHelpersSection: FunctionComponent = () => {
  const address = "0x13123131241241241241212312314124124123412414124141000000";
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
        <LabelWithValue
          label="Address"
          value={<MiddleEllipsisText>{address}</MiddleEllipsisText>}
        />

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
        <Divider />
        <Box pt={2} />
        <AssetInfo
          label="Receiving:"
          value="0.31256113 BTC"
          valueEquivalent=" = $3,612.80 USD"
          Icon={<BitcoinInCircleIcon fontSize="inherit" />}
        />
      </BridgePaper>
    </Section>
  );
};
