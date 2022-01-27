import {
  ButtonProps,
  Checkbox,
  Divider,
  Fade,
  FormControlLabel,
  IconButton,
  Typography,
} from "@material-ui/core";
import {
  ChainTransactionStatus,
  ContractChain,
  TxSubmitter,
  TxWaiter,
} from "@renproject/utils";
import React, { FunctionComponent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  ActionButton,
  MultipleActionButtonWrapper,
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
  MiddleEllipsisText,
  SimpleAssetInfo,
} from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { paths } from "../../../pages/routes";
import { decimalImpact } from "../../../utils/numbers";
import { getAssetConfig, getRenAssetName } from "../../../utils/tokensConfig";
import { $network } from "../../network/networkSlice";
import { useWallet } from "../../wallet/walletHooks";
import { GatewayFees } from "../components/GatewayFees";
import {
  useEthereumChainAssetBalance,
  useGateway,
  useGatewayFeesWithRates,
  useGatewayMeta,
} from "../gatewayHooks";
import { $gateway, useSharedGateway } from "../gatewaySlice";
import {
  createGatewayQueryString,
  getGatewayExpiryTime,
  getGatewayNonce,
} from "../gatewayUtils";
import { GatewayStepProps } from "./stepUtils";

export const GatewayFeesStep: FunctionComponent<GatewayStepProps> = ({
  onPrev,
}) => {
  const { t } = useTranslation();
  const { network } = useSelector($network);
  const history = useHistory();

  const { asset, from, to, amount, toAddress } = useSelector($gateway);
  const { Icon, RenIcon, shortName } = getAssetConfig(asset);
  const renAsset = getRenAssetName(asset);

  const [activeAmount, setActiveAmount] = useState(amount);
  const handleAmountChange = useCallback((event) => {
    const newValue = event.target.value.replace(",", ".");
    if (!isNaN(newValue)) {
      setActiveAmount(newValue);
    }
  }, []);

  const { isMint, isRelease, isFromContractChain, isH2H } = useGatewayMeta(
    asset,
    from,
    to
  );
  const activeChain = isFromContractChain ? from : to;
  const { connected, provider } = useWallet(activeChain);

  //why gateway is initialized without amount?
  console.log("amount", activeAmount, activeChain);
  const { gateway } = useGateway(
    {
      asset,
      from,
      to,
      amount: activeAmount,
      network,
      toAddress,
    },
    provider
  );
  const fees = useGatewayFeesWithRates(gateway, activeAmount);
  const { balance } = useEthereumChainAssetBalance(
    isFromContractChain
      ? (gateway?.fromChain as ContractChain)
      : (gateway?.toChain as ContractChain),
    asset
  );
  const { outputAmount, outputAmountUsd, fromChainFeeAsset, toChainFeeAsset } =
    fees;
  console.log("gateway", gateway);

  const approvalRequired = Boolean(gateway?.inSetup.approval);
  const [approved, setApproved] = useState(false);

  const [approvalChecked, setApprovalChecked] = useState(false);
  const handleApprovalChange = useCallback(() => {
    setApprovalChecked(!approvalChecked);
  }, [approvalChecked]);

  const [ackChecked, setAckChecked] = useState(false);
  const handleAckChange = useCallback(() => {
    setAckChecked(!ackChecked);
  }, [ackChecked]);
  const showAck = Boolean(fromChainFeeAsset && toChainFeeAsset);
  const feeAssets = isH2H
    ? [fromChainFeeAsset, toChainFeeAsset]
    : isMint
    ? [toChainFeeAsset]
    : [fromChainFeeAsset];

  const nextEnabled = approvalRequired
    ? approvalChecked && approved && ackChecked
    : ackChecked;

  const handleProceed = useCallback(() => {
    if (isMint) {
      console.log("standard mint");
      history.push({
        pathname: paths.MINT__GATEWAY_STANDARD,
        search:
          "?" +
          createGatewayQueryString(
            {
              asset,
              from,
              to,
              nonce: getGatewayNonce(),
            },
            { expiryTime: getGatewayExpiryTime() }
          ),
      });
    } else if (isRelease) {
      console.log("standard release");
      if (isH2H) {
      } else {
        history.push({
          pathname: paths.RELEASE__GATEWAY_STANDARD,
          search:
            "?" +
            createGatewayQueryString({
              asset,
              from,
              to,
              toAddress,
            }),
        });
      }
    }
  }, [
    history,
    isH2H,
    isMint,
    isRelease,
    asset,
    from,
    to,
    toAddress,
    // gateway,
  ]);

  const [, setSharedGateway] = useSharedGateway();
  const handleApproved = useCallback(() => {
    setApproved(true);
    //store initialized gateway
    setSharedGateway(gateway);
    (window as any).gateway = gateway; // TODO: crit remove // productivity hack
    history.push({
      pathname: paths.MINT__GATEWAY_H2H,
    });
  }, [history, setSharedGateway, gateway]);

  const showBalance = isFromContractChain;

  const AssetIcon = isMint ? RenIcon : Icon;
  const assetLabel = isMint ? renAsset : asset;
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
                  {balance === null ? (
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
                  <span> {asset}</span> {/*/ TODO: differentiate*/}
                </span>
              }
            />
          </HorizontalPadder>
        )}
        {isMint && (
          <OutlinedTextField
            value={activeAmount}
            onChange={handleAmountChange}
            label="How much will you send?"
            InputProps={{ endAdornment: shortName }}
          />
        )}
        {isRelease && (
          <SimpleAssetInfo
            label={t("release.releasing-label")}
            value={amount}
            asset={renAsset}
          />
        )}
        <MediumTopWrapper>
          <AssetInfo
            label={t("common.receiving-label")}
            value={
              <NumberFormatText
                value={outputAmount}
                spacedSuffix={assetLabel}
                decimalScale={decimalImpact(amount)}
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
            Icon={<AssetIcon fontSize="inherit" />}
          />
        </MediumTopWrapper>
        {isRelease && !isH2H && (
          <MediumTopWrapper>
            <HorizontalPadder>
              <LabelWithValue
                label={t("common.to-label")}
                value={
                  <MiddleEllipsisText hoverable>{toAddress}</MiddleEllipsisText>
                }
              />
            </HorizontalPadder>
          </MediumTopWrapper>
        )}
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
          needsApproval={approvalRequired}
          approved={approved}
        />
        <HorizontalPadder>
          {showAck && (
            <FormControlLabel
              checked={ackChecked}
              onChange={handleAckChange}
              disabled={approved}
              control={<Checkbox name="ack" color="primary" />}
              label={
                <>
                  <span>
                    {t("fees.tokens-ack-label", {
                      tokens: feeAssets.join(" & "),
                    })}{" "}
                  </span>
                  <TooltipWithIcon
                    title={
                      <span>
                        {feeAssets.length > 1
                          ? t("fees.native-assets-ack-plural-tooltip", {
                              assets: feeAssets.join(" & "),
                            })
                          : t("fees.native-assets-ack-singular-tooltip", {
                              asset: feeAssets[0],
                            })}
                        <span>
                          {" "}
                          {t("fees.native-assets-ack-supplement-tooltip")}
                        </span>
                      </span>
                    }
                  />
                </>
              }
            />
          )}
          {approvalRequired && (
            <FormControlLabel
              checked={approvalChecked}
              onChange={handleApprovalChange}
              disabled={approved}
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
        <MultipleActionButtonWrapper>
          {gateway !== null && approvalRequired && !approved && (
            <TxApprovalButton
              tx={gateway.inSetup.approval}
              onDone={handleApproved}
              disabled={!(approvalChecked && ackChecked)}
            />
          )}
          {approved || !approvalRequired ? (
            <ActionButton disabled={!nextEnabled} onClick={handleProceed}>
              {isH2H ? t("gateway.submit-tx-label") : t("common.next-label")}
            </ActionButton>
          ) : null}
        </MultipleActionButtonWrapper>
      </PaperContent>
      <Debug it={{ fees, isH2H, isMint, isRelease }} />
    </>
  );
};

type TransactionActionButton = ButtonProps & {
  tx: TxSubmitter | TxWaiter;
  onDone: () => void;
  target?: number;
  autoSubmit?: boolean;
};

export const TxApprovalButton: FunctionComponent<TransactionActionButton> = ({
  tx,
  onDone,
  target,
  autoSubmit,
  disabled,
  ...rest
}) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(autoSubmit ? true : false);
  const [waiting, setWaiting] = useState(false);
  const [errorSubmitting, setErrorSubmitting] = useState<Error>();
  const [errorWaiting, setErrorWaiting] = useState<Error>();

  const [confirmations, setConfirmations] = useState<number>();

  const wait = useCallback(async () => {
    setErrorSubmitting(undefined);
    setErrorWaiting(undefined);

    try {
      setWaiting(true);
      await tx.wait(target).on("progress", (status) => {
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

    if (tx.submit && tx.progress.status === ChainTransactionStatus.Ready) {
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

  const isDisabled = disabled || waiting || submitting;

  return (
    <>
      <ActionButton disabled={isDisabled} onClick={submit} {...rest}>
        {waiting || submitting
          ? t("gateway.approving-assets-contracts-label")
          : t("gateway.approve-assets-contracts-label")}
      </ActionButton>
      <Debug
        it={{
          waiting,
          submitting,
          errorSubmitting,
          errorWaiting,
          confirmations,
        }}
      />
    </>
  );
};
