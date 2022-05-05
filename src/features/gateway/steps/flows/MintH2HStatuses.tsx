import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Typography,
} from "@material-ui/core";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, { FunctionComponent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useEffectOnce } from "react-use";
import {
  ActionButton,
  MultipleActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { BigTopWrapper } from "../../../../components/layout/LayoutHelpers";
import { PaperContent } from "../../../../components/layout/Paper";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../../../../components/progress/ProgressHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { useSetPaperTitle } from "../../../../providers/TitleProviders";
import { getAssetConfig } from "../../../../utils/assetsConfig";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { decimalsAmount } from "../../../../utils/numbers";
import { undefinedForNull } from "../../../../utils/propsUtils";
import { trimAddress } from "../../../../utils/strings";
import { getWalletConfig } from "../../../../utils/walletsConfig";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { useTxSuccessNotification } from "../../../transactions/transactionsHooks";
import { AddTokenButton } from "../../../wallet/components/WalletHelpers";
import {
  useCurrentChainWallet,
  useWallet,
  useWalletAssetHelpers,
  useWalletPicker,
} from "../../../wallet/walletHooks";
import { FeesToggler } from "../../components/FeeHelpers";
import {
  RenVMSubmittingInfo,
  TransactionProgressInfo,
} from "../../components/TransactionProgressHelpers";
import { GatewayIOType, getGatewayParams } from "../../gatewayHooks";
import { SubmittingProps } from "../shared/SubmissionHelpers";
import {
  ChainProgressDone,
  FromToTxLinks,
  GoToHomeActionButton,
  SentReceivedSection,
} from "../shared/TransactionStatuses";
import {
  AccountWrapper,
  SendingReceivingWrapper,
} from "../shared/WalletSwitchHelpers";

type MintH2HLockTransactionProgressStatusProps = SubmittingProps & {
  gateway: Gateway;
  transaction: GatewayTransaction | null;
  Fees: ReactNode | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
  lockStatus: ChainTransactionStatus | null;
  lockConfirmations: number | null;
  lockTargetConfirmations: number | null;
};

export const MintH2HLockTransactionProgressStatus: FunctionComponent<
  MintH2HLockTransactionProgressStatusProps
> = ({
  gateway,
  transaction,
  Fees,
  outputAmount,
  outputAmountUsd,
  lockConfirmations,
  lockTargetConfirmations,
  lockStatus,
  onSubmit,
  onReset,
  submitting,
  waiting,
  done,
  submittingDisabled,
  errorSubmitting,
}) => {
  const { asset, from, to, toAddress, amount, fromAverageConfirmationTime } =
    getGatewayParams(gateway);
  const { Icon: SendIcon, RenIcon: ReceiveIcon } = getAssetConfig(asset);
  const sendIconTooltip = asset;
  const receiveIconTooltip = `ren${asset}`;
  const { account: fromAccount } = useWallet(from);
  const fromChainConfig = getChainConfig(from);

  const Icon = fromChainConfig.Icon;
  const showProgress =
    lockConfirmations !== null && lockTargetConfirmations !== null;

  return (
    <>
      <PaperContent bottomPadding topPadding>
        {/* {!showProgress && (
          <BalanceInfo chain={from} balance={balance} asset={asset} />
        )} */}
        {showProgress && (
          <>
            <ProgressWrapper>
              <ProgressWithContent
                confirmations={undefinedForNull(lockConfirmations)}
                targetConfirmations={undefinedForNull(lockTargetConfirmations)}
                color={fromChainConfig.color}
              >
                <Icon fontSize="inherit" />
              </ProgressWithContent>
            </ProgressWrapper>
            <TransactionProgressInfo
              confirmations={lockConfirmations}
              target={lockTargetConfirmations}
              averageConfirmationTime={fromAverageConfirmationTime}
            />
          </>
        )}
        {/* <SendingReceivingSection
          ioType={GatewayIOType.lockAndMint}
          asset={asset}
          sendingAmount={amount}
          receivingAmount={outputAmount}
          receivingAmountUsd={outputAmountUsd}
        /> */}
        <SendingReceivingWrapper
          from={from}
          to={to}
          amount={amount.toString()}
          outputAmount={outputAmount || ""}
          SendIcon={SendIcon}
          ReceiveIcon={ReceiveIcon}
          sendIconTooltip={sendIconTooltip}
          receiveIconTooltip={receiveIconTooltip}
        ></SendingReceivingWrapper>
        {!showProgress && (
          <BigTopWrapper>
            <AccountWrapper chain={from} label="Sender Address">
              {trimAddress(fromAccount, 5)}
            </AccountWrapper>
            <AccountWrapper chain={to} label="Recipient Address">
              {trimAddress(toAddress, 5)}
            </AccountWrapper>
            {/* <AddressInfo address={fromAccount} label="Sender Address" />
            <AddressInfo address={toAccount} label="Recipient Address" /> */}
          </BigTopWrapper>
        )}
        <Box display="flex" alignItems="center" justifyContent="center">
          <FormControlLabel
            control={<Checkbox name="primary" color="primary" />}
            disabled={true}
            label={
              <Typography variant="caption">
                I want to transfer to a different account
              </Typography>
            }
          />
        </Box>
        {/* <WalletNetworkSwitchMessage /> */}
      </PaperContent>
      <Divider />
      <PaperContent darker topPadding bottomPadding>
        <FeesToggler>{Fees}</FeesToggler>
        <MultipleActionButtonWrapper>
          <ActionButton
            onClick={onSubmit}
            disabled={
              submittingDisabled ||
              submitting ||
              waiting ||
              lockStatus === ChainTransactionStatus.Confirming
            }
          >
            {submitting ||
            waiting ||
            lockStatus === ChainTransactionStatus.Confirming
              ? `Locking on ${fromChainConfig.shortName}...`
              : `Starting Bridging`}
          </ActionButton>
          {errorSubmitting && (
            <SubmitErrorDialog
              open={true}
              error={errorSubmitting}
              onAction={onReset}
            />
          )}
        </MultipleActionButtonWrapper>
      </PaperContent>
    </>
  );
};

type MintH2HMintTransactionProgressStatusProps = SubmittingProps & {
  gateway: Gateway;
  Fees: ReactNode | null;
  transaction: GatewayTransaction | null;
  renVMStatus: ChainTransactionStatus | null;
  mintAmount: string | null;
  mintStatus: ChainTransactionStatus | null;
  mintConfirmations: number | null;
  mintTargetConfirmations: number | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
};

export const MintH2HMintTransactionProgressStatus: FunctionComponent<
  MintH2HMintTransactionProgressStatusProps
> = ({
  gateway,
  Fees,
  transaction,
  renVMStatus,
  mintAmount,
  mintConfirmations,
  mintTargetConfirmations,
  mintStatus,
  outputAmount,
  outputAmountUsd,
  onSubmit,
  onReset,
  submitting,
  waiting,
  done,
  errorSubmitting,
}) => {
  const { asset, from, to, amount } = getGatewayParams(gateway);
  const { Icon: SendIcon, RenIcon: ReceiveIcon } = getAssetConfig(asset);
  const sendIconTooltip = asset;
  const receiveIconTooltip = `ren${asset}`;
  const mintChainConfig = getChainConfig(to);

  const { connected } = useWallet(to);
  const { handlePickerOpen, pickerOpened } = useWalletPicker();

  const { Icon: ChainIcon } = mintChainConfig;
  return (
    <>
      <PaperContent bottomPadding>
        <ProgressWrapper>
          {renVMStatus === ChainTransactionStatus.Confirming ? (
            <ProgressWithContent processing>
              <RenVMSubmittingInfo />
            </ProgressWithContent>
          ) : (
            <ProgressWithContent
              confirmations={undefinedForNull(mintConfirmations)}
              targetConfirmations={mintTargetConfirmations}
              color={mintChainConfig.color}
            >
              <ChainIcon fontSize="inherit" />
            </ProgressWithContent>
          )}
        </ProgressWrapper>
        <SendingReceivingWrapper
          from={from}
          to={to}
          amount={amount.toString()}
          outputAmount={outputAmount || ""}
          SendIcon={SendIcon}
          ReceiveIcon={ReceiveIcon}
          sendIconTooltip={sendIconTooltip}
          receiveIconTooltip={receiveIconTooltip}
        ></SendingReceivingWrapper>
        {/* <SendingReceivingSection
            ioType={GatewayIOType.lockAndMint}
            asset={asset}
            sendingAmount={amount}
            receivingAmount={outputAmount}
            receivingAmountUsd={outputAmountUsd}
          /> */}
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding darker>
        <FeesToggler>{Fees}</FeesToggler>
        <MultipleActionButtonWrapper>
          {connected && (
            <ActionButton
              onClick={onSubmit}
              disabled={submitting || waiting || !mintAmount}
            >
              {submitting || waiting
                ? `Minting on ${mintChainConfig.shortName}...`
                : `Mint on ${mintChainConfig.shortName}`}
            </ActionButton>
          )}
          {!connected && (
            <ActionButton onClick={handlePickerOpen} disabled={pickerOpened}>
              Connect {mintChainConfig.shortName} Wallet
            </ActionButton>
          )}
          {errorSubmitting && (
            <SubmitErrorDialog
              open={true}
              error={errorSubmitting}
              onAction={onReset}
            />
          )}
        </MultipleActionButtonWrapper>
      </PaperContent>
    </>
  );
};

type MintH2HCompletedStatusProps = {
  gateway: Gateway;
  lockTxUrl: string | null;
  lockAmount: string | null;
  lockAssetDecimals: number | null;
  mintTxUrl: string | null;
  mintAmount: string | null;
  mintAssetDecimals: number | null;
};

export const MintH2HCompletedStatus: FunctionComponent<
  MintH2HCompletedStatusProps
> = ({
  gateway,
  lockTxUrl,
  lockAmount,
  lockAssetDecimals,
  mintTxUrl,
  mintAmount,
  mintAssetDecimals,
}) => {
  const { t } = useTranslation();
  useSetPaperTitle(t("mint.complete-title"));

  const { from, to, asset } = getGatewayParams(gateway);
  const { wallet } = useCurrentChainWallet();
  const walletConfig = getWalletConfig(wallet);
  const lockAssetConfig = getAssetConfig(gateway.params.asset);
  const mintChainConfig = getChainConfig(gateway.params.to.chain);

  const lockAmountFormatted = decimalsAmount(lockAmount, lockAssetDecimals);
  const mintAmountFormatted = decimalsAmount(mintAmount, mintAssetDecimals);

  const notificationMessage = t("mint.success-notification-message", {
    total: mintAmountFormatted,
    currency: lockAssetConfig.shortName,
    chain: mintChainConfig.fullName,
  });
  const viewChainTxLinkMessage = t("tx.view-chain-transaction-link-text", {
    chain: mintChainConfig.fullName,
  });
  const { txSuccessNotification } = useTxSuccessNotification(
    mintTxUrl,
    notificationMessage,
    viewChainTxLinkMessage
  );

  useEffectOnce(txSuccessNotification);

  const walletTokenMeta = useWalletAssetHelpers(
    gateway.params.to.chain,
    gateway.params.asset
  );
  const { addToken } = walletTokenMeta;

  return (
    <PaperContent bottomPadding>
      <ChainProgressDone chain={to} />
      <SentReceivedSection
        ioType={GatewayIOType.lockAndMint}
        sentAmount={lockAmountFormatted}
        receivedAmount={mintAmountFormatted}
        asset={asset}
      />
      <FromToTxLinks
        from={from}
        to={to}
        fromTxUrl={lockTxUrl}
        toTxUrl={mintTxUrl}
      />
      {addToken !== null && (
        <Box mb={1}>
          <AddTokenButton
            onAddToken={addToken}
            wallet={walletConfig.shortName || walletConfig.fullName}
            currency={lockAssetConfig.shortName}
          />
        </Box>
      )}
      <GoToHomeActionButton />
      <Debug it={{ walletTokenMeta }} />
    </PaperContent>
  );
};
