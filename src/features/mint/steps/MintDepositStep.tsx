import { Divider, IconButton } from "@material-ui/core";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CopyContentButton } from "../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { BackArrowIcon } from "../../../components/icons/RenIcons";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import {
  BigAssetAmount,
  BigAssetAmountWrapper,
  LabelWithValue,
} from "../../../components/typography/TypographyHelpers";
import { MINT_GAS_UNIT_COST } from "../../../constants/constants";
import { getCurrencyShortLabel } from "../../../utils/assetConfigs";
import { fromGwei, toPercent } from "../../../utils/converters";
import { setFlowStep } from "../../flow/flowSlice";
import { FlowStep } from "../../flow/flowTypes";
import { useGasPrices } from "../../marketData/marketDataHooks";
import {
  $ethUsdExchangeRate,
  $gasPrices,
} from "../../marketData/marketDataSlice";
import { getTooltips } from "../components/MintHelpers";
import {
  $mint,
  $mintCurrencyUsdAmount,
  $mintCurrencyUsdRate,
  $mintFees,
} from "../mintSlice";

export const MintDepositStep: FunctionComponent = () => {
  useGasPrices();
  const dispatch = useDispatch();
  const { amount, currency } = useSelector($mint);
  const currencyUsdRate = useSelector($mintCurrencyUsdRate);
  const ethUsdRate = useSelector($ethUsdExchangeRate);
  const amountUsd = useSelector($mintCurrencyUsdAmount);
  const { renVMFee, renVMFeeAmount, networkFee } = useSelector($mintFees);
  const gasPrices = useSelector($gasPrices);
  const renVMFeeAmountUsd = amountUsd * renVMFee;
  const networkFeeUsd = networkFee * currencyUsdRate;

  const tooltips = useMemo(() => getTooltips(renVMFee, 0.001), [renVMFee]); // TODO: CRIT: add release fee from selectors

  const handlePreviousStepClick = useCallback(() => {
    dispatch(setFlowStep(FlowStep.FEES));
  }, [dispatch]);

  const feeInGwei = Math.ceil(MINT_GAS_UNIT_COST * gasPrices.standard);
  const targetNetworkFeeUsd = fromGwei(feeInGwei) * ethUsdRate;
  const targetNetworkFeeLabel = `${feeInGwei} Gwei`;

  const gatewayAddress = "1LU14szcGuMwxVNet1rm"; // TODO: connect

  return (
    <>
      <PaperHeader>
        <PaperNav>
          <IconButton onClick={handlePreviousStepClick}>
            <BackArrowIcon />
          </IconButton>
        </PaperNav>
        <PaperTitle>Send {getCurrencyShortLabel(currency)}</PaperTitle>
        <PaperActions />
      </PaperHeader>
      <PaperContent bottomPadding>
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
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
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
    </>
  );
};
