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
import { useNotifications } from "../../../../providers/Notifications";
import { useSetPaperTitle } from "../../../../providers/TitleProviders";
import { getAssetConfig } from "../../../../utils/assetsConfig";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { trimAddress } from "../../../../utils/strings";
import {
  alterContractChainProviderSigner,
  pickChains,
} from "../../../chain/chainUtils";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import { LocalTxPersistor, useTxsStorage } from "../../../storage/storageHooks";
import { GeneralErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { ConnectWalletPaperSection } from "../../../wallet/components/WalletHelpers";
import { useSyncWalletChain, useWallet } from "../../../wallet/walletHooks";
import { GatewayFees } from "../../components/GatewayFees";
import { GatewayLoaderStatus } from "../../components/GatewayHelpers";
import { PCW } from "../../components/PaperHelpers";
import {
  getGatewayParams,
  useChainInstanceAssetDecimals,
  useGateway,
  useGatewayFeesWithRates,
} from "../../gatewayHooks";
import {
  isTxSubmittable,
  useChainTransactionStatusUpdater,
  useChainTransactionSubmitter,
  useRenVMChainTransactionStatusUpdater,
} from "../../gatewayTransactionHooks";
import { parseGatewayQueryString } from "../../gatewayUtils";
import { GatewayPaperHeader } from "../shared/GatewayNavigationHelpers";
import {
  H2HAccountsResolver,
  SwitchWalletDialog,
} from "../shared/WalletSwitchHelpers";
import {
  ReleaseH2HBurnTransactionStatus,
  ReleaseH2HCompletedStatus,
  ReleaseH2HReleaseTransactionStatus,
} from "./ReleaseH2HStatuses";

export const ReleaseH2HProcess: FunctionComponent<RouteComponentProps> = ({
  location,
  ...rest
}) => {
  const { gatewayParams, additionalParams } = parseGatewayQueryString(
    location.search
  );
  const { from, to, toAddress } = gatewayParams;
  const { renVMHash } = additionalParams;
  const [fromAccount, setFromAccount] = useState<string>("");
  const [toAccount, setToAccount] = useState<string>(toAddress || "");

  // if initial renVMHash is not present, that means new transaction
  const [shouldResolveAccounts] = useState(!Boolean(renVMHash));
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
      location={location}
      {...rest}
    />
  );
};

type ReleaseH2HGatewayProcessProps = RouteComponentProps & {
  fromAccount: string;
  toAccount: string;
};

const ReleaseH2HGatewayProcess: FunctionComponent<
  ReleaseH2HGatewayProcessProps
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
  const { renVMHash } = additionalParams;
  const [gatewayChains] = useState(pickChains(allChains, from, to));

  const { account: fromAccountWallet } = useWallet(from);
  // TODO: warnings?
  const toAddress = toAddressParam || toAccount;
  const fromAddress = fromAccount || fromAccountWallet;

  const { gateway, transactions, recoverLocalTx, error } = useGateway(
    {
      asset,
      from,
      to,
      amount,
      toAddress: toAddress,
    },
    { chains: gatewayChains }
  );

  // TODO: DRY
  const { showNotification } = useNotifications();
  const [recoveryMode] = useState(Boolean(renVMHash));
  const [recoveringStarted, setRecoveringStarted] = useState(false);
  const [recoveringError, setRecoveringError] = useState<Error | null>(null);
  const { persistLocalTx, findLocalTx } = useTxsStorage();

  useEffect(() => {
    if (
      recoveryMode &&
      renVMHash &&
      fromAddress &&
      gateway !== null &&
      !recoveringStarted
    ) {
      // this will happen only once per gateway lifecycle
      setRecoveringStarted(true);
      console.log("recovering tx: " + trimAddress(renVMHash));
      const localTx = findLocalTx(fromAddress, renVMHash);
      if (localTx === null) {
        console.error(`Unable to find tx for ${fromAddress}, ${renVMHash}`);
        return;
      } else {
        recoverLocalTx(renVMHash, localTx)
          .then(() => {
            showNotification(
              `Transaction ${trimAddress(renVMHash)} recovered.`,
              {
                variant: "success",
              }
            );
          })
          .catch((error) => {
            console.error(`Recovering error`, error.message);
            showNotification(`Failed to recover transaction`, {
              variant: "error",
            });
            setRecoveringError(error);
          });
      }
    }
  }, [
    recoveryMode,
    showNotification,
    fromAddress,
    renVMHash,
    recoveringStarted,
    findLocalTx,
    gateway,
    recoverLocalTx,
  ]);

  const transaction = transactions[0] || null;

  (window as any).gateway = gateway;
  (window as any).transactions = transactions;
  (window as any).transaction = transaction;

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
        <GeneralErrorDialog
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
};

const ReleaseH2HProcessor: FunctionComponent<ReleaseH2HProcessorProps> = ({
  gateway,
  fromAccount,
  toAccount,
  persistLocalTx,
  recoveryMode,
  transaction,
}) => {
  const history = useHistory();
  const { t } = useTranslation();
  const allChains = useCurrentNetworkChains();
  const { asset, from, to, amount } = getGatewayParams(gateway);
  const assetConfig = getAssetConfig(asset);
  const burnChainConfig = getChainConfig(from);
  useSetPaperTitle(
    t("release.release-asset-from-title", {
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
      console.log("renVMHash param", renVMHashTx, params);
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
  const { connected: toConnected } = useWallet(to);
  const showSwitchWalletDialog =
    renVMStatus !== null && !toConnected && activeChain === to;

  useEffect(() => {
    console.log("activeChain changed", activeChain);
    if (provider && connected) {
      alterContractChainProviderSigner(allChains, activeChain, provider);
    }
  }, [allChains, activeChain, provider, connected]);

  const { decimals: releaseAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.toChain,
    gateway.params.asset
  );

  const { decimals: burnAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.fromChain,
    gateway.params.asset
  );

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
    startTrigger: outSubmitter.submittingDone || recoveryMode,
    debugLabel: "out",
  });
  const {
    status: releaseStatus,
    confirmations: releaseConfirmations,
    target: releaseTargetConfirmations,
    txUrl: releaseTxUrl,
  } = outTxMeta;

  const { connected: fromConnected } = useWallet(from);

  //TODO: DRY
  const isCompleted = releaseTxUrl !== null;
  useEffect(() => {
    console.log("persisting final tx", transaction);
    if (transaction !== null && isCompleted) {
      persistLocalTx(fromAccount, transaction, true);
    }
  }, [persistLocalTx, fromAccount, isCompleted, transaction]);

  let Content = null;
  if (renVMStatus === null) {
    if (!fromConnected) {
      Content = (
        <PCW>
          <ConnectWalletPaperSection
            chain={from}
            isRecoveringTx={recoveryMode}
          />
        </PCW>
      );
    } else {
      Content = (
        <ReleaseH2HBurnTransactionStatus
          gateway={gateway}
          Fees={Fees}
          burnStatus={burnStatus}
          burnConfirmations={burnConfirmations}
          burnTargetConfirmations={burnTargetConfirmations}
          outputAmount={outputAmount}
          outputAmountUsd={outputAmountUsd}
          onSubmit={handleSubmitBurn}
          onReset={handleResetBurn}
          done={doneBurn}
          waiting={waitingBurn}
          submitting={submittingBurn}
          errorSubmitting={errorSubmittingBurn}
          submittingDisabled={recoveryMode} // transaction from recovery should have this step finished
        />
      );
    }
  } else if (releaseTxUrl === null) {
    Content = (
      <ReleaseH2HReleaseTransactionStatus
        gateway={gateway}
        Fees={Fees}
        renVMStatus={renVMStatus}
        releaseStatus={releaseStatus}
        outputAmount={outputAmount}
        outputAmountUsd={outputAmountUsd}
        releaseConfirmations={releaseConfirmations}
        releaseTargetConfirmations={releaseTargetConfirmations}
        onReset={handleResetRelease}
        onSubmit={handleSubmitRelease}
        submitting={submittingRelease}
        waiting={waitingRelease}
        done={doneRelease}
        errorSubmitting={errorSubmittingRelease}
      />
    );
  } else {
    Content = (
      <ReleaseH2HCompletedStatus
        gateway={gateway}
        burnTxUrl={burnTxUrl}
        burnAmount={burnAmount}
        releaseAssetDecimals={releaseAssetDecimals}
        burnAssetDecimals={burnAssetDecimals}
        releaseAmount={releaseAmount}
        releaseTxUrl={releaseTxUrl}
      />
    );
  }

  return (
    <>
      {Content}
      <SwitchWalletDialog
        open={!isCompleted && showSwitchWalletDialog}
        targetChain={to}
      />
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
