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
  const [shouldResolveAccounts] = useState(Boolean(!renVMHash));

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
  // TODO: getting toAddress from url may lead to problems, better decode it from renVM
  const { asset, from, to, amount, toAddress: toAddressParam } = gatewayParams;
  const { renVMHash } = additionalParams;

  const [gatewayChains] = useState(pickChains(allChains, from, to));

  const { account: fromAccountWallet } = useWallet(from);
  // TODO: warnings
  const toAddress = toAccount || toAddressParam;
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

  const [recoveringTx, setRecoveringTx] = useState(false);
  const [, setRecoveringError] = useState<Error | null>(null);
  const { persistLocalTx, findLocalTx } = useTxsStorage();
  const { showNotification } = useNotifications();
  useEffect(() => {
    if (renVMHash && fromAddress && gateway !== null && !recoveringTx) {
      setRecoveringTx(true);
      console.log("recovering tx: " + trimAddress(renVMHash));
      const localTx = findLocalTx(fromAddress, renVMHash);
      if (localTx === null) {
        console.error(`Unable to find tx for ${fromAddress}, ${renVMHash}`);
        return;
      } else {
        recoverLocalTx(renVMHash, localTx)
          .then(() => {
            showNotification(`Transaction ${renVMHash} recovered.`, {
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
    fromAddress,
    renVMHash,
    recoveringTx,
    findLocalTx,
    gateway,
    recoverLocalTx,
  ]);

  console.log("gateway", gateway);
  (window as any).gateway = gateway;
  (window as any).transactions = transactions;

  // const transaction = useGatewayFirstTransaction(gateway);
  const transaction = transactions[0] || null;
  (window as any).transaction = transaction;

  return (
    <>
      <GatewayPaperHeader title="Release" />
      {Boolean(parseError) && (
        <GeneralErrorDialog
          open={true}
          reason={parseError}
          alternativeActionText={t("navigation.back-to-start-label")}
          onAlternativeAction={() => history.push({ pathname: paths.RELEASE })}
        />
      )}
      {gateway === null && (
        <PCW>
          <GatewayLoaderStatus />
        </PCW>
      )}
      {gateway !== null && (
        <ReleaseH2HProcessor
          gateway={gateway}
          transaction={transaction}
          fromAccount={fromAddress}
          persistLocalTx={persistLocalTx}
          recoveringTx={recoveringTx}
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
          fromAddress,
          toAddress,
          renVMHash,
          gatewayParams,
        }}
      />
    </>
  );
};

type ReleaseStandardProcessorProps = {
  gateway: Gateway;
  transaction: GatewayTransaction | null;
  persistLocalTx: LocalTxPersistor;
  fromAccount: string;
  recoveringTx?: boolean;
};

const ReleaseH2HProcessor: FunctionComponent<ReleaseStandardProcessorProps> = ({
  gateway,
  fromAccount,
  persistLocalTx,
  recoveringTx,
  transaction,
}) => {
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

  useEffect(() => {
    if (fromAccount && transaction !== null) {
      persistLocalTx(fromAccount, transaction);
    }
  }, [persistLocalTx, fromAccount, submittingBurnDone, transaction]);

  const gatewayInTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.in || gateway.in,
    startTrigger: submittingBurnDone || recoveringTx,
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
    startTrigger: renVmSubmitter.submittingDone || recoveringTx,
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
    startTrigger: outSubmitter.submittingDone || recoveringTx,
    debugLabel: "out",
  });
  const {
    status: releaseStatus,
    confirmations: releaseConfirmations,
    target: releaseTargetConfirmations,
    txUrl: releaseTxUrl,
  } = outTxMeta;

  const { connected: fromConnected } = useWallet(from);

  const isCompleted = releaseTxUrl !== null;

  useEffect(() => {
    console.log("persisting final tx", transaction, releaseTxUrl);
    if (transaction !== null && isCompleted) {
      persistLocalTx(fromAccount, transaction, true);
    }
  }, [persistLocalTx, fromAccount, isCompleted, transaction]);

  let Content = null;
  if (renVMStatus === null) {
    if (!fromConnected) {
      Content = (
        <PCW>
          <ConnectWalletPaperSection chain={from} />
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
          recoveringTx,
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
