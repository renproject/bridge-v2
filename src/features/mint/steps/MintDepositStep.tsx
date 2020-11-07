import { Box, Divider, IconButton, Typography } from '@material-ui/core'
import { depositMachine, GatewaySession, GatewayTransaction, } from '@renproject/rentx'
import React, { FunctionComponent, useCallback, useMemo, useState, } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Actor } from 'xstate'
import { CopyContentButton, QrCodeIconButton, ToggleIconButton, } from '../../../components/buttons/Buttons'
import { NumberFormatText } from '../../../components/formatting/NumberFormatText'
import { BackArrowIcon, BitcoinIcon } from '../../../components/icons/RenIcons'
import { PaperActions, PaperContent, PaperHeader, PaperNav, PaperTitle, } from '../../../components/layout/Paper'
import { ProgressWithContent, ProgressWrapper, } from '../../../components/progress/ProgressHelpers'
import { BigAssetAmount, BigAssetAmountWrapper, } from '../../../components/typography/TypographyHelpers'
import { Debug } from '../../../components/utils/Debug'
import { BridgeCurrency } from '../../../components/utils/types'
import { useSelectedChainWallet } from '../../../providers/multiwallet/multiwalletHooks'
import { orangeLight } from '../../../theme/colors'
import { getCurrencyShortLabel } from '../../../utils/assetConfigs'
import { setFlowStep } from '../../flow/flowSlice'
import { FlowStep } from '../../flow/flowTypes'
import { useGasPrices } from '../../marketData/marketDataHooks'
import { useTxParam } from '../../transactions/transactionsUtils'
import { DepositStatus } from '../components/MintHelpers'
import { $mint } from '../mintSlice'
import { useMintMachine} from '../mintUtils'
import { MintFees } from './MintFeesStep'

export const MintDepositStep: FunctionComponent = () => {
  useGasPrices();
  const dispatch = useDispatch();
  const { status } = useSelectedChainWallet();
  const { currency } = useSelector($mint);
  const { tx: parsedTx } = useTxParam();
  const [tx] = useState<GatewaySession>(parsedTx as GatewaySession); //TODO fix this

  const handlePreviousStepClick = useCallback(() => {
    // TODO: warn if dangerous
    dispatch(setFlowStep(FlowStep.FEES));
  }, [dispatch]);

  const walletConnected = status === "connected";
  const showTransactionStatus = !!tx && walletConnected;
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
        {showTransactionStatus && <MintTransactionStatus tx={tx} />}
        {!walletConnected && <span>connect wallet</span>}
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding>
        <MintFees />
        <Debug it={{ parsedTx }} />
      </PaperContent>
    </>
  );
};

type MintTransactionStatusProps = {
  tx: GatewaySession;
};

const MintTransactionStatus: FunctionComponent<MintTransactionStatusProps> = ({
  tx,
}) => {
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

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={orangeLight} size={64}>
          <BitcoinIcon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      {activeDeposit ? (
        <DepositStatus
          deposit={activeDeposit.deposit}
          machine={activeDeposit.machine}
        />
      ) : (
        <>
          <SendToInfo
            amount={Number(current.context.tx.suggestedAmount) / 1e8}
            currency={BridgeCurrency.BTC}
            gatewayAddress={current.context.tx.gatewayAddress}
            processingTime={60} // TODO: calculate
          />
          <span>
            Deposit {Number(current.context.tx.suggestedAmount) / 1e8}{" "}
            {current.context.tx.sourceAsset} to:{" "}
            {current.context.tx.gatewayAddress}
          </span>
        </>
      )}
      <Debug it={{ contextTx: current.context.tx }} />
    </>
  );
};

type SendToInfoProps = {
  amount: number;
  currency: BridgeCurrency;
  gatewayAddress?: string;
  processingTime: number;
};

const SendToInfo: FunctionComponent<SendToInfoProps> = ({
  amount,
  currency,
  gatewayAddress,
  processingTime,
}) => {
  return (
    <>
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
      {!!gatewayAddress && <CopyContentButton content={gatewayAddress} />}
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
    </>
  );
};
