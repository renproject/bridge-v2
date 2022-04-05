import { Box, Divider } from "@material-ui/core";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus, ContractChain } from "@renproject/utils";
import BigNumber from "bignumber.js";
import React, { FunctionComponent, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useEffectOnce } from "react-use";
import {
  ActionButton,
  MultipleActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { PaperContent } from "../../../../components/layout/Paper";
import { Link } from "../../../../components/links/Links";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../../../../components/progress/ProgressHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { useNotifications } from "../../../../providers/Notifications";
import { useSetPaperTitle } from "../../../../providers/TitleProviders";
import { getAssetConfig } from "../../../../utils/assetsConfig";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { decimalsAmount } from "../../../../utils/numbers";
import { undefinedForNull } from "../../../../utils/propsUtils";
import { getWalletConfig } from "../../../../utils/walletsConfig";
import { useBrowserNotifications } from "../../../notifications/notificationsUtils";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { AddTokenButton } from "../../../wallet/components/WalletHelpers";
import {
  useCurrentChainWallet,
  useWallet,
  useWalletAssetHelpers,
  useWalletPicker,
} from "../../../wallet/walletHooks";
import { BalanceInfo } from "../../components/BalanceHelpers";
import { FeesToggler } from "../../components/FeeHelpers";
import { WalletNetworkSwitchMessage } from "../../components/HostToHostHelpers";
import {
  RenVMSubmittingInfo,
  TransactionProgressInfo,
} from "../../components/TransactionProgressHelpers";
import {
  getGatewayParams,
  useContractChainAssetBalance,
} from "../../gatewayHooks";
import { SubmittingProps } from "../shared/SubmissionHelpers";
import {
  ChainProgressDone,
  FromToTxLinks,
  GoToHomeActionButton,
  SendingReceivingSection,
  SentReceivedSection,
} from "../shared/TransactionStatuses";

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
  const { asset, from, amount, fromAverageConfirmationTime } =
    getGatewayParams(gateway);
  const fromChainConfig = getChainConfig(from);
  const { balance } = useContractChainAssetBalance(
    gateway.fromChain as ContractChain,
    asset
  );

  const Icon = fromChainConfig.Icon;
  const showProgress =
    lockConfirmations !== null && lockTargetConfirmations !== null;

  return (
    <>
      <PaperContent bottomPadding>
        {!showProgress && (
          <BalanceInfo chain={from} balance={balance} asset={asset} />
        )}
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
        <SendingReceivingSection
          asset={asset}
          sendingAmount={amount}
          receivingAmount={outputAmount}
          receivingAmountUsd={outputAmountUsd}
        />
        <WalletNetworkSwitchMessage />
      </PaperContent>
      <Divider />
      <PaperContent topPadding bottomPadding darker>
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
              : `Lock on ${fromChainConfig.shortName}`}
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
  const { asset, to, amount } = getGatewayParams(gateway);
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
        <SendingReceivingSection
          asset={asset}
          sendingAmount={amount}
          receivingAmount={outputAmount}
          receivingAmountUsd={outputAmountUsd}
        />
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

  //TODO: DRY
  const { showNotification } = useNotifications();
  const { showBrowserNotification } = useBrowserNotifications();

  const showNotifications = useCallback(() => {
    if (mintTxUrl !== null) {
      const notificationMessage = t("mint.success-notification-message", {
        total: mintAmountFormatted,
        currency: lockAssetConfig.shortName,
        chain: mintChainConfig.fullName,
      });
      showNotification(
        <span>
          {notificationMessage}{" "}
          <Link external href={mintTxUrl}>
            {t("tx.view-chain-transaction-link-text", {
              chain: mintChainConfig.fullName,
            })}
          </Link>
        </span>
      );
      showBrowserNotification(notificationMessage);
    }
  }, [
    showNotification,
    showBrowserNotification,
    mintAmountFormatted,
    mintChainConfig,
    lockAssetConfig,
    mintTxUrl,
    t,
  ]);

  useEffectOnce(showNotifications);

  const walletTokenMeta = useWalletAssetHelpers(
    gateway.params.to.chain,
    gateway.params.asset
  );
  const { addToken } = walletTokenMeta;

  return (
    <PaperContent bottomPadding>
      <ChainProgressDone chain={to} />
      <SentReceivedSection
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
