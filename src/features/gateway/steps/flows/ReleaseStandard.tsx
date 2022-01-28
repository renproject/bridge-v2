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
import {
  usePaperTitle,
  useSetPaperTitle,
} from "../../../../providers/TitleProviders";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { getAssetConfig } from "../../../../utils/tokensConfig";
import {
  ErrorDialog,
  GeneralErrorDialog,
} from "../../../transactions/components/TransactionsHelpers";
import { ConnectWalletPaperSection } from "../../../wallet/components/WalletHelpers";
import {
  useCurrentChainWallet,
  useSyncWalletChain,
} from "../../../wallet/walletHooks";
import { GatewayFees } from "../../components/GatewayFees";
import { GatewayLoaderStatus } from "../../components/GatewayHelpers";
import {
  getGatewayParams,
  useGateway,
  useGatewayFeesWithRates,
} from "../../gatewayHooks";
import {
  useChainTransactionStatusUpdater,
  useChainTransactionSubmitter,
  useGatewayFirstTransaction,
  useRenVMChainTransactionStatusUpdater,
} from "../../gatewayTransactionHooks";
import { parseGatewayQueryString } from "../../gatewayUtils";
import { GatewayPaperHeader } from "../shared/GatewayNavigationHelpers";
import {
  ReleaseStandardBurnProgressStatus,
  ReleaseStandardBurnStatus,
} from "./ReleaseStandardStatuses";

export const ReleaseStandardProcess: FunctionComponent<RouteComponentProps> = ({
  location,
  history,
}) => {
  const { t } = useTranslation();

  const [paperTitle] = usePaperTitle();

  const { gatewayParams, error: parseError } = parseGatewayQueryString(
    location.search
  );
  const { asset, from, to, amount, toAddress } = gatewayParams;
  useSyncWalletChain(from);
  const { connected, provider } = useCurrentChainWallet();
  const { gateway, transactions } = useGateway(
    { asset, from, to, amount, toAddress },
    provider,
    true
  );
  console.log("gateway", gateway);
  (window as any).gateway = gateway;
  (window as any).transactions = transactions;

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
        {!connected && <ConnectWalletPaperSection />}
        {connected && !gateway && <GatewayLoaderStatus />}
      </PaperContent>
      {connected && gateway !== null && (
        <ReleaseStandardProcessor gateway={gateway} />
      )}
      <Debug it={{ gatewayParams }} />
    </>
  );
};

type ReleaseStandardProcessorProps = {
  gateway: Gateway;
};

const ReleaseStandardProcessor: FunctionComponent<
  ReleaseStandardProcessorProps
> = ({ gateway }) => {
  console.log("ReleaseStandardProcessor");
  console.log(gateway);
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
  const gatewayInSubmitter = useChainTransactionSubmitter(gateway.in);
  const {
    handleSubmit,
    submitting,
    done,
    waiting,
    errorSubmitting,
    handleReset,
  } = gatewayInSubmitter;
  const gatewayInTxMeta = useChainTransactionStatusUpdater(gateway.in, false); //TODO: done
  const tx = useGatewayFirstTransaction(gateway);
  const renVmTxMeta = useRenVMChainTransactionStatusUpdater(tx?.renVM, false);
  const releaseTxMeta = useChainTransactionStatusUpdater(tx?.out, false);
  console.log(releaseTxMeta);
  const {
    status: burnStatus,
    confirmations: burnConfirmations,
    target: burnTargetConfirmations,
  } = gatewayInTxMeta;
  const { status: renVMStatus } = renVmTxMeta;
  const { error: releaseError } = releaseTxMeta; // TODO: must call submit first

  useEffect(() => {
    const handleProcess = async () => {
      if (!tx) {
        console.log("tx: no tx, aborting");
        return;
      }
      try {
        console.log("tx: in waiting");
        await tx.in.wait();
        console.log("tx: renVM submitting");
        await tx.renVM.submit();
        console.log("tx: renVM waiting");
        await tx.renVM.wait();
        if (tx.out.submit) {
          console.log("tx: out submitting");
          await tx.out.submit();
        }
        console.log("tx: out waiting");
        await tx.out.wait();
      } catch (e) {
        console.log("tx: err", e);
      }
    };
    handleProcess().finally();
  }, [tx]);

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
        errorSubmitting={errorSubmitting}
      />
    );
  } else {
    // if (releaseStatus === null && renVMStatus === null) {
    Content = (
      <ReleaseStandardBurnProgressStatus
        gateway={gateway}
        transaction={tx}
        Fees={Fees}
        burnStatus={burnStatus}
        outputAmount={outputAmount}
        outputAmountUsd={outputAmountUsd}
        burnConfirmations={burnConfirmations}
        burnTargetConfirmations={burnTargetConfirmations}
        renVMStatus={renVMStatus}
      />
    );
  }

  return (
    <>
      {Content}
      <Debug
        it={{
          gatewayInSubmitter,
          gatewayInTxMeta,
          renVmTxMeta,
          releaseTxMeta,
          error: releaseTxMeta.error,
        }}
      />
    </>
  );
};
