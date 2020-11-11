import {
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Typography,
} from "@material-ui/core";
import React, {
  FunctionComponent,
  useCallback,
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
import { getCurrencyGreyIcon } from "../../../components/icons/IconHelpers";
import { BackArrowIcon } from "../../../components/icons/RenIcons";
import { CheckboxWrapper } from "../../../components/inputs/InputHelpers";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import { TooltipWithIcon } from "../../../components/tooltips/TooltipWithIcon";
import {
  AssetInfo,
  BigAssetAmount,
  BigAssetAmountWrapper,
  LabelWithValue,
  SpacedDivider,
} from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { BridgeCurrency, WalletStatus } from "../../../components/utils/types";
import { MINT_GAS_UNIT_COST } from "../../../constants/constants";
import { paths } from "../../../pages/routes";
import { useSelectedChainWallet } from "../../../providers/multiwallet/multiwalletHooks";
import { getMintedDestinationCurrencySymbol } from "../../../providers/multiwallet/multiwalletUtils";
import {
  getChainShortLabel,
  getCurrencyConfig,
} from "../../../utils/assetConfigs";
import { fromGwei } from "../../../utils/converters";
import { useGasPrices } from "../../marketData/marketDataHooks";
import { $exchangeRates, $gasPrices } from "../../marketData/marketDataSlice";
import { findExchangeRate } from "../../marketData/marketDataUtils";
import { $fees } from "../../renData/renDataSlice";
import { calculateMintFees } from "../../renData/renDataUtils";
import {
  createTxQueryString,
  LocationTxState,
  TxConfigurationStepProps,
} from "../../transactions/transactionsUtils";
import { $wallet, setWalletPickerOpened } from "../../wallet/walletSlice";
import {
  getFeeTooltips,
  MintTransactionInitializer,
  tooltips,
} from "../components/MintHelpers";
import { $mint } from "../mintSlice";
import {
  createMintTransaction,
  preValidateMintTransaction,
} from "../mintUtils";

export const MintFeesStep: FunctionComponent<TxConfigurationStepProps> = ({
  onPrev,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [initializeMinting, setInitializeMinting] = useState(false);
  const { amount, currency } = useSelector($mint);
  const { chain } = useSelector($wallet);
  const { account } = useSelectedChainWallet();
  const exchangeRates = useSelector($exchangeRates);
  const fees = useSelector($fees);
  const currencyUsdRate = findExchangeRate(exchangeRates, currency, "USD");

  const amountUsd = amount * currencyUsdRate;
  const { conversionTotal } = calculateMintFees(amount, currency, fees);

  const currencyConfig = getCurrencyConfig(currency);
  const targetCurrencyAmountUsd = conversionTotal * currencyUsdRate;

  const targetNetworkLabel = getChainShortLabel(chain);
  const destinationCurrency = getMintedDestinationCurrencySymbol(currency);
  const destinationCurrencyConfig = getCurrencyConfig(destinationCurrency);

  const MintedCurrencyIcon = useMemo(
    () => getCurrencyGreyIcon(currencyConfig.symbol),
    [currencyConfig.symbol]
  );

  const [ackChecked, setAckChecked] = useState(true); // TODO: CRIT: false
  const [touched, setTouched] = useState(false);

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
  const txValid = preValidateMintTransaction(tx);
  const canInitializeMinting = ackChecked && txValid;

  const handleConfirm = useCallback(() => {
    if (status === WalletStatus.CONNECTED) {
      setTouched(true);
      if (canInitializeMinting) {
        setInitializeMinting(true);
      } else {
        setInitializeMinting(false);
      }
    } else {
      setTouched(false);
      setInitializeMinting(false);
      dispatch(setWalletPickerOpened(true));
    }
  }, [dispatch, status, canInitializeMinting]);

  const onMintTxCreated = useCallback(
    (tx) => {
      console.log("onMintTxCreated");
      history.push({
        pathname: paths.MINT_TRANSACTION,
        search: "?" + createTxQueryString(tx),
        state: {
          txState: { newTx: true },
        } as LocationTxState,
      });
    },
    [history]
  );

  const showAckError = !ackChecked && touched;

  return (
    <>
      {initializeMinting && (
        <MintTransactionInitializer
          initialTx={tx}
          onCreated={onMintTxCreated}
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
        <MintFees amount={amount} currency={currency} />
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <AssetInfo
          label="Receiving"
          value={
            <NumberFormatText
              value={conversionTotal}
              spacedSuffix={destinationCurrencyConfig.short}
              decimalScale={3}
            />
          }
          valueEquivalent={
            <NumberFormatText
              prefix=" = $"
              value={targetCurrencyAmountUsd}
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

type MintFeesProps = {
  currency: BridgeCurrency;
  amount: number;
};

export const MintFees: FunctionComponent<MintFeesProps> = ({
  amount,
  currency,
}) => {
  useGasPrices();
  const currencyConfig = getCurrencyConfig(currency);
  const exchangeRates = useSelector($exchangeRates);
  const fees = useSelector($fees);
  const gasPrices = useSelector($gasPrices);
  const currencyUsdRate = findExchangeRate(exchangeRates, currency, "USD");
  const ethUsdRate = findExchangeRate(exchangeRates, BridgeCurrency.ETH, "USD");
  const amountUsd = amount * currencyUsdRate;

  const { renVMFee, renVMFeeAmount, networkFee } = calculateMintFees(
    amount,
    currency,
    fees
  );
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
        label={`${currencyConfig.full} Miner Fee`}
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
