import { Box, Divider, IconButton, Typography } from "@material-ui/core";
import React, { FunctionComponent, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  BackArrowIcon,
  BitcoinInCircleIcon,
} from "../../../components/icons/RenIcons";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import {
  AssetInfo,
  LabelWithValue,
} from "../../../components/typography/TypographyHelpers";
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
            <IconButton onClick={handlePreviousStepClick}>
              <BackArrowIcon />
            </IconButton>
          </IconButton>
        </PaperNav>
        <PaperTitle>Fees & Confirm</PaperTitle>
        <PaperActions />
      </PaperHeader>
      <PaperContent>
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
        <Divider />
        <Box pt={2} />
      </PaperContent>
      <Divider />
      <PaperContent>
        <AssetInfo
          label="Receiving:"
          value="0.31256113 BTC"
          valueEquivalent=" = $3,612.80 USD"
          Icon={<BitcoinInCircleIcon fontSize="inherit" />}
        />
      </PaperContent>
    </>
  );
};
