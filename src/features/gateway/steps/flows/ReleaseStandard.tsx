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
import {
  alterContractChainProviderSigner,
  PartialChainInstanceMap,
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
import {
  GatewayLocationState,
  useGatewayLocationState,
} from "../gatewayRoutingUtils";
import { GatewayPaperHeader } from "../shared/GatewayNavigationHelpers";
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
  useSyncWalletChain(from);
  const { connected, account, provider } = useWallet(from);

  const allChains = useCurrentNetworkChains();
  const [chains, setChains] = useState<PartialChainInstanceMap | null>(null);
  useEffect(() => {
    if (provider) {
      alterContractChainProviderSigner(allChains, from, provider, true);
      const gatewayChains = pickChains(allChains, from, to);
      setChains(gatewayChains);
    }
  }, [from, to, allChains, provider]);

  const { gateway, transactions, recoverLocalTx } = useGateway(
    { asset, from, to, amount, toAddress },
    { chains }
  );

  const [recoveringTx, setRecoveringTx] = useState(false);
  const [recoveringError, setRecoveringError] = useState<Error | null>(null);
  const { renVMHash } = additionalParams;
  const { renVMHashDetected, renVMHashReplaced } = useGatewayLocationState();
  const [reloading, setReloading] = useState(false);
  useEffect(() => {
    if (renVMHash && (!renVMHashDetected || renVMHashReplaced)) {
      setReloading(true);
      setRecoveringTx(false);
    }
    const timeout = setTimeout(() => {
      setReloading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [renVMHash, renVMHashReplaced, renVMHashDetected]);
  const { showNotification } = useNotifications();

  useEffect(() => {
    if (renVMHashDetected) {
      showNotification(
        `Please keep this page opened or bookmark it until transaction is finished.`,
        { variant: "warning" }
      );
    }
  }, [renVMHashDetected, showNotification]);

  const { persistLocalTx, findLocalTx } = useTxsStorage();

  useEffect(() => {
    if (
      renVMHash &&
      account &&
      gateway !== null &&
      !recoveringTx &&
      !renVMHashDetected
    ) {
      setRecoveringTx(true);
      console.log("recovering tx");
      const localTx = findLocalTx(account, renVMHash);
      if (localTx === null) {
        console.error(`Unable to find tx for ${account}, ${renVMHash}`);
        return;
      } else {
        recoverLocalTx(renVMHash, localTx)
          .then(() => {
            showNotification(`Transaction recovered.`, {
              variant: "success",
            });
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
    showNotification,
    account,
    renVMHash,
    renVMHashDetected,
    recoveringTx,
    findLocalTx,
    gateway,
    recoverLocalTx,
  ]);

  const transaction = transactions[0] || null;

  (window as any).gateway = gateway;
  (window as any).transactions = transactions;

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
          {reloading ? (
            <PCW>
              <GatewayLoaderStatus />
            </PCW>
          ) : (
            <ReleaseStandardProcessor
              gateway={gateway}
              transaction={transaction}
              account={account}
              persistLocalTx={persistLocalTx}
              recoveringTx={recoveringTx}
            />
          )}
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
      <Debug
        it={{
          gatewayParams,
          recoveringTx,
          renVMHash,
          renVMHashDetected,
          renVMHashReplaced,
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
  recoveringTx?: boolean;
};

const ReleaseStandardProcessor: FunctionComponent<
  ReleaseStandardProcessorProps
> = ({ gateway, transaction, account, persistLocalTx, recoveringTx }) => {
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

  useEffect(() => {
    console.log("persist", transaction);
    if (transaction !== null && transaction.hash) {
      persistLocalTx(account, transaction);
      const params = new URLSearchParams(history.location.search);
      const renVMHashTx = transaction.hash;
      const renVMHashParam = (params as any).renVMHash;
      console.log("renVMHash param", renVMHashTx, params);
      if (renVMHashTx !== renVMHashParam) {
        console.log(
          "renVMHash param replacing",
          history.location.search,
          renVMHashTx
        );
        params.set("renVMHash", renVMHashTx);
        history.replace({
          search: params.toString(),
          state: {
            renVMHashDetected: true,
          } as GatewayLocationState,
        });
      }
    }
  }, [history, persistLocalTx, account, transaction, transaction?.hash]);

  (window as any).transaction = transaction;

  const gatewayInTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.in || gateway.in,
    startTrigger: submittingDone || recoveringTx,
    debugLabel: "gatewayIn",
  });
  const {
    status: burnStatus,
    confirmations: burnConfirmations,
    target: burnTargetConfirmations,
    txUrl: burnTxUrl,
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
    startTrigger: renVmSubmitter.submittingDone || recoveringTx,
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

  useEffect(() => {
    console.log("persisting final tx", transaction, releaseTxUrl);
    if (transaction !== null && releaseTxUrl !== null) {
      persistLocalTx(account, transaction, true);
    }
  }, [persistLocalTx, account, releaseTxUrl, transaction]);

  // useEffect(() => {
  //   console.log("tx: persist changed", persistLocalTx);
  // }, [persistLocalTx]);

  // useEffect(() => {
  //   console.log("tx: tx changed", tx);
  // }, [tx]);

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
        submittingDisabled={!isTxSubmittable(transaction?.in)}
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
      <Debug
        it={{
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
