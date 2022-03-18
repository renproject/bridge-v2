import { Button } from "@material-ui/core";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, {
  FunctionComponent,
  useCallback,
  useDebugValue,
  useEffect,
  useState,
} from "react";
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
import { trimAddress } from "../../../../utils/strings";
import { getAssetConfig } from "../../../../utils/assetsConfig";
import { alterEthereumBaseChainsProviderSigner } from "../../../chain/chainUtils";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import { LocalTxPersistor, useTxsStorage } from "../../../storage/storageHooks";
import { GeneralErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { ConnectWalletPaperSection } from "../../../wallet/components/WalletHelpers";
import {
  useCurrentChain,
  useCurrentChainWallet,
  useWallet,
} from "../../../wallet/walletHooks";
import { setChain, setPickerOpened } from "../../../wallet/walletSlice";
import { GatewayFees } from "../../components/GatewayFees";
import { GatewayLoaderStatus } from "../../components/GatewayHelpers";
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
  const { asset, from, to, amount } = gatewayParams;

  // provider fun start
  const [activeChain, setActiveChain] = useState(from);
  const toggleActiveChain = useCallback(() => {
    setActiveChain(activeChain === from ? to : from);
  }, [activeChain, from, to]);
  useEffect(() => {
    dispatch(setChain(activeChain));
  }, [dispatch, activeChain]);

  const { account: fromAccount, connected: fromConnected } = useWallet(from);
  const { account: toAccount, connected: toConnected } = useWallet(to);

  const { provider, connected } = useCurrentChainWallet();

  const chains = useCurrentNetworkChains();
  const chain = useCurrentChain();
  useEffect(() => {
    if (activeChain !== chain) {
      dispatch(setChain(activeChain));
      dispatch(setPickerOpened(true));
    }
  }, [dispatch, activeChain, chain]);

  useEffect(() => {
    if (connected) {
      // TODO: finish
      alterEthereumBaseChainsProviderSigner(chains, chain, provider);
    }
  }, [chains, chain, provider, connected]);
  // provider fun end

  const { gateway, transactions, recoverLocalTx } = useGateway(
    {
      asset,
      from,
      to,
      amount,
    },
    { chains }
  );

  useDebugValue(gateway);
  useDebugValue(transactions);

  useEffect(() => {
    console.log("changed: provider", provider);
  }, [provider]);

  useEffect(() => {
    console.log("changed: gateway", gateway);
  }, [gateway]);

  useEffect(() => {
    console.log("changed: transactions", transactions);
  }, [transactions]);

  useEffect(() => {
    console.log("changed: gateway.transactions", gateway?.transactions);
  }, [gateway?.transactions]);

  const { renVMHash } = additionalParams;
  const [recovering, setRecovering] = useState(false);
  const [, setRecoveringError] = useState<Error | null>(null);
  const { persistLocalTx, findLocalTx } = useTxsStorage();
  const { showNotification } = useNotifications();
  useEffect(() => {
    if (renVMHash && fromAccount && gateway !== null && !recovering) {
      setRecovering(true);
      console.log("recovering tx: " + trimAddress(renVMHash));
      const localTx = findLocalTx(fromAccount, renVMHash);
      if (localTx === null) {
        console.error(`Unable to find tx for ${fromAccount}, ${renVMHash}`);
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

  const transaction = transactions[0] || null;

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
        {!fromConnected && <ConnectWalletPaperSection />}
        {fromConnected && !gateway && <GatewayLoaderStatus />}
      </PaperContent>
      <Button color="primary" onClick={toggleActiveChain}>
        Switch to {activeChain === from ? to : from}
      </Button>
      {fromConnected && gateway !== null && (
        <ReleaseH2HProcessor
          gateway={gateway}
          transaction={transaction}
          fromAccount={fromAccount}
          persistLocalTx={persistLocalTx}
          recoveringTx={recovering}
        />
      )}
      <Debug
        it={{
          chain,
          activeChain,
          fromConnected,
          fromAccount,
          toConnected,
          toAccount,
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
    tx: gateway.in,
    debugLabel: "in",
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

  (window as any).tx = transaction;
  (window as any).gateway = gateway;

  useEffect(() => {
    if (submittingBurnDone && transaction !== null && fromAccount) {
      persistLocalTx(fromAccount, transaction);
    }
  }, [persistLocalTx, fromAccount, submittingBurnDone, transaction]);

  (window as any).tx = transaction;
  const gatewayInTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.in || gateway.in,
    startTrigger: submittingBurnDone || recoveringTx,
    debugLabel: "in",
  });
  const {
    status: burnStatus,
    confirmations: burnConfirmations,
    target: burnTargetConfirmations,
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
    startTrigger: renVmSubmitter.submittingDone,
    debugLabel: "renVM",
  });
  const { status: renVMStatus, amount: releaseAmount } = renVmTxMeta;
  const { decimals: releaseAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.toChain,
    gateway.params.asset
  );

  const outSubmitter = useChainTransactionSubmitter({
    tx: transaction?.out,
    autoSubmit:
      renVMStatus === ChainTransactionStatus.Done && // TODO: crit check this, shouldn't be automatic
      isTxSubmittable(transaction?.out),
    debugLabel: "out",
  });
  const outTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.out,
    startTrigger: outSubmitter.submittingDone,
    debugLabel: "out",
  });
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
