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
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import { useSetPaperTitle } from "../../../../providers/TitleProviders";
import { getAssetConfig } from "../../../../utils/assetsConfig";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { decimalsAmount } from "../../../../utils/numbers";
import {
  alterContractChainProviderSigner,
  pickChains,
} from "../../../chain/chainUtils";
import { useGetAssetUsdRate } from "../../../marketData/marketDataHooks";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import { LocalTxPersistor, useTxsStorage } from "../../../storage/storageHooks";
import {
  GeneralErrorDialog,
  TxRecoveryErrorDialog,
} from "../../../transactions/components/TransactionsHelpers";
import { useSetCurrentTxHash } from "../../../transactions/transactionsHooks";
import { useSyncWalletChain, useWallet } from "../../../wallet/walletHooks";
import { GatewayFees } from "../../components/GatewayFees";
import { GatewayLoaderStatus } from "../../components/GatewayHelpers";
import { PCW } from "../../components/PaperHelpers";
import {
  GatewayIOType,
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
import { H2HAccountsResolver } from "../shared/WalletSwitchHelpers";
import {
  ReleaseH2HBurnTransactionStatus,
  ReleaseH2HCompletedStatus,
  ReleaseH2HReleaseTransactionStatus,
} from "./ReleaseH2HStatuses";

export const ReleaseH2HProcess: FunctionComponent<RouteComponentProps> = ({
  location,
  match,
  ...rest
}) => {
  const isMoveRoute = match.path === paths.BRIDGE_GATEWAY;
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
        transactionType="release"
        from={from}
        to={to}
        onResolved={handleAccountsResolved}
      />
    );
  }
  return (
    <ReleaseH2HGatewayProcess
      fromAccount={fromAccount}
      toAccount={toAccount}
      moveMode={isMoveRoute}
      location={location}
      match={match}
      {...rest}
    />
  );
};

type ReleaseH2HGatewayProcessProps = RouteComponentProps & {
  fromAccount: string;
  toAccount: string;
  moveMode?: boolean;
};

const ReleaseH2HGatewayProcess: FunctionComponent<
  ReleaseH2HGatewayProcessProps
> = ({ history, location, fromAccount, toAccount, moveMode }) => {
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
    { chains: gatewayChains, partialTx }
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

  useSetCurrentTxHash(transaction?.hash);

  return (
    <>
      <GatewayPaperHeader title="Release" />

      {gateway === null && (
        <PCW>
          <GatewayLoaderStatus />
        </PCW>
      )}
      {gateway !== null && (
        <ReleaseH2HProcessor
          persistLocalTx={persistLocalTx}
          gateway={gateway}
          transaction={transaction}
          fromAccount={fromAddress}
          toAccount={toAddress}
          recoveryMode={recoveryMode}
          moveMode={moveMode}
        />
      )}
      {Boolean(parseError) && (
        <GeneralErrorDialog
          open={true}
          reason={parseError}
          alternativeActionText={t("navigation.back-to-start-label")}
          onAlternativeAction={() => history.push({ pathname: paths.RELEASE })}
        />
      )}
      {Boolean(recoveringError) && (
        <TxRecoveryErrorDialog
          open={true}
          error={recoveringError}
          alternativeActionText={t("navigation.back-to-start-label")}
          onAlternativeAction={() => history.push({ pathname: paths.RELEASE })}
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
      <Debug
        it={{
          isRecoveringTx: recoveryMode,
          fromAddress,
          toAddress,
          renVMHash,
          gatewayParams,
        }}
      />
    </>
  );
};

type ReleaseH2HProcessorProps = {
  gateway: Gateway;
  transaction: GatewayTransaction | null;
  persistLocalTx: LocalTxPersistor;
  fromAccount: string;
  toAccount: string;
  recoveryMode?: boolean;
  moveMode?: boolean;
};

const ReleaseH2HProcessor: FunctionComponent<ReleaseH2HProcessorProps> = ({
  gateway,
  transaction,
  fromAccount,
  toAccount,
  persistLocalTx,
  recoveryMode,
  moveMode,
}) => {
  const ioType = moveMode
    ? GatewayIOType.burnAndMint
    : GatewayIOType.burnAndRelease;
  const history = useHistory();
  const { t } = useTranslation();
  const allChains = useCurrentNetworkChains();
  const { asset, from, to, amount } = getGatewayParams(gateway);
  const { getUsdRate } = useGetAssetUsdRate(asset);
  const assetConfig = getAssetConfig(asset);
  const burnChainConfig = getChainConfig(from);
  const releaseChainConfig = getChainConfig(to);

  const { decimals: releaseAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.toChain,
    gateway.params.asset
  );

  const { decimals: burnAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.fromChain,
    gateway.params.asset
  );

  useSetPaperTitle(
    moveMode
      ? t("move.move-asset-from-to-title", {
          asset: assetConfig.shortName,
          from: burnChainConfig.shortName,
          to: releaseChainConfig.shortName,
        })
      : t("release.release-asset-from-title", {
          asset: assetConfig.shortName,
          chain: burnChainConfig.shortName,
        })
  );
  const fees = useGatewayFeesWithRates(gateway, amount);
  const Fees = <GatewayFees asset={asset} from={from} to={to} {...fees} />;
  const { outputAmount, outputAmountUsd } = fees;

  const gatewayInSubmitter = useChainTransactionSubmitter({
    tx: transaction?.in || gateway.in,
    debugLabel: "gatewayIn",
  });

  const {
    handleSubmit: handleSubmitBurn,
    submitting: submittingBurn,
    done: doneBurn,
    submittingDone: submittingBurnDone,
    waiting: waitingBurn,
    errorSubmitting: errorSubmittingBurn,
    handleReset: handleResetBurn,
  } = gatewayInSubmitter;

  //TODO: DRY
  useEffect(() => {
    if (fromAccount && transaction !== null) {
      persistLocalTx(fromAccount, transaction);
      const params = new URLSearchParams(history.location.search);
      const renVMHashTx = transaction.hash;
      const renVMHashParam = (params as any).renVMHash;
      console.info("renVMHash param", renVMHashTx, params);
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
    submittingBurnDone,
    transaction,
    toAccount,
  ]);

  const gatewayInTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.in || gateway.in,
    startTrigger: submittingBurnDone || recoveryMode,
    debugLabel: "gatewayIn",
  });
  const {
    status: burnStatus,
    confirmations: burnConfirmations,
    target: burnTargetConfirmations,
    txUrl: burnTxUrl,
    amount: burnAmount,
  } = gatewayInTxMeta;

  const renVmSubmitter = useChainTransactionSubmitter({
    tx: transaction?.renVM,
    autoSubmit:
      burnStatus === ChainTransactionStatus.Done &&
      isTxSubmittable(transaction?.renVM), // this may not be truthy when recovering
    attempts: 4,
    debugLabel: "renVM",
  });

  const renVmTxMeta = useRenVMChainTransactionStatusUpdater({
    tx: transaction?.renVM,
    startTrigger: renVmSubmitter.submittingDone || recoveryMode,
    debugLabel: "renVM",
  });
  const { status: renVMStatus, amount: releaseAmount } = renVmTxMeta;
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
  const {
    handleSubmit: handleSubmitRelease,
    submitting: submittingRelease,
    waiting: waitingRelease,
    done: doneRelease,
    errorSubmitting: errorSubmittingRelease,
    handleReset: handleResetRelease,
  } = outSubmitter;

  const outTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.out,
    startTrigger:
      outSubmitter.submittingDone || recoveryMode || !transaction?.out?.submit,
    debugLabel: "out",
  });
  const {
    status: releaseStatus,
    confirmations: releaseConfirmations,
    target: releaseTargetConfirmations,
    txUrl: releaseTxUrl,
  } = outTxMeta;

  const submittingReleaseDisabled =
    renVMStatus !== ChainTransactionStatus.Done ||
    !isTxSubmittable(transaction?.out);

  const { connected: fromConnected } = useWallet(from);

  //TODO: DRY
  const isCompleted = releaseTxUrl !== null;
  useEffect(() => {
    console.info("persisting final tx", transaction);
    if (transaction !== null && isCompleted) {
      persistLocalTx(fromAccount, transaction, true);
    }
  }, [persistLocalTx, fromAccount, isCompleted, transaction]);

  const burnAmountFormatted =
    decimalsAmount(burnAmount, burnAssetDecimals) || amount.toString();
  // TODO: clarify with Noah
  const releaseAmountFormatted =
    decimalsAmount(releaseAmount, releaseAssetDecimals) || outputAmount;
  const releaseAmountUsd = getUsdRate(releaseAmountFormatted);

  let Content;
  if (renVMStatus === null) {
    Content = (
      <ReleaseH2HBurnTransactionStatus
        gateway={gateway}
        Fees={Fees}
        burnAmount={burnAmountFormatted}
        burnStatus={burnStatus}
        burnConfirmations={burnConfirmations}
        burnTargetConfirmations={burnTargetConfirmations}
        releaseAmount={releaseAmountFormatted}
        releaseAmountUsd={outputAmountUsd}
        onSubmit={handleSubmitBurn}
        onReset={handleResetBurn}
        done={doneBurn}
        waiting={waitingBurn}
        submitting={submittingBurn}
        errorSubmitting={errorSubmittingBurn}
        submittingDisabled={recoveryMode} // transaction from recovery should have this step finished
        ioType={ioType}
      />
    );
  } else if (releaseTxUrl === null) {
    Content = (
      <ReleaseH2HReleaseTransactionStatus
        gateway={gateway}
        Fees={Fees}
        burnAmount={burnAmountFormatted}
        renVMStatus={renVMStatus}
        releaseStatus={releaseStatus}
        releaseAmount={releaseAmountFormatted}
        releaseAmountUsd={releaseAmountUsd}
        releaseConfirmations={releaseConfirmations}
        releaseTargetConfirmations={releaseTargetConfirmations}
        onReset={handleResetRelease}
        onSubmit={handleSubmitRelease}
        submitting={submittingRelease || !transaction?.out?.submit}
        submittingDisabled={submittingReleaseDisabled}
        waiting={waitingRelease}
        done={doneRelease}
        errorSubmitting={errorSubmittingRelease}
        ioType={ioType}
      />
    );
  } else {
    Content = (
      <ReleaseH2HCompletedStatus
        gateway={gateway}
        burnTxUrl={burnTxUrl}
        burnAmount={decimalsAmount(burnAmount, burnAssetDecimals)}
        releaseAmount={decimalsAmount(releaseAmount, releaseAssetDecimals)}
        releaseTxUrl={releaseTxUrl}
        ioType={ioType}
      />
    );
  }

  return (
    <>
      {Content}
      <TransactionRecoveryModal gateway={gateway} recoveryMode={recoveryMode} />
      <Debug
        it={{
          fromConnected,
          isRecoveringTx: recoveryMode,
          releaseAmount,
          releaseAssetDecimals,
          gatewayInSubmitter,
          gatewayInTxMeta,
          renVmSubmitter,
          renVmTxMeta,
          outSubmitter,
          outTxMeta,
          error: outTxMeta.error,
        }}
      />
    </>
  );
};
