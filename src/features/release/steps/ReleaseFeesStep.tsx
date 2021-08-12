import { Divider, IconButton, Typography } from "@material-ui/core";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { BackArrowIcon } from "../../../components/icons/RenIcons";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import { CenteredProgress } from "../../../components/progress/ProgressHelpers";
import {
  AssetInfo,
  BigAssetAmount,
  BigAssetAmountWrapper,
  LabelWithValue,
  MiddleEllipsisText,
  SpacedDivider,
} from "../../../components/typography/TypographyHelpers";
import { paths } from "../../../pages/routes";
import {
  BridgeCurrency,
  getChainConfig,
  getCurrencyConfig,
  getNativeCurrency,
  toReleasedCurrency,
} from "../../../utils/assetConfigs";
import { useFetchFees } from "../../fees/feesHooks";
import { getTransactionFees } from "../../fees/feesUtils";
import { $exchangeRates } from "../../marketData/marketDataSlice";
import { findExchangeRate, USD_SYMBOL } from "../../marketData/marketDataUtils";
import { $renNetwork } from "../../network/networkSlice";
import { TransactionFees } from "../../transactions/components/TransactionFees";
import {
  createTxQueryString,
  getReleaseAssetDecimals,
  LocationTxState,
  TxConfigurationStepProps,
  TxType,
} from "../../transactions/transactionsUtils";
import { useSelectedChainWallet } from "../../wallet/walletHooks";
import {
  $multiwalletChain,
  $wallet,
  setWalletPickerOpened,
} from "../../wallet/walletSlice";
import { releaseTooltips } from "../components/ReleaseHelpers";
import { $release, $releaseUsdAmount } from "../releaseSlice";
import {
  createReleaseTransaction,
  preValidateReleaseTransaction,
} from "../releaseUtils";

export const ReleaseFeesStep: FunctionComponent<TxConfigurationStepProps> = ({
  onPrev,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { account, walletConnected } = useSelectedChainWallet();
  const [releasingInitialized, setReleasingInitialized] = useState(false);
  const { amount, currency, address } = useSelector($release);
  const network = useSelector($renNetwork);
  const { chain } = useSelector($wallet);
  const renChain = useSelector($multiwalletChain);
  const amountUsd = useSelector($releaseUsdAmount);
  const rates = useSelector($exchangeRates);
  const { fees, pending } = useFetchFees(currency, TxType.BURN);

  const destinationCurrency = toReleasedCurrency(currency);
  const currencyConfig = getCurrencyConfig(currency);
  const nativeCurrencyConfig = getCurrencyConfig(getNativeCurrency(currency));

  const targetChainConfig = getChainConfig(chain);
  console.log(currency, targetChainConfig.nativeCurrency);
  const decimals =
    targetChainConfig.nativeCurrency === currency
      ? getReleaseAssetDecimals(
          targetChainConfig.symbol,
          targetChainConfig.nativeCurrency
        )
      : getReleaseAssetDecimals(
          nativeCurrencyConfig.sourceChain,
          nativeCurrencyConfig.symbol
        );

  const { conversionTotal } = getTransactionFees({
    amount,
    fees,
    type: TxType.BURN,
    decimals,
  });

  const chainConfig = getChainConfig(chain);
  const destinationCurrencyUsdRate = findExchangeRate(
    rates,
    destinationCurrency,
    USD_SYMBOL
  );

  const conversionFormatted = conversionTotal;

  const destinationAmountUsd = conversionFormatted * destinationCurrencyUsdRate;
  const destinationCurrencyConfig = getCurrencyConfig(destinationCurrency);
  const { MainIcon } = destinationCurrencyConfig;
  const tx = useMemo(
    () =>
      createReleaseTransaction({
        amount: amount,
        currency: currency,
        destAddress: address,
        userAddress: account,
        sourceChain: renChain,
        network: network,
      }),
    [amount, currency, address, account, renChain, network]
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

  const onReleaseTxCreated = useCallback(
    (tx) => {
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

  useEffect(() => {
    if (releasingInitialized) {
      onReleaseTxCreated(tx);
    }
  }, [onReleaseTxCreated, releasingInitialized, tx]);

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
          label="From"
          labelTooltip={releaseTooltips.from}
          value={chainConfig.full}
        />
        <LabelWithValue
          label="To"
          labelTooltip={releaseTooltips.to}
          value={<MiddleEllipsisText hoverable>{address}</MiddleEllipsisText>}
        />
        <SpacedDivider />
        <Typography variant="body1" gutterBottom>
          Fees
        </Typography>
        <TransactionFees
          chain={chain}
          amount={amount}
          currency={currency}
          type={TxType.BURN}
        />
      </PaperContent>
      <Divider />
      <PaperContent darker topPadding bottomPadding>
        {walletConnected &&
          (pending ? (
            <CenteredProgress />
          ) : (
            <AssetInfo
              label="Receiving"
              value={
                <NumberFormatText
                  value={conversionFormatted}
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
