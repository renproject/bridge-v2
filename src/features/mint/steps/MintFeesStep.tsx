import { Checkbox, Divider, FormControl, FormControlLabel, FormLabel, IconButton, Typography, } from '@material-ui/core'
import queryString from 'query-string'
import React, { FunctionComponent, useCallback, useMemo, useState, } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { ActionButton, ActionButtonWrapper, } from '../../../components/buttons/Buttons'
import { NumberFormatText } from '../../../components/formatting/NumberFormatText'
import { getCurrencyGreyIcon } from '../../../components/icons/IconHelpers'
import { BackArrowIcon } from '../../../components/icons/RenIcons'
import { CheckboxWrapper } from '../../../components/inputs/InputHelpers'
import { PaperActions, PaperContent, PaperHeader, PaperNav, PaperTitle, } from '../../../components/layout/Paper'
import { TooltipWithIcon } from '../../../components/tooltips/TooltipWithIcon'
import {
  AssetInfo,
  BigAssetAmount,
  BigAssetAmountWrapper,
  LabelWithValue,
  SpacedDivider,
} from '../../../components/typography/TypographyHelpers'
import { Debug } from '../../../components/utils/Debug'
import { MINT_GAS_UNIT_COST } from '../../../constants/constants'
import { useSelectedChainWallet } from '../../../providers/multiwallet/multiwalletHooks'
import { getMintedDestinationCurrencySymbol } from '../../../providers/multiwallet/multiwalletUtils'
import { getChainShortLabel, getCurrencyShortLabel, } from '../../../utils/assetConfigs'
import { fromGwei } from '../../../utils/converters'
import { setFlowStep } from '../../flow/flowSlice'
import { FlowStep } from '../../flow/flowTypes'
import { useGasPrices } from '../../marketData/marketDataHooks'
import { $ethUsdExchangeRate, $gasPrices, } from '../../marketData/marketDataSlice'
import { addTransaction } from '../../transactions/transactionsSlice'
import { $wallet, setWalletPickerOpened } from '../../wallet/walletSlice'
import { getFeeTooltips, tooltips } from '../components/MintHelpers'
import { $mint, $mintCurrencyUsdAmount, $mintCurrencyUsdRate, $mintFees, } from '../mintSlice'
import { createMintTransaction, preValidateMintTransaction, } from '../mintUtils'

export const MintFeesStep: FunctionComponent = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { amount, currency } = useSelector($mint);
  const { chain } = useSelector($wallet);
  const { account } = useSelectedChainWallet();
  const currencyUsdRate = useSelector($mintCurrencyUsdRate);
  const amountUsd = useSelector($mintCurrencyUsdAmount);
  const { conversionTotal } = useSelector($mintFees);
  const mintedCurrencySymbol = getMintedDestinationCurrencySymbol(currency); // selector?
  const mintedCurrency = getCurrencyShortLabel(mintedCurrencySymbol);
  const mintedCurrencyAmountUsd = conversionTotal * currencyUsdRate;
  // TODO: resolve dynamically
  const targetNetworkLabel = getChainShortLabel(chain);

  const MintedCurrencyIcon = useMemo(
    () => getCurrencyGreyIcon(mintedCurrencySymbol),
    [mintedCurrencySymbol]
  );

  const [ackChecked, setAckChecked] = useState(false);
  const [touched, setTouched] = useState(false);

  const handlePreviousStepClick = useCallback(() => {
    dispatch(setFlowStep(FlowStep.INITIAL));
  }, [dispatch]);
  const handleAckCheckboxChange = useCallback((event) => {
    setTouched(true);
    setAckChecked(event.target.checked);
  }, []);

  const { status } = useSelectedChainWallet();

  const tx = useMemo(
    () =>
      createMintTransaction({
        amount: amount,
        currency: currency,
        destAddress: account,
        mintedCurrency: getMintedDestinationCurrencySymbol(currency),
        mintedCurrencyChain: chain,
        userAddress: account,
      }),
    [amount, currency, account, chain]
  );
  const handleConfirm = useCallback(() => {
    if (status === "connected") {
      setTouched(true);
      if (ackChecked && preValidateMintTransaction(tx)) {
        dispatch(addTransaction(tx));
        dispatch(setFlowStep(FlowStep.DEPOSIT));

        const serializedTx = JSON.stringify(tx);
        history.push({ search: queryString.stringify({ tx: serializedTx }) });
      }
    } else {
      setTouched(false);
      dispatch(setWalletPickerOpened(true));
    }
  }, [dispatch, history, ackChecked, status, tx]);

  const showAckError = !ackChecked && touched;

  return (
    <>
      <PaperHeader>
        <PaperNav>
          <IconButton onClick={handlePreviousStepClick}>
            <BackArrowIcon />
          </IconButton>
        </PaperNav>
        <PaperTitle>Fees & Confirm</PaperTitle>
        <PaperActions />
      </PaperHeader>
      <PaperContent bottomPadding>
        <BigAssetAmountWrapper>
          <BigAssetAmount
            value={<NumberFormatText value={amount} spacedSuffix={currency} />}
          />
        </BigAssetAmountWrapper>
        <Typography variant="body1" gutterBottom>
          Details
        </Typography>
        <LabelWithValue
          label="Sending"
          labelTooltip={tooltips.sending}
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
        <LabelWithValue
          label="To"
          labelTooltip={tooltips.to}
          value={targetNetworkLabel}
        />
        <SpacedDivider />
        <Typography variant="body1" gutterBottom>
          Fees
        </Typography>
        <MintFees />
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <AssetInfo
          label="Receiving"
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
        <CheckboxWrapper>
          <FormControl error={showAckError}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={ackChecked}
                  onChange={handleAckCheckboxChange}
                  name="ack"
                  color="primary"
                />
              }
              label={
                <FormLabel htmlFor="ack" component={Typography}>
                  <Typography
                    variant="caption"
                    color={showAckError ? "inherit" : "textPrimary"}
                  >
                    I acknowledge this transaction requires ETH{" "}
                    <TooltipWithIcon title={tooltips.acknowledge} />
                  </Typography>
                </FormLabel>
              }
            />
          </FormControl>
        </CheckboxWrapper>
        <ActionButtonWrapper>
          <ActionButton onClick={handleConfirm} disabled={showAckError}>
            {status !== "connected" ? "Connect Wallet" : "Confirm"}
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
      <Debug it={{ tx }} />
    </>
  );
};

export const MintFees: FunctionComponent = () => {
  useGasPrices();
  const { currency } = useSelector($mint);

  const currencyUsdRate = useSelector($mintCurrencyUsdRate);
  const ethUsdRate = useSelector($ethUsdExchangeRate);
  const amountUsd = useSelector($mintCurrencyUsdAmount);
  // considear caluclating everything in $mintFees selector
  const { renVMFee, renVMFeeAmount, networkFee } = useSelector($mintFees);
  const gasPrices = useSelector($gasPrices);
  const renVMFeeAmountUsd = amountUsd * renVMFee;
  const networkFeeUsd = networkFee * currencyUsdRate;

  const tooltips = useMemo(() => getFeeTooltips(renVMFee, 0.001), [renVMFee]); // TODO: CRIT: add release fee from selectors

  const feeInGwei = Math.ceil(MINT_GAS_UNIT_COST * gasPrices.standard);
  const targetNetworkFeeUsd = fromGwei(feeInGwei) * ethUsdRate;
  const targetNetworkFeeLabel = `${feeInGwei} Gwei`;

  return (
    <>
      <LabelWithValue
        label="RenVM Fee"
        labelTooltip={tooltips.renVmFee}
        value={
          <NumberFormatText value={renVMFeeAmount} spacedSuffix={currency} />
        }
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
        labelTooltip={tooltips.bitcoinMinerFee}
        value={<NumberFormatText value={networkFee} spacedSuffix={currency} />}
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
        labelTooltip={tooltips.estimatedEthFee}
        value={targetNetworkFeeLabel}
        valueEquivalent={
          <NumberFormatText
            value={targetNetworkFeeUsd}
            prefix="$"
            decimalScale={2}
            fixedDecimalScale
          />
        }
      />
    </>
  );
};
