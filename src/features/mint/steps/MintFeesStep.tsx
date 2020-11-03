import {
  Checkbox,
  Divider,
  FormControlLabel,
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
import { MINT_GAS_UNIT_COST } from "../../../constants/constants";
import { useWallet } from "../../../providers/multiwallet/multiwalletHooks";
import { getMintedCurrencySymbol } from "../../../providers/multiwallet/multiwalletUtils";
import { fromGwei, toPercent } from "../../../utils/converters";
import { getCurrencyShortLabel } from "../../../utils/assetConfigs";
import { setFlowStep } from "../../flow/flowSlice";
import { FlowStep } from "../../flow/flowTypes";
import { useGasPrices } from "../../marketData/marketDataHooks";
import {
  $ethUsdExchangeRate,
  $gasPrices,
} from "../../marketData/marketDataSlice";
import {
  $multiwalletChain,
  setWalletPickerOpened,
} from "../../wallet/walletSlice";
import {
  $mint,
  $mintCurrencyUsdAmount,
  $mintCurrencyUsdRate,
  $mintFees,
} from "../mintSlice";

const getTooltips = (mintFee: number, releaseFee: number) => ({
  sending: "The amount and asset you’re sending before fees are applied.",
  to: "The blockchain you’re sending the asset to.",
  renVmFee: `RenVM takes a ${toPercent(
    mintFee
  )}% fee per mint transaction and ${toPercent(
    releaseFee
  )}% per burn transaction. This is shared evenly between all active nodes in the decentralized network.`,
  bitcoinMinerFee:
    "The fee required by BTC miners, to move BTC. This does not go RenVM or the Ren team.",
  estimatedEthFee:
    "The estimated cost to perform a transaction on the Ethereum network. This fee goes to Ethereum miners and is paid in ETH.",
  acknowledge:
    "Minting an asset on Ethereum requires you to submit a transaction. It will cost you a small amount of ETH.",
});

export const MintFeesStep: FunctionComponent = () => {
  useGasPrices();
  const dispatch = useDispatch();
  const { amount, currency } = useSelector($mint);
  const currencyUsdRate = useSelector($mintCurrencyUsdRate);
  const ethUsdRate = useSelector($ethUsdExchangeRate);
  const amountUsd = useSelector($mintCurrencyUsdAmount);
  const { renVMFee, renVMFeeAmount, conversionTotal, networkFee } = useSelector(
    $mintFees
  );
  const gasPrices = useSelector($gasPrices);
  const renVMFeeAmountUsd = amountUsd * renVMFee;
  const mintedCurrencySymbol = getMintedCurrencySymbol(currency); // selector?
  const mintedCurrency = getCurrencyShortLabel(mintedCurrencySymbol);
  const mintedCurrencyAmountUsd = conversionTotal * currencyUsdRate;
  const networkFeeUsd = networkFee * currencyUsdRate;
  // TODO: resolve dynamically
  const targetNetworkLabel = "Ethereum";

  const MintedCurrencyIcon = useMemo(
    () => getCurrencyGreyIcon(mintedCurrencySymbol),
    [mintedCurrencySymbol]
  );
  const tooltips = useMemo(() => getTooltips(renVMFee, 0.001), [renVMFee]); // TODO: CRIT: add release fee from selectors

  const [ackChecked, setAckChecked] = useState(false);

  const handlePreviousStepClick = useCallback(() => {
    dispatch(setFlowStep(FlowStep.INITIAL));
  }, [dispatch]);
  const handleAckCheckboxChange = useCallback((event) => {
    setAckChecked(event.target.checked);
  }, []);

  const feeInGwei = Math.ceil(MINT_GAS_UNIT_COST * gasPrices.standard);
  const targetNetworkFeeUsd = fromGwei(feeInGwei) * ethUsdRate;
  const targetNetworkFeeLabel = `${feeInGwei} Gwei`;

  const multiwalletChain = useSelector($multiwalletChain);
  const { status } = useWallet(multiwalletChain);
  const nextEnabled = ackChecked && amount > 0;

  const handleConfirm = useCallback(() => {
    if (status === "connected") {
      // dispatch(setFlowStep())
    } else {
      dispatch(setWalletPickerOpened(true));
    }
  }, [dispatch, status]);
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
          <FormControlLabel
            control={
              <Checkbox
                checked={ackChecked}
                onChange={handleAckCheckboxChange}
                name="primary"
                color="primary"
              />
            }
            label={
              <Typography variant="caption">
                I acknowledge this transaction requires ETH{" "}
                <TooltipWithIcon title={tooltips.acknowledge} />
              </Typography>
            }
          />
        </CheckboxWrapper>
        <ActionButtonWrapper>
          <ActionButton onClick={handleConfirm} disabled={!nextEnabled}>
            Confirm {status !== "connected" && "& Connect Wallet"}
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </>
  );
};
