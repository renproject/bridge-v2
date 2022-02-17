import { Gateway } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router";
import { PaperContent } from "../../../../components/layout/Paper";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import { useNotifications } from "../../../../providers/Notifications";
import {
  usePaperTitle,
  useSetPaperTitle,
} from "../../../../providers/TitleProviders";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { getAssetConfig } from "../../../../utils/tokensConfig";
import { LocalTxPersistor, useTxsStorage } from "../../../storage/storageHooks";
import { GeneralErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { ConnectWalletPaperSection } from "../../../wallet/components/WalletHelpers";
import { useCurrentChainWallet, useWallet } from "../../../wallet/walletHooks";
import { setChain, setPickerOpened } from "../../../wallet/walletSlice";
import { GatewayFees } from "../../components/GatewayFees";
import { GatewayLoaderStatus } from "../../components/GatewayHelpers";
import {
  getGatewayParams,
  useChainAssetDecimals,
  useGateway,
  useGatewayFeesWithRates,
} from "../../gatewayHooks";
import {
  isTxSubmittable,
  useChainTransactionStatusUpdater,
  useChainTransactionSubmitter,
  useGatewayFirstTransaction,
  useRenVMChainTransactionStatusUpdater,
} from "../../gatewayTransactionHooks";
import { parseGatewayQueryString } from "../../gatewayUtils";
import { GatewayPaperHeader } from "../shared/GatewayNavigationHelpers";
import {
  ReleaseH2HBurnProgressStatus,
  ReleaseH2HBurnStatus,
} from "./ReleaseH2HStatuses";

export const ReleaseH2HProcess: FunctionComponent<RouteComponentProps> = ({
  location,
  history,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [paperTitle] = usePaperTitle();

  const {
    gatewayParams,
    additionalParams,
    error: parseError,
  } = parseGatewayQueryString(location.search);
  const { asset, from, to, amount, toAddress } = gatewayParams;
  useEffect(() => {
    // initial chain
    dispatch(setChain(from));
  }, [dispatch, from]);
  const { account: fromAccount, connected } = useWallet(from);

  const { provider } = useCurrentChainWallet();
  const { gateway, transactions, recoverLocalTx } = useGateway(
    {
      asset,
      from,
      to,
      amount,
      toAddress,
    },
    { provider, autoTeardown: true }
  );

  const { renVMHash } = additionalParams;
  const [recovering, setRecovering] = useState(false);
  const [recoveringError, setRecoveringError] = useState<Error | null>(null);
  const { persistLocalTx, findLocalTx } = useTxsStorage();
  const { showNotification } = useNotifications();
  useEffect(() => {
    if (renVMHash && fromAccount && gateway !== null && !recovering) {
      setRecovering(true);
      console.log("recovering tx");
      const localTx = findLocalTx(fromAccount, renVMHash);
      if (localTx === null) {
        console.error(`Unable to find tx for ${fromAccount}, ${renVMHash}`);
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
    fromAccount,
    renVMHash,
    recovering,
    findLocalTx,
    gateway,
    recoverLocalTx,
  ]);

  console.log("gateway", gateway);
  (window as any).gateway = gateway;
  (window as any).transactions = transactions;

  return (
    <>
      <GatewayPaperHeader title={paperTitle} />
      <PaperContent>
        {Boolean(parseError) && (
          <GeneralErrorDialog
            open={true}
            reason={parseError}
            alternativeActionText={t("navigation.back-to-start-label")}
            onAlternativeAction={() =>
              history.push({ pathname: paths.RELEASE })
            }
          />
        )}
        {!connected && <ConnectWalletPaperSection />}
        {connected && !gateway && <GatewayLoaderStatus />}
      </PaperContent>
      {connected && gateway !== null && (
        <ReleaseH2HProcessor
          gateway={gateway}
          fromAccount={fromAccount}
          persistLocalTx={persistLocalTx}
          recoveringTx={recovering}
        />
      )}
      <Debug it={{ renVMHash, fromAccount, gatewayParams }} />
    </>
  );
};

type ReleaseStandardProcessorProps = {
  gateway: Gateway;
  persistLocalTx: LocalTxPersistor;
  fromAccount: string;
  recoveringTx?: boolean;
};

const ReleaseH2HProcessor: FunctionComponent<ReleaseStandardProcessorProps> = ({
  gateway,
  fromAccount,
  persistLocalTx,
  recoveringTx,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
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

  const gatewayInSubmitter = useChainTransactionSubmitter({ tx: gateway.in });

  const {
    handleSubmit: handleSubmitBurn,
    submitting: submittingBurn,
    done: doneBurn,
    submittingDone: submittingBurnDone,
    waiting: waitingBurn,
    errorSubmitting: errorSubmittingBurn,
    handleReset: handleResetBurn,
  } = gatewayInSubmitter;

  const tx = useGatewayFirstTransaction(gateway);

  useEffect(() => {
    if (submittingBurnDone && tx !== null && fromAccount) {
      persistLocalTx(fromAccount, tx);
    }
  }, [persistLocalTx, fromAccount, submittingBurnDone, tx]);

  (window as any).tx = tx;
  const gatewayInTxMeta = useChainTransactionStatusUpdater({
    tx: tx?.in || gateway.in,
    startTrigger: submittingBurnDone || recoveringTx,
    debugLabel: "gatewayIn",
  });
  const {
    status: burnStatus,
    confirmations: burnConfirmations,
    target: burnTargetConfirmations,
  } = gatewayInTxMeta;

  const activeChain = burnStatus === ChainTransactionStatus.Done ? to : from;
  const { connected: fromConnected } = useWallet(from);
  const { connected: toConnected, account: toAccount } = useWallet(to);

  useEffect(() => {
    if (activeChain !== from) {
      dispatch(setChain(activeChain));
      dispatch(setPickerOpened(true));
    }
  }, [dispatch, activeChain, from]);

  const renVmSubmitter = useChainTransactionSubmitter({
    tx: tx?.renVM,
    autoSubmit:
      burnStatus === ChainTransactionStatus.Done &&
      isTxSubmittable(tx?.renVM) &&
      toConnected,
    debugLabel: "renVM",
  });

  const renVmTxMeta = useRenVMChainTransactionStatusUpdater({
    tx: tx?.renVM,
    startTrigger: renVmSubmitter.submittingDone,
    debugLabel: "renVMUpdater",
  });
  const { status: renVMStatus, amount: releaseAmount } = renVmTxMeta;
  const { decimals: releaseAssetDecimals } = useChainAssetDecimals(
    gateway.toChain,
    gateway.params.asset
  );

  const outSubmitter = useChainTransactionSubmitter({
    tx: tx?.out,
    autoSubmit: renVMStatus === ChainTransactionStatus.Done,
  });
  const outTxMeta = useChainTransactionStatusUpdater({ tx: tx?.out });
  const { txUrl: releaseTxUrl } = outTxMeta;

  let Content = null;
  if (burnStatus === null || burnStatus === ChainTransactionStatus.Ready) {
    Content = (
      <ReleaseH2HBurnStatus
        gateway={gateway}
        Fees={Fees}
        burnStatus={burnStatus}
        outputAmount={outputAmount}
        outputAmountUsd={outputAmountUsd}
        onSubmit={handleSubmitBurn}
        onReset={handleResetBurn}
        done={doneBurn}
        waiting={waitingBurn}
        submitting={submittingBurn}
        errorSubmitting={errorSubmittingBurn}
      />
    );
  } else if (
    burnStatus === ChainTransactionStatus.Confirming ||
    releaseTxUrl === null
  ) {
    Content = (
      <ReleaseH2HBurnProgressStatus
        gateway={gateway}
        Fees={Fees}
        burnStatus={burnStatus}
        outputAmount={outputAmount}
        outputAmountUsd={outputAmountUsd}
        burnConfirmations={burnConfirmations}
        burnTargetConfirmations={burnTargetConfirmations}
        renVMStatus={renVMStatus}
        onReset={() => {}}
        onSubmit={() => {}}
        submitting
        waiting
        done
      />
    );
  }

  return (
    <>
      {Content}
      <Debug
        it={{
          activeChain,
          fromConnected,
          toConnected,
          fromAccount,
          toAccount,
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
