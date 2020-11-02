import { Box, Divider, IconButton, Typography } from '@material-ui/core'
import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ActionButton, ActionButtonWrapper, } from '../../../components/buttons/Buttons'
import { NumberFormatText } from '../../../components/formatting/NumberFormatText'
import { getCurrencyGreyIcon } from '../../../components/icons/IconHelpers'
import { BackArrowIcon } from '../../../components/icons/RenIcons'
import { PaperActions, PaperContent, PaperHeader, PaperNav, PaperTitle, } from '../../../components/layout/Paper'
import { AssetInfo, LabelWithValue, } from '../../../components/typography/TypographyHelpers'
import { getMintedCurrencySymbol } from '../../../providers/multiwallet/multiwalletUtils'
import { getCurrencyShortLabel } from '../../../utils/labels'
import { setFlowStep } from '../../flow/flowSlice'
import { FlowStep } from '../../flow/flowTypes'
import { $mint, $mintCurrencyUsdAmount, $mintCurrencyUsdRate, $mintFees, } from '../mintSlice'

export const MintFeesStep: FunctionComponent = () => {
  //TODO: add Paper Header with actions here
  const dispatch = useDispatch();
  const { amount, currency } = useSelector($mint);
  const currencyUsdRate = useSelector($mintCurrencyUsdRate);
  const amountUsd = useSelector($mintCurrencyUsdAmount);
  const { renVMFee, conversionTotal, networkFee } = useSelector($mintFees);
  const renVMFeeAmountUsd = amountUsd * renVMFee;
  const renVMFeePercents = renVMFee * 100;

  const handlePreviousStepClick = useCallback(() => {
    dispatch(setFlowStep(FlowStep.INITIAL));
  }, [dispatch]);

  const mintedCurrencySymbol = getMintedCurrencySymbol(currency); // selector?
  const mintedCurrency = getCurrencyShortLabel(mintedCurrencySymbol);

  const mintedCurrencyAmountUsd = conversionTotal * currencyUsdRate;

  const MintedCurrencyIcon = useMemo(
    () => getCurrencyGreyIcon(mintedCurrencySymbol),
    [mintedCurrencySymbol]
  );

  const networkFeeUsd = networkFee * currencyUsdRate;

  const targetNetworkFee = "200 GWEI";
  const targetNetworkFeeUsd = "$6.42";

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
      <PaperContent bottomPadding>
        <Typography variant="body1" gutterBottom>
          Details
        </Typography>
        <LabelWithValue
          label="Sending"
          value={<NumberFormatText value={amount} spacedSuffix={currency} />}
          valueEquivalent={
            <NumberFormatText
              value={amountUsd}
              spacedSuffix="USD"
              decimalScale={2}
              fixedDecimalScale
            />
          }
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
          value={<NumberFormatText value={renVMFeePercents} suffix="%" />}
          valueEquivalent={
            <NumberFormatText
              value={renVMFeeAmountUsd}
              prefix="$"
              decimalScale={2}
              fixedDecimalScale
            />
          }
        />
        <LabelWithValue
          label="Bitcoin Miner Fee"
          labelTooltip="Explaining Bitcoin Miner Fee"
          value={
            <NumberFormatText value={networkFee} spacedSuffix={currency} />
          }
          valueEquivalent={
            <NumberFormatText
              value={networkFeeUsd}
              prefix="$"
              decimalScale={2}
              fixedDecimalScale
            />
          }
        />
        <LabelWithValue
          label="Esti. Ethereum Fee"
          labelTooltip="Explaining Esti. Ethereum Fee"
          value={targetNetworkFee}
          valueEquivalent={targetNetworkFeeUsd}
        />
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <AssetInfo
          label="Receiving:"
          value={
            <NumberFormatText
              value={conversionTotal}
              spacedSuffix={mintedCurrency}
              decimalScale={3}
            />
          }
          valueEquivalent={
            <NumberFormatText
              prefix=" = $"
              value={mintedCurrencyAmountUsd}
              spacedSuffix="USD"
              decimalScale={2}
              fixedDecimalScale
            />
          }
          Icon={<MintedCurrencyIcon fontSize="inherit" />}
        />
        <ActionButtonWrapper>
          <ActionButton>Next</ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </>
  );
};
