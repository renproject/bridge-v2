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
import { BackArrowIcon } from "../../../components/icons/RenIcons";
import { CheckboxWrapper } from "../../../components/inputs/InputHelpers";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import { CenteredProgress } from "../../../components/progress/ProgressHelpers";
import { TooltipWithIcon } from "../../../components/tooltips/TooltipWithIcon";
import {
  AssetInfo,
  BigAssetAmount,
  BigAssetAmountWrapper,
  LabelWithValue,
  SpacedDivider,
} from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { WalletStatus } from "../../../components/utils/types";
import { paths } from "../../../pages/routes";
import { useSelectedChainWallet } from "../../../providers/multiwallet/multiwalletHooks";
import { db } from "../../../services/database/database";
import { DbMeta } from "../../../services/database/firebase/firebase";
import {
  getChainConfig,
  getCurrencyConfig,
  toMintedCurrency,
} from "../../../utils/assetConfigs";
import { useFetchFees } from "../../fees/feesHooks";
import { getTransactionFees } from "../../fees/feesUtils";
import { $exchangeRates } from "../../marketData/marketDataSlice";
import { findExchangeRate } from "../../marketData/marketDataUtils";
import { $network } from "../../network/networkSlice";
import { TransactionFees } from "../../transactions/components/TransactionFees";
import { addTransaction } from "../../transactions/transactionsSlice";
import {
  createTxQueryString,
  LocationTxState,
  TxConfigurationStepProps,
  TxType,
} from "../../transactions/transactionsUtils";
import { $wallet, setWalletPickerOpened } from "../../wallet/walletSlice";
import {
  getMintDynamicTooltips,
  mintTooltips,
  MintTransactionInitializer,
} from "../components/MintHelpers";
import { $mint } from "../mintSlice";
import {
  createMintTransaction,
  DepositState,
  mintTxStateUpdateSequence,
  preValidateMintTransaction,
} from "../mintUtils";

export const MintFeesStep: FunctionComponent<TxConfigurationStepProps> = ({
  onPrev,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { status, account } = useSelectedChainWallet();
  const walletConnected = status === WalletStatus.CONNECTED;
  const [mintingInitialized, setMintingInitialized] = useState(false);
  const { amount, currency } = useSelector($mint);
  const {
    chain,
    signatures: { signature },
  } = useSelector($wallet);
  const network = useSelector($network);
  const exchangeRates = useSelector($exchangeRates);
  const { fees, pending } = useFetchFees(currency, TxType.MINT);
  const currencyUsdRate = findExchangeRate(exchangeRates, currency);

  const amountUsd = amount * currencyUsdRate;
  const { conversionTotal } = getTransactionFees({
    amount,
    fees,
    type: TxType.MINT,
  });

  const lockCurrencyConfig = getCurrencyConfig(currency);
  const { GreyIcon } = lockCurrencyConfig;

  const targetCurrencyAmountUsd = conversionTotal * currencyUsdRate;
  const destinationChainConfig = getChainConfig(chain);
  const destinationChainNativeCurrencyConfig = getCurrencyConfig(
    destinationChainConfig.nativeCurrency
  );
  const mintDynamicTooltips = getMintDynamicTooltips(
    destinationChainConfig,
    destinationChainNativeCurrencyConfig
  );
  const mintedCurrency = toMintedCurrency(currency);

  const mintedCurrencyConfig = getCurrencyConfig(mintedCurrency);

  const [ackChecked, setAckChecked] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleAckCheckboxChange = useCallback((event) => {
    setTouched(true);
    setAckChecked(event.target.checked);
  }, []);

  const tx = useMemo(
    () =>
      createMintTransaction({
        amount: amount,
        currency: currency,
        destAddress: account,
        mintedCurrency: toMintedCurrency(currency),
        mintedCurrencyChain: chain,
        userAddress: account,
        network: network,
      }),
    [amount, currency, account, chain, network]
  );
  const txValid = preValidateMintTransaction(tx);
  const canInitializeMinting = ackChecked && txValid;

  const handleConfirm = useCallback(() => {
    if (status === WalletStatus.CONNECTED) {
      setTouched(true);
      if (canInitializeMinting) {
        setMintingInitialized(true);
      } else {
        setMintingInitialized(false);
      }
    } else {
      setTouched(false);
      setMintingInitialized(false);
      dispatch(setWalletPickerOpened(true));
    }
  }, [dispatch, status, canInitializeMinting]);

  const onMintTxCreated = useCallback(
    (tx) => {
      console.log("onMintTxCreated");
      const meta: DbMeta = { state: mintTxStateUpdateSequence[0] };
      const dbTx = { ...tx, meta };
      db.addTx(dbTx, account, signature).then(() => {
        dispatch(addTransaction(tx));
        history.push({
          pathname: paths.MINT_TRANSACTION,
          search: "?" + createTxQueryString(tx),
          state: {
            txState: { newTx: true },
          } as LocationTxState,
        });
      });
    },
    [dispatch, history, account, signature]
  );

  const showAckError = !ackChecked && touched;

  return (
    <>
      {mintingInitialized && (
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
          value={destinationChainConfig.short}
        />
        <SpacedDivider />
        <Typography variant="body1" gutterBottom>
          Fees
        </Typography>
        <TransactionFees
          chain={chain}
          amount={amount}
          currency={currency}
          type={TxType.MINT}
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
                  spacedSuffix={mintedCurrencyConfig.short}
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
              Icon={<GreyIcon fontSize="inherit" />}
            />
          ))}
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
                    I acknowledge this transaction requires{" "}
                    {destinationChainNativeCurrencyConfig.short}{" "}
                    <TooltipWithIcon title={mintDynamicTooltips.acknowledge} />
                  </Typography>
                </FormLabel>
              }
            />
          </FormControl>
        </CheckboxWrapper>
        <ActionButtonWrapper>
          <ActionButton
            onClick={handleConfirm}
            disabled={showAckError || mintingInitialized}
          >
            {!walletConnected
              ? "Connect Wallet"
              : mintingInitialized
              ? "Confirming..."
              : "Confirm"}
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
      <Debug it={{ tx }} />
    </>
  );
};
