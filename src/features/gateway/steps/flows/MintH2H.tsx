import { Divider } from "@material-ui/core";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { BigTopWrapper } from "../../../../components/layout/LayoutHelpers";
import { PaperContent } from "../../../../components/layout/Paper";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import { getAssetConfig } from "../../../../utils/assetsConfig";
import { decimalsAmount } from "../../../../utils/numbers";
import { trimAddress } from "../../../../utils/strings";
import {
  alterContractChainProviderSigner,
  pickChains,
} from "../../../chain/chainUtils";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import { LocalTxPersistor, useTxsStorage } from "../../../storage/storageHooks";
import {
  GeneralErrorDialog,
  SubmitErrorDialog,
  TxRecoveryErrorDialog,
} from "../../../transactions/components/TransactionsHelpers";
import { useSetCurrentTxHash } from "../../../transactions/transactionsHooks";
import { useSyncWalletChain, useWallet } from "../../../wallet/walletHooks";
import { BalanceInfoPlaceholder } from "../../components/BalanceHelpers";
import { FeesToggler } from "../../components/FeeHelpers";
import { GatewayFees } from "../../components/GatewayFees";
import { GatewayLoaderStatus } from "../../components/GatewayHelpers";
import { PCW } from "../../components/PaperHelpers";
import {
  getGatewayParams,
  useChainInstanceAssetDecimals,
  useGateway,
  useGatewayFeesWithRates,
  useSetGatewayContext,
} from "../../gatewayHooks";
import {
  isTxSubmittable,
  useChainTransactionStatusUpdater,
  useChainTransactionSubmitter,
  usePartialTxMemo,
  useRenVMChainTransactionStatusUpdater,
  useTxRecovery,
} from "../../gatewayTransactionHooks";
import { parseGatewayQueryString } from "../../gatewayUtils";
import {
  GatewayPaperHeader,
  TransactionRecoveryModal,
} from "../shared/GatewayNavigationHelpers";
import {
  AccountWrapper,
  H2HAccountsResolver,
  SendingReceivingWrapper,
  WalletConnectionActionButtonGuard,
} from "../shared/WalletSwitchHelpers";
import {
  MintH2HCompletedStatus,
  MintH2HLockTransactionProgressStatus,
  MintH2HMintTransactionProgressStatus,
} from "./MintH2HStatuses";

export const MintH2HProcess: FunctionComponent<RouteComponentProps> = ({
  location,
  ...rest
}) => {
  const { gatewayParams, additionalParams } = parseGatewayQueryString(
    location.search
  );
  const { from, to, toAddress } = gatewayParams;
  const { renVMHash, partialTxString } = additionalParams;
  const [fromAccount, setFromAccount] = useState<string>("");
  const [toAccount, setToAccount] = useState<string>(toAddress || "");

  const hasRenVMHash = Boolean(renVMHash);
  const hasPartialTx = Boolean(partialTxString);
  const recoveryMode = hasRenVMHash || hasPartialTx;
  const [shouldResolveAccounts] = useState(!recoveryMode);
  const handleAccountsResolved = useCallback(
    (resolvedFromAccount: string, resolvedToAccount: string) => {
      setFromAccount(resolvedFromAccount);
      setToAccount(resolvedToAccount);
    },
    []
  );

  const accountsResolved = fromAccount && toAccount;

  // resolve accounts for new transactions
  if (shouldResolveAccounts && !accountsResolved) {
    return (
      <H2HAccountsResolver
        transactionType="mint"
        from={from}
        to={to}
        onResolved={handleAccountsResolved}
      />
    );
  }
  return (
    <MintH2HGatewayProcess
      fromAccount={fromAccount}
      toAccount={toAccount}
      location={location}
      {...rest}
    />
  );
};

type MintH2HGatewayProcessProps = RouteComponentProps & {
  fromAccount: string;
  toAccount: string;
};

export const MintH2HGatewayProcess: FunctionComponent<
  MintH2HGatewayProcessProps
> = ({ history, location, fromAccount, toAccount }) => {
  const { t } = useTranslation();
  const allChains = useCurrentNetworkChains();

  const {
    gatewayParams,
    additionalParams,
    error: parseError,
  } = parseGatewayQueryString(location.search);
  // TODO: toAddress from renVM
  const { asset, from, to, amount, toAddress: toAddressParam } = gatewayParams;
  const { renVMHash, partialTxString } = additionalParams;
  const [gatewayChains] = useState(pickChains(allChains, from, to));

  const { account: fromAccountWallet } = useWallet(from);
  // TODO: warnings?
  const toAddress = toAddressParam || toAccount;
  const fromAddress = fromAccount || fromAccountWallet;

  const hasRenVMHash = Boolean(renVMHash);
  const hasPartialTx = Boolean(partialTxString);
  const partialTx = usePartialTxMemo(partialTxString);

  const { gateway, transactions, recoverLocalTx, error } = useGateway(
    {
      asset,
      from,
      to,
      amount,
      toAddress: toAddress,
    },
    {
      chains: gatewayChains,
      partialTx,
    }
  );
  useSetGatewayContext(gateway);

  const [recoveryMode] = useState(hasRenVMHash || hasPartialTx);
  const { persistLocalTx } = useTxsStorage();

  const { recoveringError } = useTxRecovery({
    gateway,
    renVMHash,
    fromAddress,
    recoveryMode,
    recoverLocalTx,
  });

  const transaction = transactions[0] || null;
  (window as any).gateway = gateway;
  (window as any).transactions = transactions;
  (window as any).transaction = transaction;

  // gateway.inSetup is accepted;
  return (
    <>
      <GatewayPaperHeader title="Mint" />
      {gateway === null && (
        <PCW>
          <GatewayLoaderStatus />
        </PCW>
      )}
      {gateway !== null && (
        <MintH2HProcessor
          gateway={gateway}
          transaction={transaction}
          persistLocalTx={persistLocalTx}
          fromAccount={fromAddress}
          toAccount={toAddress}
          recoveryMode={recoveryMode}
        />
      )}
      {Boolean(parseError) && (
        <GeneralErrorDialog
          open={true}
          reason={parseError}
          alternativeActionText={t("navigation.back-to-start-label")}
          onAlternativeAction={() => history.push({ pathname: paths.MINT })}
        />
      )}
      {Boolean(recoveringError) && (
        <TxRecoveryErrorDialog
          open={true}
          error={recoveringError}
          alternativeActionText={t("navigation.back-to-start-label")}
          onAlternativeAction={() => history.push({ pathname: paths.MINT })}
        />
      )}
      {error !== null && (
        <GeneralErrorDialog
          open={true}
          reason={"Failed to load gateway"}
          error={error}
          actionText={t("navigation.back-to-home-label")}
          onAction={() => history.push({ pathname: paths.HOME })}
        />
      )}
      <Debug it={{}} />
    </>
  );
};

type MintH2HProcessorProps = {
  gateway: Gateway;
  transaction: GatewayTransaction | null;
  persistLocalTx: LocalTxPersistor;
  fromAccount: string;
  toAccount: string;
  recoveryMode?: boolean;
};

const MintH2HProcessor: FunctionComponent<MintH2HProcessorProps> = ({
  gateway,
  transaction,
  persistLocalTx,
  fromAccount,
  toAccount,
  recoveryMode,
}) => {
  const history = useHistory();
  const allChains = useCurrentNetworkChains();
  const { asset, from, to, amount } = getGatewayParams(gateway);
  const { Icon: SendIcon, RenIcon: ReceiveIcon } = getAssetConfig(asset);
  const sendIconTooltip = asset;
  const receiveIconTooltip = `ren${asset}`;
  const fees = useGatewayFeesWithRates(gateway, amount || 0);

  const { outputAmount } = fees;

  const inSetupApprovalSubmitter = useChainTransactionSubmitter({
    tx: gateway.inSetup.approval,
    debugLabel: "inSetup.approval",
  });
  const {
    handleSubmit: handleSubmitApproval,
    submitting: submittingApproval,
    submittingDone: submittingApprovalDone,
  } = inSetupApprovalSubmitter;

  const inSetupApprovalTxMeta = useChainTransactionStatusUpdater({
    tx: gateway.inSetup.approval,
    debugLabel: "inSetup.approval",
    startTrigger: submittingApprovalDone || recoveryMode,
  });

  const { status: inSetupApprovalStatus } = inSetupApprovalTxMeta;
  // for native currencies approval is not required
  const approvalStatus = gateway.inSetup.approval
    ? inSetupApprovalStatus
    : ChainTransactionStatus.Done;
  // TODO: solana

  const gatewayInSubmitter = useChainTransactionSubmitter({
    tx: gateway.in,
    debugLabel: "in",
  });
  const {
    handleSubmit: handleSubmitLock,
    submitting: submittingLock,
    submittingDone: submittingLockDone,
    waiting: waitingLock,
    done: doneLock,
    errorSubmitting: errorSubmittingLock,
    handleReset: handleResetLock,
  } = gatewayInSubmitter;

  //TODO: DRY
  useEffect(() => {
    if (fromAccount && transaction !== null) {
      console.info("persisting local tx");
      persistLocalTx(fromAccount, transaction);
      const params = new URLSearchParams(history.location.search);
      const renVMHashTx = transaction.hash;
      const renVMHashParam = (params as any).renVMHash;
      if (renVMHashTx !== renVMHashParam) {
        params.set("renVMHash", renVMHashTx);
        params.set("toAddress", toAccount);
        history.replace({
          search: params.toString(),
        });
      }
    }
  }, [
    history,
    persistLocalTx,
    fromAccount,
    submittingLockDone,
    transaction,
    toAccount,
  ]);

  const gatewayInTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.in || gateway.in, // not the case
    // tx: gateway.in, // not the case
    startTrigger: submittingLockDone || recoveryMode,
    debugLabel: "in",
  });
  const {
    confirmations: lockConfirmations,
    target: lockTargetConfirmations,
    status: lockStatus,
    txUrl: lockTxUrl,
    amount: lockAmount,
  } = gatewayInTxMeta;

  const renVMSubmitter = useChainTransactionSubmitter({
    tx: transaction?.renVM,
    autoSubmit:
      lockStatus === ChainTransactionStatus.Done &&
      isTxSubmittable(transaction?.renVM),
    attempts: 4,
    debugLabel: "renVM",
  });
  const renVMTxMeta = useRenVMChainTransactionStatusUpdater({
    tx: transaction?.renVM,
    startTrigger: renVMSubmitter.submittingDone || recoveryMode,
    debugLabel: "renVM",
  });
  const { status: renVMStatus, amount: mintAmount } = renVMTxMeta;

  // wallet provider start
  const activeChain = renVMStatus !== null ? to : from;
  useSyncWalletChain(activeChain);
  const { connected, provider } = useWallet(activeChain);
  useEffect(() => {
    console.info("activeChain changed", activeChain);
    if (provider && connected) {
      alterContractChainProviderSigner(allChains, activeChain, provider);
    }
  }, [allChains, activeChain, provider, connected]);

  const outSubmitter = useChainTransactionSubmitter({
    tx: transaction?.out,
    debugLabel: "out",
  });

  const [submittingOutSetup, setSubmittingOutSetup] = useState(false);
  const [submittingOutError, setSubmittingOutError] = useState<any>();

  const {
    handleSubmit: handleSubmitMint,
    submitting: submittingMint,
    // submittingDone: submittingMintDone,
    waiting: waitingMint,
    done: doneMint,
    errorSubmitting: submittingMintError,
    handleReset: handleResetMint,
  } = outSubmitter;

  const handleSubmitMintAndOut = useCallback(async () => {
    setSubmittingOutSetup(true);
    if (transaction === null) {
      return;
    }
    try {
      for (const key of Object.keys(transaction.outSetup)) {
        if (transaction.outSetup[key]) {
          await transaction.outSetup[key].submit?.();
          await transaction.outSetup[key].wait();
        }
      }
      setSubmittingOutSetup(false);
      await handleSubmitMint();
    } catch (error: any) {
      setSubmittingOutError({ code: 1984, message: "outSetup error" });
      console.error(error);
    }
  }, [handleSubmitMint, transaction]);

  const handleResetMintAndOut = useCallback(() => {
    setSubmittingOutError(false);
    setSubmittingOutSetup(false);
    handleResetMint();
  }, [handleResetMint]);

  const outTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.out,
    debugLabel: "out",
    startTrigger: outSubmitter.submittingDone || recoveryMode,
  });
  const {
    status: mintStatus,
    confirmations: mintConfirmations,
    target: mintTargetConfirmations,
    txUrl: mintTxUrl,
  } = outTxMeta;

  const { decimals: lockAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.fromChain,
    asset
  );

  // const { decimals: mintAssetDecimals } = useChainInstanceAssetDecimals(
  //   gateway.toChain,
  //   asset
  // );

  const Fees = <GatewayFees asset={asset} from={from} to={to} {...fees} />;

  const isCompleted = mintTxUrl !== null;
  useEffect(() => {
    if (transaction !== null && isCompleted) {
      console.info("persisting final tx", transaction);
      persistLocalTx(fromAccount, transaction, true);
    }
  }, [persistLocalTx, fromAccount, isCompleted, transaction]);

  useSetCurrentTxHash(transaction?.hash);

  const lockAmountFormatted =
    decimalsAmount(lockAmount, lockAssetDecimals) || amount.toString();
  // TODO: clarify with Noah
  const mintAmountFormatted =
    decimalsAmount(mintAmount, lockAssetDecimals) || outputAmount;

  let Content = null;
  // TODO: consider making similar to Relase H2H
  // const { connected: fromConnected } = useWallet(from);
  // if (!fromConnected) {
  //   Content = (
  //     <PCW>
  //       <ConnectWalletPaperSection chain={from} isRecoveringTx={recoveryMode} />
  //     </PCW>
  //   );
  // } else
  if (approvalStatus !== ChainTransactionStatus.Done && lockStatus === null) {
    Content = (
      <>
        <PaperContent bottomPadding>
          <BalanceInfoPlaceholder />
          <SendingReceivingWrapper
            from={from}
            to={to}
            amount={amount.toString()}
            outputAmount={outputAmount || ""}
            SendIcon={SendIcon}
            ReceiveIcon={ReceiveIcon}
            sendIconTooltip={sendIconTooltip}
            receiveIconTooltip={receiveIconTooltip}
          />
          {/* <SendingReceivingSection
            ioType={GatewayIOType.lockAndMint}
            asset={asset}
            sendingAmount={amount}
            receivingAmount={outputAmount}
            receivingAmountUsd={outputAmountUsd}
          /> */}
          <BigTopWrapper>
            <AccountWrapper chain={from} label="Sender Address">
              {trimAddress(fromAccount, 5)}
            </AccountWrapper>
            <AccountWrapper chain={to} label="Recipient Address">
              {trimAddress(toAccount, 5)}
            </AccountWrapper>
            {/* <AddressInfo address={fromAccount} label="Sender Address" />
            <AddressInfo address={toAccount} label="Recipient Address" /> */}
          </BigTopWrapper>
        </PaperContent>
        <Divider />
        <PaperContent darker topPadding bottomPadding>
          <FeesToggler>{Fees}</FeesToggler>
          <ActionButtonWrapper>
            <WalletConnectionActionButtonGuard chain={from}>
              <ActionButton
                onClick={handleSubmitApproval}
                disabled={submittingApproval || recoveryMode}
              >
                {submittingApproval
                  ? "Approving Accounts & Contracts..."
                  : "Confirm"}
              </ActionButton>
            </WalletConnectionActionButtonGuard>
          </ActionButtonWrapper>
        </PaperContent>
      </>
    );
  } else if (renVMStatus === null) {
    //in case of failing, submit helpers must be here
    Content = (
      <MintH2HLockTransactionProgressStatus
        gateway={gateway}
        transaction={transaction}
        Fees={Fees}
        lockAmount={lockAmountFormatted}
        mintAmount={mintAmountFormatted}
        lockConfirmations={lockConfirmations}
        lockTargetConfirmations={lockTargetConfirmations}
        lockStatus={lockStatus}
        onSubmit={handleSubmitLock}
        submitting={submittingLock}
        waiting={waitingLock}
        done={doneLock}
        errorSubmitting={errorSubmittingLock}
        onReset={handleResetLock}
        submittingDisabled={recoveryMode}
      />
    );
  } else if (mintTxUrl === null) {
    Content = (
      <MintH2HMintTransactionProgressStatus
        gateway={gateway}
        transaction={transaction}
        Fees={Fees}
        renVMStatus={renVMStatus}
        lockAmount={lockAmountFormatted}
        mintAmount={mintAmountFormatted}
        mintConfirmations={mintConfirmations}
        mintTargetConfirmations={mintTargetConfirmations}
        mintStatus={mintStatus}
        onSubmit={handleSubmitMintAndOut}
        submitting={submittingMint || submittingOutSetup}
        submittingError={submittingMintError || submittingOutError}
        submittingDisabled={submittingMint || submittingOutSetup}
        waiting={waitingMint}
        done={doneMint}
        onReset={handleResetMintAndOut}
      />
    );
  } else {
    Content = (
      <MintH2HCompletedStatus
        gateway={gateway}
        lockTxUrl={lockTxUrl}
        lockAmount={lockAmountFormatted}
        mintAmount={mintAmountFormatted}
        mintTxUrl={mintTxUrl}
      />
    );
  }
  return (
    <>
      {Content}
      <TransactionRecoveryModal gateway={gateway} recoveryMode={recoveryMode} />
      {renVMSubmitter.errorSubmitting && (
        <SubmitErrorDialog
          open={true}
          error={renVMSubmitter.errorSubmitting}
          onAction={renVMSubmitter.handleReset}
        />
      )}
      <Debug
        it={{
          recoveryMode,
          count: gateway.transactions.count(),
          inSetupApprovalSubmitter,
          inSetupApprovalTxMeta,
          gatewayInSubmitter,
          gatewayInTxMeta,
          renVMSubmitter,
          renVMTxMeta,
          outSubmitter,
          outTxMeta,
        }}
      />
    </>
  );
};
