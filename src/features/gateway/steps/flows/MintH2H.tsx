import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { PaperContent } from "../../../../components/layout/Paper";
import { Link } from "../../../../components/links/Links";
import { LabelWithValue } from "../../../../components/typography/TypographyHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import { useNotifications } from "../../../../providers/Notifications";
import { trimAddress } from "../../../../utils/strings";
import {
  alterContractChainProviderSigner,
  PartialChainInstanceMap,
  pickChains,
} from "../../../chain/chainUtils";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import { useTxsStorage } from "../../../storage/storageHooks";
import {
  GeneralErrorDialog,
  SubmitErrorDialog,
} from "../../../transactions/components/TransactionsHelpers";
import { ConnectWalletPaperSection } from "../../../wallet/components/WalletHelpers";
import { useSyncWalletChain, useWallet } from "../../../wallet/walletHooks";
import { $wallet } from "../../../wallet/walletSlice";
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
  MintH2HCompletedStatus,
  MintH2HLockTransactionProgressStatus,
  MintH2HMintTransactionProgressStatus,
} from "./MintH2HStatuses";

export const MintH2HProcess: FunctionComponent<RouteComponentProps> = ({
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
  // const [shouldResolveAccounts] = useState(true);

  const handleChainsResolved = useCallback(
    (resolvedFromAccount: string, resolvedToAccount: string) => {
      setFromAccount(resolvedFromAccount);
      setToAccount(resolvedToAccount);
    },
    []
  );

  console.log(fromAccount, toAccount, parseError);
  const accountsResolved = fromAccount && toAccount;

  // useEffect(() => {
  //   // resolve accounts for recovering transactions
  // }, [shouldResolveAccounts]);

  // resolve accounts for new transactions
  if (shouldResolveAccounts && !accountsResolved) {
    return (
      <H2HAccountsResolver
        transactionType="mint"
        from={from}
        to={to}
        onResolved={handleChainsResolved}
      />
    );
  }
  return (
    <MintH2HGatewayProcess
      location={location}
      fromAccount={fromAccount}
      toAccount={toAccount}
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
  const allChains = useCurrentNetworkChains();
  const { t } = useTranslation();

  // TODO: this should come from partent component
  const {
    gatewayParams,
    additionalParams,
    // error: parseError, // TODO: handle parsing error
  } = parseGatewayQueryString(location.search);
  const { asset, from, to, amount, toAddress } = gatewayParams;
  const [gatewayChains, setGatewayChains] = useState(
    pickChains(allChains, from, to)
  );

  const { gateway, transactions, recoverLocalTx, error } = useGateway(
    {
      asset,
      from,
      to,
      amount,
      toAddress: toAccount || toAddress,
    },
    {
      chains: gatewayChains,
    }
  );

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

  const transaction = transactions[0] || null;
  (window as any).gateway = gateway;
  (window as any).transaction = transaction;

  useEffect(() => {
    if (transaction !== null && fromAccount) {
      persistLocalTx(fromAccount, transaction);
    }
  }, [persistLocalTx, fromAccount, transaction]);

  // gateway.inSetup is accepted;
  console.log("gateway", gateway);
  return (
    <>
      <GatewayPaperHeader title={"Mint"} />
      {gateway === null && (
        <PaperContent bottomPadding>
          <GatewayLoaderStatus />
        </PaperContent>
      )}
      {gateway !== null && (
        <MintH2HProcessor
          gateway={gateway}
          transaction={transaction}
          recoveringTx={recovering}
          updateChains={setGatewayChains}
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
  recoveringTx?: boolean;
  updateChains?: (chains: PartialChainInstanceMap) => void;
};

const MintH2HProcessor: FunctionComponent<MintH2HProcessorProps> = ({
  gateway,
  transaction,
  recoveringTx,
  updateChains,
}) => {
  const allChains = useCurrentNetworkChains();
  const { t } = useTranslation();
  const { asset, from, to, amount, toAddress } = getGatewayParams(gateway);
  const fees = useGatewayFeesWithRates(gateway, amount || 0);

  const { outputAmount, outputAmountUsd } = fees;

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
    startTrigger: submittingApprovalDone || recoveringTx,
  });

  const { status: approvalStatus, txUrl: approvalUrl } = inSetupApprovalTxMeta;
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

  const gatewayInTxMeta = useChainTransactionStatusUpdater({
    tx: gateway.in, // keep attached to transaction
    startTrigger: submittingLockDone || recoveringTx,
    debugLabel: "in",
  });
  const {
    confirmations: lockConfirmations,
    target: lockTargetConfirmations,
    status: lockStatus,
    txUrl: lockTxUrl,
  } = gatewayInTxMeta;

  const renVMSubmitter = useChainTransactionSubmitter({
    tx: transaction?.renVM,
    autoSubmit:
      lockStatus === ChainTransactionStatus.Done &&
      isTxSubmittable(transaction?.renVM),
    debugLabel: "renVM",
  });
  const renVMTxMeta = useRenVMChainTransactionStatusUpdater({
    tx: transaction?.renVM,
    startTrigger: renVMSubmitter.submittingDone,
    debugLabel: "renVM",
  });
  const { status: renVMStatus, amount: mintAmount } = renVMTxMeta;

  // wallet provider start
  const activeChain = renVMStatus !== null ? to : from;
  useSyncWalletChain(activeChain);
  const { connected, provider } = useWallet(activeChain);
  useEffect(() => {
    console.log("chains changed from", activeChain);
    if (provider && connected) {
      alterContractChainProviderSigner(allChains, activeChain, provider);
      if (updateChains) {
        updateChains(pickChains(allChains, from, to));
      }
    }
  }, [allChains, activeChain, provider, connected, from, to, updateChains]);

  const { chain } = useSelector($wallet);
  const { connected: toConnected } = useWallet(to);
  const showSwitchWalletDialog =
    renVMStatus !== null && !toConnected && chain !== to;

  // const chains = useCurrentNetworkChains();
  // useEffect(() => {
  //   if (toProvider && chain === to) {
  //     alterEthereumBaseChainProviderSigner(chains, toProvider, true, chain);
  //   }
  // }, [chains, toProvider, chain, to]);
  // wallet provider end

  const outSubmitter = useChainTransactionSubmitter({
    tx: transaction?.out,
    debugLabel: "out",
    autoSubmit: recoveringTx,
  });

  const {
    handleSubmit: handleSubmitMint,
    submitting: submittingMint,
    // submittingDone: submittingMintDone,
    waiting: waitingMint,
    done: doneMint,
    errorSubmitting: errorSubmittingMint,
    handleReset: handleResetMint,
  } = outSubmitter;

  const outTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.out,
    debugLabel: "out",
    startTrigger: outSubmitter.submittingDone,
  });
  const {
    status: mintStatus,
    confirmations: mintConfirmations,
    target: mintTargetConfirmations,
    txUrl: mintTxUrl,
  } = outTxMeta;

  const { decimals: mintAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.toChain,
    asset
  );

  const Fees = (
    <GatewayFees asset={asset} from={from} to={to} {...fees}>
      <LabelWithValue
        label={t("fees.assets-contracts-label")}
        value={
          approvalUrl !== null ? (
            <Link href={approvalUrl} color="primary" external>
              {t("fees.assets-contracts-approved")}
            </Link>
          ) : (
            t("fees.assets-contracts-need-approval")
          )
        }
      />
    </GatewayFees>
  );

  const {
    account: fromAddress,
    connected: fromConnected,
    provider: fromProvider,
  } = useWallet(from);

  let Content = null;
  if (approvalStatus !== ChainTransactionStatus.Done && !recoveringTx) {
    if (!fromConnected) {
      Content = (
        <PCW>
          <ConnectWalletPaperSection chain={from} account={fromAddress} />
        </PCW>
      );
    } else {
      Content = (
        <PaperContent bottomPadding>
          <span>from/to accounts should be here from created gateway</span>
          <ActionButtonWrapper>
            <ActionButton
              onClick={handleSubmitApproval}
              disabled={submittingApproval}
            >
              {submittingApproval
                ? "Approving Accounts & Contracts..."
                : "Approve Accounts & Contracts"}
            </ActionButton>
          </ActionButtonWrapper>
        </PaperContent>
      );
    }
  } else if (renVMStatus === null) {
    //in case of failing, submit helpers must be here
    Content = (
      <MintH2HLockTransactionProgressStatus
        gateway={gateway}
        transaction={transaction}
        Fees={Fees}
        outputAmount={outputAmount}
        outputAmountUsd={outputAmountUsd}
        lockConfirmations={lockConfirmations}
        lockTargetConfirmations={lockTargetConfirmations}
        lockStatus={lockStatus}
        onSubmit={handleSubmitLock}
        submitting={submittingLock}
        waiting={waitingLock}
        done={doneLock}
        errorSubmitting={errorSubmittingLock}
        onReset={handleResetLock}
      />
    );
  } else if (mintTxUrl === null) {
    Content = (
      <MintH2HMintTransactionProgressStatus
        gateway={gateway}
        transaction={transaction}
        Fees={Fees}
        outputAmount={outputAmount}
        outputAmountUsd={outputAmountUsd}
        renVMStatus={renVMStatus}
        mintAmount={mintAmount}
        mintConfirmations={mintConfirmations}
        mintTargetConfirmations={mintTargetConfirmations}
        mintStatus={mintStatus}
        onSubmit={handleSubmitMint}
        submitting={submittingMint}
        waiting={waitingMint}
        done={doneMint}
        errorSubmitting={errorSubmittingMint}
        onReset={handleResetMint}
      />
    );
  } else {
    Content = (
      <MintH2HCompletedStatus
        gateway={gateway}
        lockTxUrl={lockTxUrl}
        mintAmount={mintAmount}
        mintAssetDecimals={mintAssetDecimals}
        mintTxUrl={mintTxUrl}
      />
    );
  }
  return (
    <>
      {Content}
      <SwitchWalletDialog open={showSwitchWalletDialog} targetChain={to} />
      {renVMSubmitter.errorSubmitting && (
        <SubmitErrorDialog
          open={true}
          error={renVMSubmitter.errorSubmitting}
          onAction={renVMSubmitter.handleReset}
        />
      )}
      <Debug
        it={{
          recoveringTx,
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
