import { Box, Typography, useTheme } from "@material-ui/core";
import { GatewaySession } from "@renproject/rentx";
import { release } from "os";
import React, { FunctionComponent, useCallback } from "react";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import { MetamaskFullIcon } from "../../../components/icons/RenIcons";
import { Link } from "../../../components/links/Links";
import {
  BigDoneIcon,
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusInfo,
} from "../../../components/progress/ProgressHelpers";
import {
  BridgeChain,
  BridgeCurrency,
  BridgeNetwork,
  getChainConfig,
  getCurrencyConfig,
} from "../../../utils/assetConfigs";
import { getChainExplorerLink } from "../../transactions/transactionsUtils";
import { getBurnAndReleaseParams } from "../releaseUtils";

export const a = 1;

type ReleasePendingStatusProps = {
  tx: GatewaySession;
  onSubmit?: () => void;
  submitting?: boolean;
};

export const ReleasePendingStatus: FunctionComponent<ReleasePendingStatusProps> = ({
  tx,
  onSubmit,
  submitting = false,
}) => {
  const theme = useTheme();
  const { burnChainConfig } = getBurnAndReleaseParams(tx);

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit();
    }
  }, [onSubmit]);

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={theme.customColors.skyBlue} processing>
          {submitting ? (
            <TransactionStatusInfo
              status="Pending"
              chain={burnChainConfig.full}
              address={"0x0213131"} // TODO
            />
          ) : (
            <MetamaskFullIcon fontSize="inherit" color="inherit" />
          )}
        </ProgressWithContent>
      </ProgressWrapper>
      {!submitting && (
        <Typography variant="body1" align="center" gutterBottom>
          To receive your BTC, submit a release transaction to Ethereum via your
          Web3 Wallet.
        </Typography>
      )}
      <ActionButtonWrapper>
        <ActionButton onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting" : "Submit"} to {burnChainConfig.full}
          {submitting && "..."}
        </ActionButton>
      </ActionButtonWrapper>
    </>
  );
};

type ReleaseCompletedStatusProps = {
  tx: GatewaySession;
  onReturn?: () => void;
};

export const ReleaseCompletedStatus: FunctionComponent<ReleaseCompletedStatusProps> = ({
  tx,
  onReturn = () => {},
}) => {
  const theme = useTheme();
  const {
    releaseChainConfig,
    burnChainConfig,
    networkConfig,
  } = getBurnAndReleaseParams(tx);

  const burnTxLink = getChainExplorerLink(
    burnChainConfig.symbol,
    networkConfig.symbol,
    "0x12313123131"
  ); // TODO
  const releaseTxLink = getChainExplorerLink(
    releaseChainConfig.symbol,
    networkConfig.symbol,
    "0x12313123131"
  );

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={theme.palette.primary.main}>
          <BigDoneIcon />
        </ProgressWithContent>
      </ProgressWrapper>
      <ActionButtonWrapper>
        <ActionButton onClick={onReturn}>Return</ActionButton>
      </ActionButtonWrapper>
      <Box display="flex" justifyContent="space-between" py={2}>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={releaseTxLink}
          target="_blank"
        >
          {releaseChainConfig.full} transaction
        </Link>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={burnTxLink}
          target="_blank"
        >
          {burnChainConfig.full} transaction
        </Link>
      </Box>
    </>
  );
};
