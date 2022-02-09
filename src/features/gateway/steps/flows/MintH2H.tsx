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
import {
  getGatewayParams,
  useChainAssetDecimals,
  useGatewayFeesWithRates,
} from "../../gatewayHooks";
import { useSharedGateway } from "../../gatewaySlice";
import {
  useChainTransactionStatusUpdater,
  useRenVMChainTransactionStatusUpdater,
} from "../../gatewayTransactionHooks";
import { GatewayPaperHeader } from "../shared/GatewayNavigationHelpers";
import {
  MintH2HCompletedStatus,
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
            actionText={t("navigation.back-to-home-label")}
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

  const inSetupMeta = useChainTransactionStatusUpdater({
    tx: Object.values(gateway.inSetup)[0],
  });
  // TODO: solana
  const gatewayInTxMeta = useChainTransactionStatusUpdater({ tx: gateway.in });
  const lockTxMeta = useChainTransactionStatusUpdater({ tx: transaction?.in });
  const renVmTxMeta = useRenVMChainTransactionStatusUpdater({
    tx: transaction?.renVM,
  });
  const mintTxMeta = useChainTransactionStatusUpdater({ tx: transaction?.out });

  const {
    confirmations: lockConfirmations,
    target: lockTargetConfirmations,
    status: lockStatus,
    txUrl: lockTxUrl,
  } = gatewayInTxMeta;
  const { status: renVMStatus, amount: mintAmount } = renVmTxMeta;
  const {
    status: mintStatus,
    confirmations: mintConfirmations,
    target: mintTargetConfirmations,
    txUrl: mintTxUrl,
  } = mintTxMeta;

  const { decimals: mintAssetDecimals } = useChainAssetDecimals(
    gateway.toChain,
    asset
  );

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
