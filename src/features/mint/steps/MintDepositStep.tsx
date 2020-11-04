import { Box, Divider, IconButton, Typography } from '@material-ui/core'
import { GatewaySession } from '@renproject/rentx'
import queryString from 'query-string'
import React, { FunctionComponent, useCallback, useEffect, } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { CopyContentButton, QrCodeIconButton, ToggleIconButton, } from '../../../components/buttons/Buttons'
import { NumberFormatText } from '../../../components/formatting/NumberFormatText'
import { BackArrowIcon, BitcoinIcon } from '../../../components/icons/RenIcons'
import { PaperActions, PaperContent, PaperHeader, PaperNav, PaperTitle, } from '../../../components/layout/Paper'
import { ProgressWithContent, ProgressWrapper, } from '../../../components/progress/ProgressHelpers'
import { BigAssetAmount, BigAssetAmountWrapper, } from '../../../components/typography/TypographyHelpers'
import { Debug } from '../../../components/utils/Debug'
import { orangeLight } from '../../../theme/colors'
import { getCurrencyShortLabel } from '../../../utils/assetConfigs'
import { setFlowStep } from '../../flow/flowSlice'
import { FlowStep } from '../../flow/flowTypes'
import { useGasPrices } from '../../marketData/marketDataHooks'
import { $currentTx, setCurrentTransaction, } from '../../transactions/transactionsSlice'
import { $mint, } from '../mintSlice'
import { preValidateMintTransaction } from '../mintUtils'
import { MintFees } from './MintFeesStep'

export const MintDepositStep: FunctionComponent = () => {
  useGasPrices();
  const dispatch = useDispatch();
  const location = useLocation();
  const { amount, currency } = useSelector($mint);
  const tx = useSelector($currentTx);


  const handlePreviousStepClick = useCallback(() => {
    dispatch(setFlowStep(FlowStep.FEES));
  }, [dispatch]);

  useEffect(() => {
    const queryParams = queryString.parse(location.search);
    const tx: GatewaySession = JSON.parse(queryParams.tx as string);
    if (preValidateMintTransaction(tx)) {
      dispatch(setCurrentTransaction(tx)); // TODO: local state?
    }
  }, [dispatch, location.search]);

  const gatewayAddress = "1LU14szcGuMwxVNet1rm"; // TODO: get
  const processingTime = 60; // TODO: get
  return (
    <>
      <PaperHeader>
        <PaperNav>
          <IconButton onClick={handlePreviousStepClick}>
            <BackArrowIcon />
          </IconButton>
        </PaperNav>
        <PaperTitle>Send {getCurrencyShortLabel(currency)}</PaperTitle>
        <PaperActions>
          <ToggleIconButton variant="settings" />
          <ToggleIconButton variant="notifications" />
        </PaperActions>
      </PaperHeader>
      <PaperContent bottomPadding>
        <ProgressWrapper>
          <ProgressWithContent color={orangeLight} size={64}>
            <BitcoinIcon fontSize="inherit" color="inherit" />
          </ProgressWithContent>
        </ProgressWrapper>
        <BigAssetAmountWrapper>
          <BigAssetAmount
            value={
              <span>
                Send <NumberFormatText value={amount} spacedSuffix={currency} />{" "}
                to
              </span>
            }
          />
        </BigAssetAmountWrapper>
        <CopyContentButton content={gatewayAddress} />
        <Box
          mt={2}
          display="flex"
          justifyContent="center"
          flexDirection="column"
          alignItems="center"
        >
          <Typography variant="caption" gutterBottom>
            Estimated processing time: {processingTime} minutes
          </Typography>
          <Box mt={2}>
            <QrCodeIconButton />
          </Box>
        </Box>
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <MintFees />
        <Debug it={{ tx }} />
      </PaperContent>
    </>
  );
};
