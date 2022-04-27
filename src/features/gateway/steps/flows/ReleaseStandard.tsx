import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import { useNotifications } from "../../../../providers/Notifications";
import {
  usePaperTitle,
  useSetPaperTitle,
} from "../../../../providers/TitleProviders";
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
import { useSetCurrentTxHash } from "../../../transactions/transactionsHooks";
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
  useSetGatewayContext,
} from "../../gatewayHooks";
import {
  isTxSubmittable,
  updateRenVMHashParam,
  useChainTransactionStatusUpdater,
  useChainTransactionSubmitter,
  usePartialTxMemo,
  useRenVMChainTransactionStatusUpdater,
} from "../../gatewayTransactionHooks";
import { parseGatewayQueryString } from "../../gatewayUtils";
import {
  GatewayPaperHeader,
  TransactionRecoveryModal,
} from "../shared/GatewayNavigationHelpers";
import {
  ReleaseStandardBurnProgressStatus,
  ReleaseStandardBurnStatus,
  ReleaseStandardCompletedStatus,
} from "./ReleaseStandardStatuses";

export const ReleaseStandardProcess: FunctionComponent<RouteComponentProps> = ({
  location,
  history,
}) => {
  const { t } = useTranslation();

  const [paperTitle] = usePaperTitle();

  const {
    gatewayParams,
    additionalParams,
    error: parseError,
  } = parseGatewayQueryString(location.search);
  const { asset, from, to, amount, toAddress } = gatewayParams;
  const { renVMHash, partialTxString } = additionalParams;
  useSyncWalletChain(from);
  const { connected, account, provider } = useWallet(from);

  const allChains = useCurrentNetworkChains();
  const [gatewayChains] = useState(pickChains(allChains, from, to));

  useEffect(() => {
    if (provider) {
      alterContractChainProviderSigner(allChains, from, provider);
    }
  }, [from, allChains, provider]);

  const partialTx = usePartialTxMemo(partialTxString);
  const hasPartialTx = Boolean(partialTx);

  const { gateway, transactions, recoverLocalTx, error } = useGateway(
    { asset, from, to, amount, toAddress },
    { chains: gatewayChains, partialTx }
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
      account &&
      gateway !== null &&
      !recoveringStarted
    ) {
      setRecoveringStarted(true);
      console.log("recovering tx" + trimAddress(renVMHash));
      const localTx = findLocalTx(account, renVMHash);
      if (localTx === null) {
        console.error(`Unable to find tx for ${account}, ${renVMHash}`);
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
    account,
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
      <GatewayPaperHeader title={paperTitle} />
      {!connected && (
        <PCW>
          <ConnectWalletPaperSection />
        </PCW>
      )}
      {connected && !gateway && (
        <PCW>
          <GatewayLoaderStatus />
        </PCW>
      )}
      {connected && gateway !== null && (
        <>
          <ReleaseStandardProcessor
            gateway={gateway}
            transaction={transaction}
            account={account}
            persistLocalTx={persistLocalTx}
            recoveryMode={recoveringStarted || hasPartialTx}
          />
        </>
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
          partialTx,
          gatewayParams,
          recoveryMode,
          renVMHash,
        }}
      />
    </>
  );
};

type ReleaseStandardProcessorProps = {
  gateway: Gateway;
  transaction: GatewayTransaction | null;
  account: string;
  persistLocalTx: LocalTxPersistor;
  recoveryMode?: boolean;
};

const ReleaseStandardProcessor: FunctionComponent<
  ReleaseStandardProcessorProps
> = ({ gateway, transaction, account, persistLocalTx, recoveryMode }) => {
  console.log("ReleaseStandardProcessor");
  console.log(gateway);
  const history = useHistory();
  const { t } = useTranslation();
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

  const { decimals: burnAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.fromChain,
    gateway.params.asset
  );

  const { decimals: releaseAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.toChain,
    gateway.params.asset
  );

  const { outputAmount, outputAmountUsd } = fees;
  const gatewayInSubmitter = useChainTransactionSubmitter({
    tx: transaction?.in || gateway.in,
    debugLabel: "gatewayIn",
  });

  const {
    handleSubmit,
    submitting,
    done,
    submittingDone,
    waiting,
    errorSubmitting,
    handleReset,
  } = gatewayInSubmitter;

  // TODO: DRY
  useEffect(() => {
    console.log("persist", transaction);
    if (account && transaction !== null && transaction.hash) {
      persistLocalTx(account, transaction);
      updateRenVMHashParam(history, transaction.hash);
    }
  }, [history, persistLocalTx, account, transaction, transaction?.hash]);

  const gatewayInTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.in || gateway.in,
    startTrigger: submittingDone || recoveryMode,
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
      isTxSubmittable(transaction?.renVM),
    debugLabel: "renVM",
  });

  const renVmTxMeta = useRenVMChainTransactionStatusUpdater({
    tx: transaction?.renVM,
    startTrigger: renVmSubmitter.submittingDone || recoveryMode,
    debugLabel: "renVM",
  });
  const { status: renVMStatus, amount: releaseAmount } = renVmTxMeta;

  // TODO: looks like outSubmitter is not required
  const outSubmitter = useChainTransactionSubmitter({
    tx: transaction?.out,
    autoSubmit:
      renVMStatus === ChainTransactionStatus.Done &&
      isTxSubmittable(transaction?.out),
    debugLabel: "out",
  });
  const outTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.out,
    debugLabel: "out",
    // startTrigger: outSubmitter.submittingDone, //TODO: not required?
  });
  const {
    // error: releaseError,
    status: releaseStatus,
    txUrl: releaseTxUrl,
  } = outTxMeta;

  //TODO: DRY
  const isCompleted = releaseTxUrl !== null;
  useEffect(() => {
    console.log("persisting final tx", transaction);
    if (transaction !== null && isCompleted) {
      persistLocalTx(account, transaction, true);
    }
  }, [transaction, persistLocalTx, account, isCompleted]);

  const submittingDisabled = recoveryMode
    ? !isTxSubmittable(transaction?.in) || recoveryMode
    : !isTxSubmittable(transaction?.in || gateway.in);

  useSetCurrentTxHash(transaction?.hash);
  useSetGatewayContext(gateway);

  let Content = null;
  if (burnStatus === null || burnStatus === ChainTransactionStatus.Ready) {
    Content = (
      <ReleaseStandardBurnStatus
        gateway={gateway}
        Fees={Fees}
        burnStatus={burnStatus}
        outputAmount={outputAmount}
        outputAmountUsd={outputAmountUsd}
        onSubmit={handleSubmit}
        onReset={handleReset}
        done={done}
        waiting={waiting}
        submitting={submitting}
        submittingDisabled={submittingDisabled}
        errorSubmitting={errorSubmitting}
        account={account}
      />
    );
  } else if (
    burnStatus === ChainTransactionStatus.Confirming ||
    releaseStatus === null
  ) {
    Content = (
      <ReleaseStandardBurnProgressStatus
        gateway={gateway}
        Fees={Fees}
        burnStatus={burnStatus}
        outputAmount={outputAmount}
        outputAmountUsd={outputAmountUsd}
        burnConfirmations={burnConfirmations}
        burnTargetConfirmations={burnTargetConfirmations}
        renVMStatus={renVMStatus}
        // releaseStatus={releaseStatus}
      />
    );
  } else if (releaseStatus !== ChainTransactionStatus.Reverted) {
    Content = (
      <ReleaseStandardCompletedStatus
        gateway={gateway}
        burnTxUrl={burnTxUrl}
        burnAmount={burnAmount}
        burnAssetDecimals={burnAssetDecimals}
        // releaseStatus={releaseStatus}
        releaseTxUrl={releaseTxUrl}
        releaseAmount={releaseAmount}
        releaseAssetDecimals={releaseAssetDecimals}
      />
    );
  }

  return (
    <>
      {Content}
      <TransactionRecoveryModal gateway={gateway} recoveryMode={recoveryMode} />
      <Debug
        it={{
          recoveryMode,
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
