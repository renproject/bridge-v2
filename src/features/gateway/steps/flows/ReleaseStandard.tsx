import { Box, Button, Typography } from "@material-ui/core";
import { Gateway } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { ToggleIconButton } from "../../../../components/buttons/Buttons";
import { SeparationWrapper } from "../../../../components/catalog/PresentationHelpers";
import { BigTopWrapper } from "../../../../components/layout/LayoutHelpers";
import { PaperContent } from "../../../../components/layout/Paper";
import { Link } from "../../../../components/links/Links";
import { BridgeModal } from "../../../../components/modals/BridgeModal";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import {
  usePaperTitle,
  useSetPaperTitle,
} from "../../../../providers/TitleProviders";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { getAssetConfig } from "../../../../utils/tokensConfig";
import { useRenVMExplorerLink } from "../../../network/networkHooks";
import {
  LocalTxData,
  LocalTxPersistor,
  LocalTxRemover,
  RenVMHashTxsMap,
  useTxsStorage,
} from "../../../storage/storageHooks";
import { GeneralErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { ConnectWalletPaperSection } from "../../../wallet/components/WalletHelpers";
import {
  useCurrentChainWallet,
  useSyncWalletChain,
} from "../../../wallet/walletHooks";
import { GatewayFees } from "../../components/GatewayFees";
import { GatewayLoaderStatus } from "../../components/GatewayHelpers";
import { PCW } from "../../components/PaperHelpers";
import {
  getGatewayParams,
  TxRecoverer,
  useChainAssetDecimals,
  useGateway,
  useGatewayFeesWithRates,
} from "../../gatewayHooks";
import {
  isTxSubmittable,
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
  ReleaseStandardCompletedStatus,
} from "./ReleaseStandardStatuses";

type LocalTxEntryRemover = (renVmHash: string) => void;

type LocalTxEntryProps = {
  renVmHash: string;
  localTx: LocalTxData;
  onRecover: TxRecoverer;
  onRemove: LocalTxEntryRemover;
};

export const LocalTxEntry: FunctionComponent<LocalTxEntryProps> = ({
  onRecover,
  onRemove,
  renVmHash,
  localTx,
}) => {
  const [recovering, setRecovering] = useState(false);
  const [removing, setRemoving] = useState(false);
  const { getRenVmExplorerLink } = useRenVMExplorerLink();

  const handleRecoverTx = useCallback(async () => {
    setRecovering(true);
    await onRecover(renVmHash, localTx);
    setRecovering(false);
  }, [renVmHash, localTx, onRecover]);

  const handleRemoveTx = useCallback(() => {
    setRemoving(true);
    onRemove(renVmHash);
    setRemoving(false);
  }, [renVmHash, localTx, onRecover]);

  return (
    <Box mb={3}>
      <div>
        <Link href={getRenVmExplorerLink(renVmHash)} external color="primary">
          {renVmHash}
        </Link>
      </div>
      <SeparationWrapper>
        <Button
          size="small"
          color="primary"
          variant="contained"
          disabled={recovering}
          onClick={handleRecoverTx}
        >
          Finish tx
        </Button>
        <Button
          size="small"
          color="secondary"
          variant="contained"
          disabled={removing}
          onClick={handleRemoveTx}
        >
          Remove tx from history
        </Button>
      </SeparationWrapper>
    </Box>
  );
};

type UnfinishedLocalTxsDialogProps = {
  localTxs: RenVMHashTxsMap;
  onRecover: TxRecoverer;
  onRemove: LocalTxEntryRemover;
  onClose: () => void;
  open: boolean;
};

const UnfinishedLocalTxsDialog: FunctionComponent<
  UnfinishedLocalTxsDialogProps
> = ({ localTxs, onRecover, onRemove, open, onClose }) => {
  // const { t } = useTranslation();
  const { connected } = useCurrentChainWallet();
  const handleRecoverTx = useCallback<TxRecoverer>(
    async (txHash, localTxEntry) => {
      await onRecover(txHash, localTxEntry);
      onClose();
    },
    [onClose, onRecover]
  );

  return (
    <BridgeModal open={open} title="Unfinished transactions" onClose={onClose}>
      {!connected && (
        <BigTopWrapper>
          <Typography align="center">Please connect wallet first</Typography>
        </BigTopWrapper>
      )}
      <PaperContent topPadding bottomPadding paddingVariant="medium">
        {Object.entries(localTxs).map(([renVmHash, localTx]) => {
          return (
            <LocalTxEntry
              key={renVmHash}
              renVmHash={renVmHash}
              localTx={localTx}
              onRecover={handleRecoverTx}
              onRemove={onRemove}
            />
          );
        })}
      </PaperContent>
    </BridgeModal>
  );
};

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
  const { connected, provider, account } = useCurrentChainWallet();

  const { gateway, transactions, recoverLocalTx } = useGateway(
    { asset, from, to, amount, toAddress },
    { provider, autoTeardown: true }
  );

  const { persistLocalTx, getLocalTxsForAddress, removeLocalTx } =
    useTxsStorage();
  const handleRemoveLocalTx = useCallback<LocalTxEntryRemover>(
    (renVmHash) => {
      removeLocalTx(account, renVmHash);
    },
    [account]
  );

  const unfinishedLocalTxs = getLocalTxsForAddress(account, {
    unfinished: true,
    asset,
    to,
  });
  // const showUnfinishedTxs = Object.values(unfinishedLocalTxs).length > 0;

  console.log("gateway", gateway);
  (window as any).gateway = gateway;
  (window as any).transactions = transactions;

  const [open, setOpen] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);
  const handleToggle = useCallback(() => {
    setOpen((currentOpen) => !currentOpen);
  }, []);

  return (
    <>
      <GatewayPaperHeader title={paperTitle}>
        <ToggleIconButton
          variant="history"
          onClick={handleToggle}
          pressed={open}
        />
      </GatewayPaperHeader>
      <UnfinishedLocalTxsDialog
        localTxs={unfinishedLocalTxs}
        onRecover={recoverLocalTx}
        onRemove={handleRemoveLocalTx}
        onClose={handleClose}
        open={open}
      />
      {!connected && (
        <PCW>
          <ConnectWalletPaperSection />
        </PCW>
      )}
      {connected && !gateway && (
        <PCW>
          <GatewayLoaderStatus />
        </PCW>
      )}
      {connected && gateway !== null && (
        <ReleaseStandardProcessor
          gateway={gateway}
          account={account}
          persistLocalTx={persistLocalTx}
        />
      )}
      {Boolean(parseError) && (
        <GeneralErrorDialog
          open={true}
          reason={parseError}
          alternativeActionText={t("navigation.back-to-start-label")}
          onAlternativeAction={() => history.push({ pathname: paths.RELEASE })}
        />
      )}
      <Debug it={{ unfinishedLocalTxs, gatewayParams }} />
    </>
  );
};

type ReleaseStandardProcessorProps = {
  gateway: Gateway;
  account: string;
  persistLocalTx: LocalTxPersistor;
};

const ReleaseStandardProcessor: FunctionComponent<
  ReleaseStandardProcessorProps
> = ({ gateway, account, persistLocalTx }) => {
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
  const { decimals: releaseAssetDecimals } = useChainAssetDecimals(
    gateway.toChain,
    gateway.params.asset
  );

  const { outputAmount, outputAmountUsd } = fees;
  // TODO: this can be faulty
  const tx = useGatewayFirstTransaction(gateway);
  const gatewayInSubmitter = useChainTransactionSubmitter({
    tx: tx?.in || gateway.in,
    debugLabel: "gatewayIn",
  });

  const {
    handleSubmit,
    submitting,
    done,
    submittingDone,
    waiting,
    errorSubmitting,
    handleReset,
  } = gatewayInSubmitter;

  useEffect(() => {
    if (submittingDone && tx !== null) {
      persistLocalTx(account, tx);
    }
  }, [persistLocalTx, account, submittingDone, tx]);

  (window as any).tx = tx;

  const gatewayInTxMeta = useChainTransactionStatusUpdater({
    tx: tx?.in || gateway.in,
    startTrigger: submittingDone,
    debugLabel: "gatewayIn",
  });
  const {
    status: burnStatus,
    confirmations: burnConfirmations,
    target: burnTargetConfirmations,
    txUrl: burnTxUrl,
  } = gatewayInTxMeta;
  const renVmSubmitter = useChainTransactionSubmitter({
    tx: tx?.renVM,
    autoSubmit:
      burnStatus === ChainTransactionStatus.Done && isTxSubmittable(tx?.renVM),
    debugLabel: "renVM",
  });
  const renVmTxMeta = useRenVMChainTransactionStatusUpdater({
    tx: tx?.renVM,
    startTrigger: renVmSubmitter.submittingDone,
    debugLabel: "renVM",
  });
  const { status: renVMStatus, amount: releaseAmount } = renVmTxMeta;

  // TODO: looks like outSubmitter is not required
  const outSubmitter = useChainTransactionSubmitter({
    tx: tx?.out,
    autoSubmit:
      renVMStatus === ChainTransactionStatus.Done && isTxSubmittable(tx?.out), // never ready
    debugLabel: "out",
  });
  const outTxMeta = useChainTransactionStatusUpdater({
    tx: tx?.out,
    debugLabel: "out",
    // startTrigger: outSubmitter.submittingDone, //TODO: not required?
  });
  const {
    // error: releaseError,
    status: releaseStatus,
    txUrl: releaseTxUrl,
  } = outTxMeta;

  useEffect(() => {
    if (tx !== null && releaseTxUrl !== null) {
      persistLocalTx(account, tx, true);
    }
  }, [persistLocalTx, account, releaseTxUrl, tx]);

  useEffect(() => {
    console.log("tx: persist changed", persistLocalTx);
  }, [persistLocalTx]);

  useEffect(() => {
    console.log("tx: tx changed", tx);
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
        account={account}
      />
    );
  } else if (
    burnStatus === ChainTransactionStatus.Confirming ||
    releaseStatus === null
  ) {
    Content = (
      <ReleaseStandardBurnProgressStatus
        gateway={gateway}
        Fees={Fees}
        burnStatus={burnStatus}
        outputAmount={outputAmount}
        outputAmountUsd={outputAmountUsd}
        burnConfirmations={burnConfirmations}
        burnTargetConfirmations={burnTargetConfirmations}
        renVMStatus={renVMStatus}
        // releaseStatus={releaseStatus}
      />
    );
  } else if (releaseStatus !== ChainTransactionStatus.Reverted) {
    Content = (
      <ReleaseStandardCompletedStatus
        gateway={gateway}
        burnTxUrl={burnTxUrl}
        // releaseStatus={releaseStatus}
        releaseTxUrl={releaseTxUrl}
        releaseAmount={releaseAmount}
        releaseAssetDecimals={releaseAssetDecimals}
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
