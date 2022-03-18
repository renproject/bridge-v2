import { Box, Typography } from "@material-ui/core";
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
  ChainInstanceMap,
  PartialChainInstanceMap,
} from "../../../chain/chainUtils";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import { useTxsStorage } from "../../../storage/storageHooks";
import {
  GeneralErrorDialog,
  SubmitErrorDialog,
} from "../../../transactions/components/TransactionsHelpers";
import { useWallet } from "../../../wallet/walletHooks";
import { $wallet } from "../../../wallet/walletSlice";
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
  H2HAccountsResolver,
  OnAccountsInitiatedParams,
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
  const { from, to } = gatewayParams;
  const { renVMHash } = additionalParams;
  const [chains, setChains] = useState<ChainInstanceMap | null>(null);
  const [fromAccount, setFromAccount] = useState<string>("");
  const [toAccount, setToAccount] = useState<string>("");
  const [resolvingChains] = useState(Boolean(!renVMHash));
  const [chainsResolved, setChainsResolved] = useState(false);
  const allChains = useCurrentNetworkChains();
  const [initialChains] = useState<PartialChainInstanceMap | null>({
    [from]: allChains[from],
    [to]: allChains[to],
  });
  const handleChainsResolved = useCallback(() => {
    setChainsResolved(true);
  }, []);

  const handleChainsInitiated = useCallback(
    ({
      fromAccount,
      toAccount,
      fromChain,
      toChain,
    }: OnAccountsInitiatedParams) => {
      setChains({
        [from]: fromChain,
        [to]: toChain,
      } as ChainInstanceMap);
      setFromAccount(fromAccount);
      setToAccount(toAccount);
    },
    [from, to]
  );

  console.log(fromAccount, toAccount, parseError);
  // resolve chains here
  if (resolvingChains && !chainsResolved) {
    return (
      <>
        <GatewayPaperHeader title={"Choose accounts"} />
        <PaperContent bottomPadding>
          <Box mt={1} mb={1}>
            <Typography variant="h6" align="center">
              Choose which accounts are you going to use for Mint operation
            </Typography>
          </Box>
          <H2HAccountsResolver
            transactionType="mint"
            chains={initialChains}
            from={from}
            to={to}
            onResolved={handleChainsResolved}
            onInitiated={handleChainsInitiated}
          />
          <ActionButtonWrapper>
            <ActionButton onClick={handleChainsResolved}>
              Accept Accounts
            </ActionButton>
          </ActionButtonWrapper>
        </PaperContent>
      </>
    );
  }
  return (
    <MintH2HGatewayProcess chains={chains} location={location} {...rest} />
  );
};

type MintH2HGatewayProcessProps = RouteComponentProps & {
  chains: ChainInstanceMap | null;
};

export const MintH2HGatewayProcess: FunctionComponent<
  MintH2HGatewayProcessProps
> = ({ history, location, chains }) => {
  const { t } = useTranslation();

  // TODO: this should come from partent component
  const {
    gatewayParams,
    additionalParams,
    // error: parseError, // TODO: handle parsing error
  } = parseGatewayQueryString(location.search);
  const { asset, from, to, amount } = gatewayParams;
  const {
    account: fromAccount,
    // connected: fromConnected,
    // provider: fromProvider,
  } = useWallet(from);

  const { gateway, transactions, recoverLocalTx, error } = useGateway(
    {
      asset,
      from,
      to,
      amount,
    },
    {
      chains,
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
};

const MintH2HProcessor: FunctionComponent<MintH2HProcessorProps> = ({
  gateway,
  transaction,
  recoveringTx,
}) => {
  const { t } = useTranslation();
  const { asset, from, to, amount } = getGatewayParams(gateway);
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
    tx: transaction?.in || gateway.in,
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

  const recovering = true;
  const outTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.out,
    debugLabel: "out",
    startTrigger: outSubmitter.submittingDone || recovering,
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

  let Content = null;
  if (approvalStatus !== ChainTransactionStatus.Done && !recoveringTx) {
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
