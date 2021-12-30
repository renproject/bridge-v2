import {
  Checkbox,
  Divider,
  Fade,
  FormControlLabel,
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  ChainTransactionStatus,
  TxSubmitter,
  TxWaiter,
} from "@renproject/utils";
import React, { FunctionComponent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
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
import {
  useGateway,
  useGatewayFeesWithRates,
  useGatewayMeta,
} from "../gatewayHooks";
import { $gateway } from "../gatewaySlice";
import { GatewayStepProps } from "./stepUtils";

export const GatewayFeesStep: FunctionComponent<GatewayStepProps> = ({
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

  // TODO: crit finish
  const isH2H = false;

  const { isMint, fromConnectionRequired } = useGatewayMeta(asset, from, to);
  const activeChain = fromConnectionRequired ? from : to;
  const { connected, provider } = useWallet(activeChain);

  const { gateway } = useGateway(
    {
      asset,
      from,
      to,
      amount,
      network,
      nonce: 1,
    },
    provider
  );
  const fees = useGatewayFeesWithRates(gateway, amount);
  const {
    balance,
    balancePending,
    outputAmount,
    outputAmountUsd,
    fromChainFeeAsset,
    toChainFeeAsset,
  } = fees;
  console.log("gateway", gateway);

  const approvalRequired = Boolean(gateway?.setup.approval);
  const [approved, setApproved] = useState(false);

  const [approvalChecked, setApprovalChecked] = useState(false);
  const handleApprovalChange = useCallback(() => {
    setApprovalChecked(!approvalChecked);
  }, [approvalChecked]);

  const [ackChecked, setAckChecked] = useState(false);
  const handleAckChange = useCallback(() => {
    setAckChecked(!ackChecked);
  }, [ackChecked]);

  const feeTokens = isH2H
    ? [fromChainFeeAsset, toChainFeeAsset]
    : isMint
    ? [toChainFeeAsset]
    : [fromChainFeeAsset];

  const nextEnabled = approvalRequired
    ? approvalChecked && ackChecked
    : ackChecked;

  const handleProceed = useCallback(() => {
    if (approved) {
      // serialize tx data and proceed to 3rd step
    } else {
      //approve
    }
    console.log(approved);
  }, [approved]);

  const handleApproved = useCallback(() => {
    setApproved(true);
  }, []);

  const showBalance = true;

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
          {approvalRequired && (
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
          )}
        </HorizontalPadder>
        <ActionButtonWrapper>
          {gateway !== null && approvalRequired && !approved && (
            <TxApprovalButton
              tx={gateway.setup.approval}
              onDone={handleApproved}
            />
          )}
          {approved || !approvalRequired ? (
            <ActionButton disabled={!nextEnabled} onClick={handleProceed}>
              {t("gateway.submit-tx-label")}
            </ActionButton>
          ) : null}
        </ActionButtonWrapper>
      </PaperContent>
      <Debug it={{ fees }} />
    </>
  );
};

type TxApprovalButtonProps = {
  tx: TxSubmitter | TxWaiter;
  onDone: () => void;
  target?: number;
  autoSubmit?: boolean;
};

export const TxApprovalButton: FunctionComponent<TxApprovalButtonProps> = ({
  tx,
  onDone,
  target,
  autoSubmit,
}) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(autoSubmit ? true : false);
  const [waiting, setWaiting] = useState(false);
  const [confirmations, setConfirmations] = useState<number>();

  const [errorSubmitting, setErrorSubmitting] = useState<Error>();
  const [errorWaiting, setErrorWaiting] = useState<Error>();

  const wait = useCallback(async () => {
    setErrorSubmitting(undefined);
    setErrorWaiting(undefined);

    try {
      setWaiting(true);
      await tx.wait(target).on("status", (status) => {
        setConfirmations(status.confirmations);
      });
      onDone();
    } catch (error: any) {
      console.error(error);
      setErrorWaiting(error);
    }
    setWaiting(false);
  }, [tx, onDone, target]);

  const submit = useCallback(async () => {
    setErrorSubmitting(undefined);
    setErrorWaiting(undefined);

    if (tx.submit && tx.status.status === ChainTransactionStatus.Ready) {
      try {
        setSubmitting(true);
        await tx.submit({
          txConfig: {
            // gasLimit: 500000,
          },
        });
        wait().catch(console.error);
      } catch (error: any) {
        console.error(error);
        setErrorSubmitting(error);
      }
      setSubmitting(false);
    }
  }, [tx, wait]);

  const disabled = waiting || submitting;

  return (
    <>
      <ActionButton disabled={disabled} onClick={submit}>
        {t("gateway.approve-assets-contracts-label")}
      </ActionButton>
      <Debug it={{ tx, errorSubmitting, errorWaiting, confirmations }} />
    </>
  );
};
