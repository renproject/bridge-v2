import { Button } from "@material-ui/core";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { MultipleActionButtonWrapper } from "../../../../components/buttons/Buttons";
import { PaperContent } from "../../../../components/layout/Paper";
import { Link } from "../../../../components/links/Links";
import { LabelWithValue } from "../../../../components/typography/TypographyHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import {
  GeneralErrorDialog,
  SubmitErrorDialog,
} from "../../../transactions/components/TransactionsHelpers";
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
import {
  MintH2HCompletedStatus,
  MintH2HLockTransactionProgressStatus,
  MintH2HLockTransactionStatus,
  MintH2HMintTransactionProgressStatus,
} from "./MintH2HStatuses";

export const MintH2HProcess: FunctionComponent<RouteComponentProps> = ({
  history,
  location,
}) => {
  const { t } = useTranslation();

  const {
    gatewayParams,
    additionalParams,
    error: parseError,
  } = parseGatewayQueryString(location.search);
  const { asset, from, to, amount } = gatewayParams;
  const {
    account: fromAccount,
    connected: fromConnected,
    provider: fromProvider,
  } = useWallet(from);
  const {
    account: toAccount,
    connected: toConnected,
    provider: toProvider,
  } = useWallet(to);

  const { gateway, transactions, recoverLocalTx, error } = useGateway(
    {
      asset,
      from,
      to,
      amount,
    },
    {
      provider: fromProvider,
      autoTeardown: true,
      autoProviderAlteration: false,
    }
  );
  const transaction = transactions[0] || null;

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
        <MintH2HProcessor gateway={gateway} transaction={transaction} />
      )}
      {error !== null && (
        <GeneralErrorDialog
          open={true}
          reason={"Failed to load gateway"}
          error={`gateway: ${null}`}
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
  const fees = useGatewayFeesWithRates(gateway, amount);

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
    startTrigger: submittingApprovalDone,
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
    errorSubmitting: errorSubmittingLock,
    handleReset: handleResetLock,
  } = gatewayInSubmitter;

  const gatewayInTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.in || gateway.in,
    debugLabel: "in",
    startTrigger: submittingLockDone || recoveringTx,
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

  // const handleSubmitBoth = useCallback(async () => {
  //   await renVMSubmitter.handleSubmit();
  //   await outSubmitter.handleSubmit();
  // }, [renVMSubmitter, outSubmitter]);

  const { status: renVMStatus, amount: mintAmount } = renVMTxMeta;

  const outSubmitter = useChainTransactionSubmitter({ tx: transaction?.out });
  const {
    handleSubmit: handleSubmitMint,
    handleReset: handleResetMint,
    submitting: submittingMint,
    submittingDone: submittingMintDone,
    done: doneMint,
    waiting: waitingMint,
    errorSubmitting: errorSubmittingMint,
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

  let Content = null;
  if (approvalStatus !== ChainTransactionStatus.Done) {
    Content = (
      <Button onClick={handleSubmitApproval} disabled={submittingApproval}>
        Approve
      </Button>
    );
  } else if (lockStatus === null) {
    Content = (
      <MintH2HLockTransactionStatus
        gateway={gateway}
        Fees={Fees}
        outputAmount={outputAmount}
        outputAmountUsd={outputAmountUsd}
        onSubmit={handleSubmitLock}
        submitting={submittingLock}
      />
    );
  } else if (mintStatus === null && renVMStatus === null) {
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
      />
    );
  } else if (mintStatus !== ChainTransactionStatus.Done) {
    Content = (
      <MintH2HMintTransactionProgressStatus
        gateway={gateway}
        transaction={transaction}
        Fees={Fees}
        outputAmount={outputAmount}
        outputAmountUsd={outputAmountUsd}
        renVMStatus={renVMStatus}
        mintConfirmations={mintConfirmations}
        mintTargetConfirmations={mintTargetConfirmations}
        mintStatus={mintStatus}
        done={doneMint}
        onReset={handleResetMint}
        onSubmit={handleSubmitMint}
        submitting={submittingMint}
        waiting={waitingMint}
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
