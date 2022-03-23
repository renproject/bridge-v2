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
import { PaperContent } from "../../../../components/layout/Paper";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import { useNotifications } from "../../../../providers/Notifications";
import { useSetPaperTitle } from "../../../../providers/TitleProviders";
import { getAssetConfig } from "../../../../utils/assetsConfig";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { trimAddress } from "../../../../utils/strings";
import { pickChains } from "../../../chain/chainUtils";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import { LocalTxPersistor, useTxsStorage } from "../../../storage/storageHooks";
import { GeneralErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { ConnectWalletPaperSection } from "../../../wallet/components/WalletHelpers";
import { useWallet } from "../../../wallet/walletHooks";
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
import { H2HAccountsResolver } from "../shared/WalletSwitchHelpers";
import {
  ReleaseH2HBurnProgressStatus,
  ReleaseH2HBurnStatus,
} from "./ReleaseH2HStatuses";

export const ReleaseH2HProcess: FunctionComponent<RouteComponentProps> = ({
  location,
  ...rest
}) => {
  const {
    gatewayParams,
    additionalParams,
    error: parseError, // TODO: handle parsing error
  } = parseGatewayQueryString(location.search);
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
      location={location}
      fromAccount={fromAccount}
      toAccount={toAccount}
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
> = ({ location, history, fromAccount, toAccount }) => {
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

  const { account: fromAccountWallet, connected: fromConnected } =
    useWallet(from);
  // TODO: warnings
  const toAddress = toAccount || toAddressParam;
  const fromAddress = fromAccount || fromAccountWallet;

  const { gateway, transactions, recoverLocalTx } = useGateway(
    {
      asset,
      from,
      to,
      amount,
      toAddress: toAddress,
    },
    { chains: gatewayChains }
  );

  const [recovering, setRecovering] = useState(false);
  const [, setRecoveringError] = useState<Error | null>(null);
  const { persistLocalTx, findLocalTx } = useTxsStorage();
  const { showNotification } = useNotifications();
  useEffect(() => {
    if (renVMHash && fromAddress && gateway !== null && !recovering) {
      setRecovering(true);
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
      <GatewayPaperHeader title="Release" />
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
        {!fromConnected && <ConnectWalletPaperSection chain={from} />}
        {fromConnected && !gateway && <GatewayLoaderStatus />}
      </PaperContent>
      {fromConnected && gateway !== null && (
        <ReleaseH2HProcessor
          gateway={gateway}
          transaction={transaction}
          fromAccount={fromAddress}
          persistLocalTx={persistLocalTx}
          recoveringTx={recovering}
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
