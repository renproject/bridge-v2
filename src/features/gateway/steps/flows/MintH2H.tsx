import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, { FunctionComponent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { PaperContent } from "../../../../components/layout/Paper";
import { Link } from "../../../../components/links/Links";
import { LabelWithValue } from "../../../../components/typography/TypographyHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import { GeneralErrorDialog } from "../../../transactions/components/TransactionsHelpers";
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
  useChainTransactionStatusUpdater,
  useChainTransactionSubmitter,
  useRenVMChainTransactionStatusUpdater,
} from "../../gatewayTransactionHooks";
import { parseGatewayQueryString } from "../../gatewayUtils";
import { TxApprovalButton } from "../GatewayFeesStep";
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
};

const MintH2HProcessor: FunctionComponent<MintH2HProcessorProps> = ({
  gateway,
  transaction,
}) => {
  const { t } = useTranslation();
  const { asset, from, to, amount } = getGatewayParams(gateway);
  const fees = useGatewayFeesWithRates(gateway, amount);

  const { outputAmount, outputAmountUsd } = fees;

  const inSetupMeta = useChainTransactionStatusUpdater({
    tx: Object.values(gateway.inSetup)[0],
    debugLabel: "inSetup",
  });

  // TODO: solana

  const gatewayInSubmitter = useChainTransactionSubmitter({
    tx: transaction?.in || gateway.in,
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
    tx: gateway.in,
    debugLabel: "in",
  });

  const {
    confirmations: lockConfirmations,
    target: lockTargetConfirmations,
    status: lockStatus,
    txUrl: lockTxUrl,
  } = gatewayInTxMeta;

  const renVmTxMeta = useRenVMChainTransactionStatusUpdater({
    tx: transaction?.renVM,
    debugLabel: "renVM",
  });
  const { status: renVMStatus, amount: mintAmount } = renVmTxMeta;

  const mintTxMeta = useChainTransactionStatusUpdater({
    tx: transaction?.out,
    debugLabel: "out",
  });

  const {
    status: mintStatus,
    confirmations: mintConfirmations,
    target: mintTargetConfirmations,
    txUrl: mintTxUrl,
  } = mintTxMeta;

  const { decimals: mintAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.toChain,
    asset
  );

  const handleApproved = useCallback(() => {
    setApproved(true);
  }, [gateway]);

  const [approved, setApproved] = useState(false);

  const Fees = (
    <GatewayFees asset={asset} from={from} to={to} {...fees}>
      <LabelWithValue
        label={t("fees.assets-contracts-label")}
        value={
          approved ? (
            <Link href={"https://todo.url"} color="primary" external>
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
  if (!approved) {
    Content = (
      <TxApprovalButton tx={gateway.inSetup.approval} onDone={handleApproved} />
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
          inSetupMeta,
          gatewayInTxMeta,
          renVmTxMeta,
          mintTxMeta,
        }}
      />
    </>
  );
};
