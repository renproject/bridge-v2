import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
import { PaperContent } from "../../../../components/layout/Paper";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import { GeneralErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { GatewayFees } from "../../components/GatewayFees";
import { GatewayLoaderStatus } from "../../components/GatewayHelpers";
import { getGatewayParams, useGatewayFeesWithRates } from "../../gatewayHooks";
import { useSharedGateway } from "../../gatewaySlice";
import {
  useChainTransactionStatusUpdater,
  useRenVMChainTransactionStatusUpdater,
} from "../../gatewayTransactionHooks";
import { GatewayPaperHeader } from "../shared/GatewayNavigationHelpers";
import {
  MintH2HLockTransactionProgressStatus,
  MintH2HLockTransactionStatus,
  MintH2HMintTransactionProgressStatus,
} from "./MintH2HStatuses";

export const MintH2HProcess: FunctionComponent<RouteComponentProps> = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const [sharedGateway] = useSharedGateway();
  const gateway = sharedGateway || (window as any).gateway || null;
  // gateway.inSetup is accepted;
  console.log("gateway", gateway);
  return (
    <>
      <GatewayPaperHeader title={"Mint"} />
      {gateway === null && (
        <PaperContent bottomPadding>
          <GatewayLoaderStatus />
          <GeneralErrorDialog
            open={true}
            reason={"Failed to load gateway"}
            error={`gateway: ${null}`}
            actionText={t("mint.back-to-home")}
            onAction={() => history.push({ pathname: paths.HOME })}
          />
        </PaperContent>
      )}
      {gateway !== null && <MintH2HProcessor gateway={gateway} />}
      <Debug it={{}} />
    </>
  );
};

type MintH2HProcessorProps = {
  gateway: Gateway;
};

const MintH2HProcessor: FunctionComponent<MintH2HProcessorProps> = ({
  gateway,
}) => {
  const { asset, from, to, amount } = getGatewayParams(gateway);
  const fees = useGatewayFeesWithRates(gateway, amount);

  const { outputAmount, outputAmountUsd } = fees;

  const [approvalUrl, setApprovalUrl] = useState("");
  useEffect(() => {
    try {
      const url = gateway.fromChain.transactionExplorerLink(
        gateway.inSetup.approval.progress.transaction!
      );
      if (url) {
        setApprovalUrl(url);
      }
    } finally {
      setApprovalUrl("");
    }
  }, [gateway, gateway.inSetup.approval.progress.transaction]);

  const [transaction, setTransaction] = useState<GatewayTransaction | null>(
    null
  );
  useEffect(() => {
    const getFirstTx = async () => {
      const tx = await gateway.transactions.first();
      if (tx) {
        setTransaction(tx);
      }
    };
    getFirstTx().finally();
  }, [gateway.transactions]);

  const inSetupMeta = useChainTransactionStatusUpdater(
    Object.values(gateway.inSetup)[0]
  );
  const gatewayInTxMeta = useChainTransactionStatusUpdater(gateway.in);
  const lockTxMeta = useChainTransactionStatusUpdater(transaction?.in);
  const renVmTxMeta = useRenVMChainTransactionStatusUpdater(transaction?.renVM);
  const mintTxMeta = useChainTransactionStatusUpdater(transaction?.out);

  const {
    confirmations: lockConfirmations,
    target: lockTargetConfirmations,
    status: lockStatus,
  } = gatewayInTxMeta;
  const { status: renVMStatus } = renVmTxMeta;
  const {
    status: mintStatus,
    confirmations: mintConfirmations,
    target: mintTargetConfirmations,
  } = mintTxMeta;

  const Fees = (
    <GatewayFees
      asset={asset}
      from={from}
      to={to}
      {...fees}
      needsApproval={true}
      approved={true}
      approvalTxUrl={approvalUrl}
    />
  );

  let Content = null;
  if (lockStatus === null) {
    Content = (
      <MintH2HLockTransactionStatus
        gateway={gateway}
        Fees={Fees}
        outputAmount={outputAmount}
        outputAmountUsd={outputAmountUsd}
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
      />
    );
  } else {
    <span>all done</span>;
  }
  return (
    <>
      {Content}
      <Debug
        it={{
          count: gateway.transactions.count(),
          approvalUrl,
          inSetupMeta,
          gatewayInTxMeta,
          lockTxMeta,
          renVmTxMeta,
          mintTxMeta,
        }}
      />
    </>
  );
};
