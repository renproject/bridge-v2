import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import {
  usePaperTitle,
  useSetPaperTitle,
} from "../../../../providers/TitleProviders";
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
  useTxRecovery,
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

  const hasRenVMHash = Boolean(renVMHash);
  const hasPartialTx = Boolean(partialTxString);
  const partialTx = usePartialTxMemo(partialTxString);

  const { gateway, transactions, recoverLocalTx, error } = useGateway(
    { asset, from, to, amount, toAddress },
    { chains: gatewayChains, partialTx }
  );
  useSetGatewayContext(gateway);

  const [recoveryMode] = useState(hasRenVMHash || hasPartialTx);
  const { persistLocalTx } = useTxsStorage();

  const { recoveringError } = useTxRecovery({
    gateway,
    renVMHash,
    fromAddress: account,
    recoveryMode,
    recoverLocalTx,
  });

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
            recoveryMode={recoveryMode}
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
  const history = useHistory();
  const { t } = useTranslation();
  const { asset, from, to, amount } = getGatewayParams(gateway);
  const { getUsdRate } = useGetAssetUsdRate(asset);
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
  // const { amount: burnNativeAmount } = getTransactionParams(transaction);
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
    console.info("persist", transaction);
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
  // const burnAmount = decimalsAmount(burnTxAmount, burnAssetDecimals);

  const renVmSubmitter = useChainTransactionSubmitter({
    tx: transaction?.renVM,
    autoSubmit:
      burnStatus === ChainTransactionStatus.Done &&
      isTxSubmittable(transaction?.renVM),
    attempts: 4,
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
    console.info("persisting final tx", transaction);
    if (transaction !== null && isCompleted) {
      persistLocalTx(account, transaction, true);
    }
  }, [transaction, persistLocalTx, account, isCompleted]);

  const submittingDisabled = recoveryMode
    ? !isTxSubmittable(transaction?.in) || recoveryMode
    : !isTxSubmittable(transaction?.in || gateway.in);

  useSetCurrentTxHash(transaction?.hash);

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
    const releaseAmountFormatted =
      decimalsAmount(releaseAmount, releaseAssetDecimals) || outputAmount;
    const releaseAmountUsd = getUsdRate(releaseAmountFormatted);
    Content = (
      <ReleaseStandardBurnProgressStatus
        gateway={gateway}
        Fees={Fees}
        burnStatus={burnStatus}
        burnAmount={decimalsAmount(burnAmount, burnAssetDecimals)}
        burnConfirmations={burnConfirmations}
        burnTargetConfirmations={burnTargetConfirmations}
        releaseAmount={releaseAmountFormatted}
        releaseAmountUsd={releaseAmountUsd}
        renVMStatus={renVMStatus}
        // releaseStatus={releaseStatus}
      />
    );
  } else if (releaseStatus !== ChainTransactionStatus.Reverted) {
    Content = (
      <ReleaseStandardCompletedStatus
        gateway={gateway}
        burnTxUrl={burnTxUrl}
        burnAmount={decimalsAmount(burnAmount, burnAssetDecimals)}
        releaseTxUrl={releaseTxUrl}
        releaseAmount={decimalsAmount(releaseAmount, releaseAssetDecimals)}
        // releaseStatus={releaseStatus}
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
