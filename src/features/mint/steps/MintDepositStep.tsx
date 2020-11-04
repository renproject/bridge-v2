import { Box, Divider, IconButton, Typography } from "@material-ui/core";
import {
  depositMachine,
  GatewaySession,
  GatewayTransaction,
} from "@renproject/rentx";
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Actor } from "xstate";
import {
  CopyContentButton,
  QrCodeIconButton,
  ToggleIconButton,
} from "../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { BackArrowIcon, BitcoinIcon } from "../../../components/icons/RenIcons";
import {
  PaperActions,
  PaperContent,
  PaperHeader,
  PaperNav,
  PaperTitle,
} from "../../../components/layout/Paper";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../../../components/progress/ProgressHelpers";
import {
  BigAssetAmount,
  BigAssetAmountWrapper,
} from "../../../components/typography/TypographyHelpers";
import { Debug } from "../../../components/utils/Debug";
import { orangeLight } from "../../../theme/colors";
import { getCurrencyShortLabel } from "../../../utils/assetConfigs";
import { setFlowStep } from "../../flow/flowSlice";
import { FlowStep } from "../../flow/flowTypes";
import { useGasPrices } from "../../marketData/marketDataHooks";
import { DepositStatus } from "../components/MintHelpers";
import { $mint } from "../mintSlice";
import { useMintMachine, useTxParam } from "../mintUtils";
import { MintFees } from "./MintFeesStep";

export const MintDepositStep: FunctionComponent = () => {
  useGasPrices();
  const dispatch = useDispatch();
  const { amount, currency } = useSelector($mint);
  const parsedTx = useTxParam();
  const [tx] = useState<GatewaySession>(parsedTx);
  const [current] = useMintMachine(tx);

  const activeDeposit = useMemo<{
    deposit: GatewayTransaction;
    machine: Actor<typeof depositMachine>;
  } | null>(() => {
    const deposit = Object.values(current.context.tx.transactions)[0];
    if (!deposit || !current.context.depositMachines) return null;
    const machine = current.context.depositMachines[deposit.sourceTxHash];
    return { deposit, machine };
  }, [current.context]);

  const handlePreviousStepClick = useCallback(() => {
    dispatch(setFlowStep(FlowStep.FEES));
  }, [dispatch]);

  const gatewayAddress = "1LU14szcGuMwxVNet1rm"; // TODO: get
  const processingTime = 60; // TODO: get
  return (
    <>
      <PaperHeader>
        <PaperNav>
          <IconButton onClick={handlePreviousStepClick}>
            <BackArrowIcon />
          </IconButton>
        </PaperNav>
        <PaperTitle>Send {getCurrencyShortLabel(currency)}</PaperTitle>
        <PaperActions>
          <ToggleIconButton variant="settings" />
          <ToggleIconButton variant="notifications" />
        </PaperActions>
      </PaperHeader>
      <PaperContent bottomPadding>
        <ProgressWrapper>
          <ProgressWithContent color={orangeLight} size={64}>
            <BitcoinIcon fontSize="inherit" color="inherit" />
          </ProgressWithContent>
        </ProgressWrapper>
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
        <Box
          mt={2}
          display="flex"
          justifyContent="center"
          flexDirection="column"
          alignItems="center"
        >
          <Typography variant="caption" gutterBottom>
            Estimated processing time: {processingTime} minutes
          </Typography>
          <Box mt={2}>
            <QrCodeIconButton />
          </Box>
        </Box>
      </PaperContent>
      {activeDeposit ? (
        <DepositStatus
          deposit={activeDeposit.deposit}
          machine={activeDeposit.machine}
        />
      ) : (
        <span>
          Deposit {Number(current.context.tx.suggestedAmount) / 1e8}{" "}
          {current.context.tx.sourceAsset} to:{" "}
          {current.context.tx.gatewayAddress}
        </span>
      )}
      <Divider />
      <PaperContent topPadding bottomPadding>
        <MintFees />
        <Debug it={{ tx }} />
      </PaperContent>
    </>
  );
};
