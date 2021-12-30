import {
  Box,
  Checkbox,
  Divider,
  Fade,
  FormControlLabel,
  IconButton,
  Typography,
} from "@material-ui/core";
import React, { FunctionComponent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { BackArrowIcon } from "../../../components/icons/RenIcons";
import { OutlinedTextField } from "../../../components/inputs/OutlinedTextField";
import {
  HorizontalPadder,
  MediumTopWrapper,
} from "../../../components/layout/LayoutHelpers";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import { InlineSkeleton } from "../../../components/progress/ProgressHelpers";
import { TooltipWithIcon } from "../../../components/tooltips/TooltipWithIcon";
import {
  AssetInfo,
  LabelWithValue,
} from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { getAssetConfig, getRenAssetName } from "../../../utils/tokensConfig";
import { $network } from "../../network/networkSlice";
import { useWallet } from "../../wallet/walletHooks";
import { GatewayFees } from "../components/GatewayFees";
import { useGateway, useGatewayFeesWithRates } from "../gatewayHooks";
import { $gateway } from "../gatewaySlice";
import { GatewayStepProps } from "./stepUtils";

export const GatewayFeesStep: FunctionComponent<GatewayStepProps> = ({
  onNext,
  onPrev,
}) => {
  const { t } = useTranslation();
  const { network } = useSelector($network);
  const { asset, from, to } = useSelector($gateway);
  const { Icon, shortName } = getAssetConfig(asset);
  const renAsset = getRenAssetName(asset);

  const [amount, setAmount] = useState("42");
  const handleAmountChange = useCallback((event) => {
    const newValue = event.target.value.replace(",", ".");
    if (!isNaN(newValue)) {
      setAmount(newValue);
    }
  }, []);

  const { connected } = useWallet(to);

  const { gateway } = useGateway({
    asset,
    from,
    to,
    amount,
    network,
    nonce: 1,
  });

  const fees = useGatewayFeesWithRates(gateway, amount);
  const {
    balance,
    balancePending,
    outputAmount,
    outputAmountUsd,
    fromChainFeeAsset,
    toChainFeeAsset,
  } = fees;
  console.log("gateway setup", gateway?.setup);

  const approvalRequired = Boolean(gateway?.setup.approval);
  const approved = false;

  const [approvalChecked, setApprovalChecked] = useState(false);
  const handleApprovalChange = useCallback(() => {
    setApprovalChecked(!approvalChecked);
  }, [approvalChecked]);

  const [ackChecked, setAckChecked] = useState(false);
  const handleAckChange = useCallback(() => {
    setAckChecked(!ackChecked);
  }, [ackChecked]);

  // TODO: crit finish
  const isH2H = false;
  const isMint = true;
  const feeTokens = isH2H
    ? [fromChainFeeAsset, toChainFeeAsset]
    : isMint
    ? [toChainFeeAsset]
    : [fromChainFeeAsset];

  const Header = (
    <PaperHeader>
      <PaperNav>
        <IconButton onClick={onPrev}>
          <BackArrowIcon />
        </IconButton>
      </PaperNav>
      <PaperTitle>{t("mint.fees-title")}</PaperTitle>
      <PaperActions />
    </PaperHeader>
  );
  if (!connected) {
    return (
      <>
        {Header}
        <PaperContent bottomPadding>
          <span>Please connect a wallet to proceed</span>
        </PaperContent>
      </>
    );
  }

  const showBalance = true;

  return (
    <>
      {Header}
      <PaperContent bottomPadding>
        {showBalance && (
          <HorizontalPadder>
            <LabelWithValue
              label={t("common.balance-label")}
              value={
                <span>
                  {balancePending ? (
                    <InlineSkeleton
                      variant="rect"
                      animation="pulse"
                      width={40}
                      height={12}
                    />
                  ) : (
                    <Fade in={true}>
                      <span>{balance}</span>
                    </Fade>
                  )}
                  <span> {renAsset}</span>
                </span>
              }
            />
          </HorizontalPadder>
        )}
        <OutlinedTextField
          value={amount}
          onChange={handleAmountChange}
          label="How much will you send?"
          InputProps={{ endAdornment: shortName }}
        />
        <MediumTopWrapper>
          <AssetInfo
            label={t("common.receiving-label")}
            value={
              <NumberFormatText
                value={outputAmount}
                spacedSuffix={renAsset}
                decimalScale={3} // TODO: make dynamic decimal scale based on input decimals
              />
            }
            valueEquivalent={
              outputAmountUsd !== null ? (
                <NumberFormatText
                  prefix=" = $"
                  value={outputAmountUsd}
                  spacedSuffix="USD"
                  decimalScale={2}
                  fixedDecimalScale
                />
              ) : null
            }
            Icon={<Icon fontSize="inherit" />}
          />
        </MediumTopWrapper>
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <Typography variant="body2" paragraph>
          {t("fees.fees-label")}
        </Typography>
        <GatewayFees
          {...fees}
          asset={asset}
          from={from}
          to={to}
          approval={approvalRequired}
          approved={approved}
        />
        <HorizontalPadder>
          <FormControlLabel
            checked={ackChecked}
            onChange={handleAckChange}
            control={<Checkbox name="ack" color="primary" />}
            label={
              <>
                <span>
                  {t("fees.tokens-ack-label", {
                    tokens: feeTokens.join(" & "),
                  })}{" "}
                </span>
                <TooltipWithIcon title={t("fees.tokens-ack-tooltip")} />
              </>
            }
          />
          <FormControlLabel
            checked={approvalChecked}
            onChange={handleApprovalChange}
            control={<Checkbox name="approval" color="primary" />}
            label={
              <>
                <span>{t("fees.approval-label")} </span>
                <TooltipWithIcon title={t("fees.approval-tooltip")} />
              </>
            }
          />
        </HorizontalPadder>
      </PaperContent>
      <Debug it={{ fees }} />
    </>
  );
};
