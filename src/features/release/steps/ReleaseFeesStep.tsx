import { Divider, IconButton, Typography } from '@material-ui/core'
import React, { FunctionComponent, useCallback, useMemo, useState, } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { ActionButton, ActionButtonWrapper, } from '../../../components/buttons/Buttons'
import { NumberFormatText } from '../../../components/formatting/NumberFormatText'
import { BackArrowIcon } from '../../../components/icons/RenIcons'
import { PaperActions, PaperContent, PaperHeader, PaperNav, PaperTitle, } from '../../../components/layout/Paper'
import { CenteredProgress } from '../../../components/progress/ProgressHelpers'
import {
  AssetInfo,
  BigAssetAmount,
  BigAssetAmountWrapper,
  LabelWithValue,
  SpacedDivider,
} from '../../../components/typography/TypographyHelpers'
import { WalletStatus } from '../../../components/utils/types'
import { paths } from '../../../pages/routes'
import { useSelectedChainWallet } from '../../../providers/multiwallet/multiwalletHooks'
import { getCurrencyConfig, toReleasedCurrency, } from '../../../utils/assetConfigs'
import { $exchangeRates } from '../../marketData/marketDataSlice'
import { findExchangeRate, USD_SYMBOL } from '../../marketData/marketDataUtils'
import { getTransactionFees, useFetchFees } from '../../renData/renDataUtils'
import { TransactionFees } from '../../transactions/components/TransactionFees'
import {
  createTxQueryString,
  LocationTxState,
  TxConfigurationStepProps,
  TxType,
} from '../../transactions/transactionsUtils'
import { setWalletPickerOpened } from '../../wallet/walletSlice'
import { BurnAndReleaseTransactionInitializer, releaseTooltips, } from '../components/ReleaseHelpers'
import { $release, $releaseUsdAmount } from '../releaseSlice'
import { createReleaseTransaction, preValidateReleaseTransaction, } from '../releaseUtils'

export const ReleaseFeesStep: FunctionComponent<TxConfigurationStepProps> = ({
  onPrev,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { status, account } = useSelectedChainWallet();
  const walletConnected = status === WalletStatus.CONNECTED;
  const [releasingInitialized, setReleasingInitialized] = useState(false);
  const { amount, currency, address } = useSelector($release);
  const amountUsd = useSelector($releaseUsdAmount);
  const rates = useSelector($exchangeRates);
  const { fees, pending } = useFetchFees(currency, TxType.BURN);
  const { conversionTotal } = getTransactionFees({
    amount,
    fees,
    type: TxType.BURN,
  });

  const currencyConfig = getCurrencyConfig(currency);
  const destinationCurrency = toReleasedCurrency(currency);
  const destinationCurrencyUsdRate = findExchangeRate(
    rates,
    destinationCurrency,
    USD_SYMBOL
  );
  const destinationAmountUsd = conversionTotal * destinationCurrencyUsdRate;
  const destinationCurrencyConfig = getCurrencyConfig(destinationCurrency);
  const { MainIcon } = destinationCurrencyConfig;
  const tx = useMemo(
    () =>
      createReleaseTransaction({
        amount: amount,
        currency: currency,
        destAddress: address,
        userAddress: account,
      }),
    [amount, currency, address, account]
  );
  const canInitializeReleasing = preValidateReleaseTransaction(tx);

  const handleConfirm = useCallback(() => {
    setReleasingInitialized(true);
    if (walletConnected) {
      if (canInitializeReleasing) {
        setReleasingInitialized(true);
      } else {
        setReleasingInitialized(false);
      }
    } else {
      setReleasingInitialized(false);
      dispatch(setWalletPickerOpened(true));
    }
  }, [dispatch, canInitializeReleasing, walletConnected]);

  const onBurnTxCreated = useCallback(
    (tx) => {
      console.log("onReleaseTxCreated");
      history.push({
        pathname: paths.RELEASE_TRANSACTION,
        search: "?" + createTxQueryString(tx),
        state: {
          txState: { newTx: true },
        } as LocationTxState,
      });
    },
    [history]
  );

  return (
    <>
      {releasingInitialized && (
        <BurnAndReleaseTransactionInitializer
          initialTx={tx}
          onCreated={onBurnTxCreated}
        />
      )}
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
            value={
              <NumberFormatText
                value={amount}
                spacedSuffix={currencyConfig.short}
              />
            }
          />
        </BigAssetAmountWrapper>
        <Typography variant="body1" gutterBottom>
          Details
        </Typography>
        <LabelWithValue
          label="Releasing"
          labelTooltip={releaseTooltips.releasing}
          value={
            <NumberFormatText
              value={amount}
              spacedSuffix={currencyConfig.short}
            />
          }
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
          labelTooltip={releaseTooltips.to}
          value={address}
        />
        <SpacedDivider />
        <Typography variant="body1" gutterBottom>
          Fees
        </Typography>
        <TransactionFees
          amount={amount}
          currency={currency}
          type={TxType.BURN}
        />
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        {walletConnected &&
          (pending ? (
            <CenteredProgress />
          ) : (
            <AssetInfo
              label="Receiving"
              value={
                <NumberFormatText
                  value={conversionTotal}
                  spacedSuffix={destinationCurrencyConfig.short}
                />
              }
              valueEquivalent={
                <NumberFormatText
                  prefix=" = $"
                  value={destinationAmountUsd}
                  spacedSuffix="USD"
                  decimalScale={2}
                  fixedDecimalScale
                />
              }
              Icon={<MainIcon fontSize="inherit" />}
            />
          ))}
        <ActionButtonWrapper>
          <ActionButton onClick={handleConfirm} disabled={releasingInitialized}>
            {!walletConnected
              ? "Connect Wallet"
              : releasingInitialized
              ? "Confirming..."
              : "Confirm"}
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </>
  );
};
