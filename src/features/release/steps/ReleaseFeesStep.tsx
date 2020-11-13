import { Divider, IconButton, Typography, } from '@material-ui/core'
import React, { FunctionComponent } from 'react'
import { useSelector } from 'react-redux'
import { NumberFormatText } from '../../../components/formatting/NumberFormatText'
import { BackArrowIcon } from '../../../components/icons/RenIcons'
import { PaperActions, PaperContent, PaperHeader, PaperNav, PaperTitle, } from '../../../components/layout/Paper'
import {
  BigAssetAmount,
  BigAssetAmountWrapper,
  LabelWithValue,
  SpacedDivider,
} from '../../../components/typography/TypographyHelpers'
import { getChainConfig, getCurrencyConfig, getReleasedDestinationCurrencySymbol, } from '../../../utils/assetConfigs'
import { mintTooltips } from '../../mint/components/MintHelpers'
import { TransactionFees } from '../../transactions/components/TransactionFees'
import { TxConfigurationStepProps, TxType } from '../../transactions/transactionsUtils'
import { $release, $releaseUsdAmount } from '../releaseSlice'

export const ReleaseFeesStep: FunctionComponent<TxConfigurationStepProps> = ({
  onPrev,
}) => {
  const { amount, currency } = useSelector($release);
  const amountUsd = useSelector($releaseUsdAmount);
  const targetCurrency = getReleasedDestinationCurrencySymbol(currency);
  const currencyConfig = getCurrencyConfig(currency);
  const targetCurrencyConfig = getCurrencyConfig(targetCurrency);
  const targetChainConfig = getChainConfig(targetCurrencyConfig.sourceChain);
  const nextEnabled = true; //TODO

  return (
    <>
      <PaperHeader>
        <PaperNav>
          <IconButton onClick={onPrev}>
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
          labelTooltip={mintTooltips.sending}
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
          labelTooltip={mintTooltips.to}
          value={targetChainConfig.full}
        />
        <SpacedDivider />
        <Typography variant="body1" gutterBottom>
          Fees
        </Typography>
        <TransactionFees amount={amount} currency={currency} type={TxType.BURN}/>
      </PaperContent>
      <Divider />
      {/*<PaperContent topPadding bottomPadding>*/}
      {/*  <AssetInfo*/}
      {/*    label="Receiving"*/}
      {/*    value={*/}
      {/*      <NumberFormatText*/}
      {/*        value={conversionTotal}*/}
      {/*        spacedSuffix={destinationCurrencyConfig.short}*/}
      {/*        decimalScale={3}*/}
      {/*      />*/}
      {/*    }*/}
      {/*    valueEquivalent={*/}
      {/*      <NumberFormatText*/}
      {/*        prefix=" = $"*/}
      {/*        value={targetCurrencyAmountUsd}*/}
      {/*        spacedSuffix="USD"*/}
      {/*        decimalScale={2}*/}
      {/*        fixedDecimalScale*/}
      {/*      />*/}
      {/*    }*/}
      {/*    Icon={<MintedCurrencyIcon fontSize="inherit" />}*/}
      {/*  />*/}
      {/*  <CheckboxWrapper>*/}
      {/*    <FormControl error={showAckError}>*/}
      {/*      <FormControlLabel*/}
      {/*        control={*/}
      {/*          <Checkbox*/}
      {/*            checked={ackChecked}*/}
      {/*            onChange={handleAckCheckboxChange}*/}
      {/*            name="ack"*/}
      {/*            color="primary"*/}
      {/*          />*/}
      {/*        }*/}
      {/*        label={*/}
      {/*          <FormLabel htmlFor="ack" component={Typography}>*/}
      {/*            <Typography*/}
      {/*              variant="caption"*/}
      {/*              color={showAckError ? "inherit" : "textPrimary"}*/}
      {/*            >*/}
      {/*              I acknowledge this transaction requires ETH{" "}*/}
      {/*              <TooltipWithIcon title={mintTooltips.acknowledge} />*/}
      {/*            </Typography>*/}
      {/*          </FormLabel>*/}
      {/*        }*/}
      {/*      />*/}
      {/*    </FormControl>*/}
      {/*  </CheckboxWrapper>*/}
      {/*  <ActionButtonWrapper>*/}
      {/*    <ActionButton*/}
      {/*      onClick={handleConfirm}*/}
      {/*      disabled={showAckError || mintingInitialized}*/}
      {/*    >*/}
      {/*      {status !== "connected"*/}
      {/*        ? "Connect Wallet"*/}
      {/*        : mintingInitialized*/}
      {/*        ? "Confirming..."*/}
      {/*        : "Confirm"}*/}
      {/*    </ActionButton>*/}
      {/*  </ActionButtonWrapper>*/}
      {/*</PaperContent>*/}
    </>
  );
};
