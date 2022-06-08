import { Box, Grow, Typography } from "@material-ui/core";
import { Skeleton, ToggleButtonProps } from "@material-ui/lab";
import { Asset, Chain } from "@renproject/chains";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import QRCode from "qrcode.react";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
import {
  BigQrCode,
  CopyContentButton,
  QrCodeIconButton,
  TransactionDetailsButton,
} from "../../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../../components/formatting/NumberFormatText";
import { CompletedIcon } from "../../../../components/icons/RenIcons";
import {
  BigTopWrapper,
  CenteringSpacedBox,
  MediumWrapper,
} from "../../../../components/layout/LayoutHelpers";
import { PaperContent } from "../../../../components/layout/Paper";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../../../../components/progress/ProgressHelpers";
import { BigAssetAmount } from "../../../../components/typography/TypographyHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import { useNotifications } from "../../../../providers/Notifications";
import {
  usePaperTitle,
  useSetPaperTitle,
} from "../../../../providers/TitleProviders";
import { getAssetConfig } from "../../../../utils/assetsConfig";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { getHours } from "../../../../utils/dates";
import { decimalsAmount } from "../../../../utils/numbers";
import { undefinedForNull } from "../../../../utils/propsUtils";
import { trimAddress } from "../../../../utils/strings";
import {
  alterContractChainProviderSigner,
  pickChains,
} from "../../../chain/chainUtils";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import { useTxsStorage } from "../../../storage/storageHooks";
import {
  GeneralErrorDialog,
  HMSCountdown,
  TransactionRevertedErrorDialog,
} from "../../../transactions/components/TransactionsHelpers";
import { useSetCurrentTxHash } from "../../../transactions/transactionsHooks";
import {
  ConnectWalletPaperSection,
  WrongAddressWarningDialog,
} from "../../../wallet/components/WalletHelpers";
import {
  useCurrentChainWallet,
  useSyncWalletChain,
  useWallet,
} from "../../../wallet/walletHooks";
import { getPaymentLink } from "../../../wallet/walletUtils";
import { GatewayLoaderStatus } from "../../components/GatewayHelpers";
import {
  DepositWrapper,
  GatewayAddressValidityMessage,
} from "../../components/MintHelpers";
import {
  CircledProgressWithContent,
  DepositLoaderStatus,
  DepositToggleButton,
  MoreInfo,
  ResponsiveDepositNavigation,
} from "../../components/MultipleDepositsHelpers";
import {
  useChainInstanceAssetDecimals,
  useGateway,
  useGatewayFees,
} from "../../gatewayHooks";
import {
  isTxSubmittable,
  updateRenVMHashParam,
  useChainTransactionStatusUpdater,
  useChainTransactionSubmitter,
  useRenVMChainTransactionStatusUpdater,
} from "../../gatewayTransactionHooks";
import {
  getGatewayExpiryTime,
  parseGatewayQueryString,
} from "../../gatewayUtils";
import { useTransactionsPagination } from "../../mintHooks";
import { GatewayPaperHeader } from "../shared/GatewayNavigationHelpers";
import {
  MintCompletedStatus,
  MintCompletingStatus,
  MintDepositAcceptedStatus,
  MintDepositConfirmationStatus,
} from "./MintStandardStatuses";

export const MintStandardProcess: FunctionComponent<RouteComponentProps> = ({
  location,
  history,
}) => {
  const { t } = useTranslation();

  const [paperTitle] = usePaperTitle();

  const {
    gatewayParams,
    additionalParams,
    error: parseError,
  } = parseGatewayQueryString(location.search, true);
  const { asset, from, to, nonce, toAddress } = gatewayParams;
  const expiryTime = additionalParams.expiryTime || getGatewayExpiryTime();
  const renVMHash = additionalParams.renVMHash;

  useSyncWalletChain(to);
  const { connected, account, provider } = useWallet(to);
  const allChains = useCurrentNetworkChains();
  const [gatewayChains] = useState(pickChains(allChains, from, to));

  useEffect(() => {
    if (provider && connected) {
      alterContractChainProviderSigner(allChains, to, provider);
    }
  }, [connected, to, allChains, provider]);

  const { gateway, transactions } = useGateway(
    { asset, from, to, nonce, toAddress },
    { chains: gatewayChains }
  );

  const fees = useGatewayFees(gateway);
  const { minimumAmount } = fees;

  console.info("gateway", gateway);
  (window as any).ga = gateway;
  (window as any).txs = transactions;

  const { orderedHashes, total } = useTransactionsPagination(transactions);

  const [currentDeposit, setCurrentDeposit] = useState(renVMHash || "gateway");

  const handleCurrentDepositChange = useCallback(
    (_, newDeposit) => {
      console.info("newDepositHash", newDeposit);
      if (newDeposit !== null) {
        setCurrentDeposit(newDeposit);
        const depositHashParam = newDeposit === "gateway" ? null : newDeposit;
        updateRenVMHashParam(history, depositHashParam); //this will mimic url-based navigation
      }
    },
    [history]
  );
  const handleGoToGateway = useCallback(() => {
    setCurrentDeposit("gateway");
  }, []);

  const [transaction, setTransaction] = useState<GatewayTransaction | null>(
    null
  );

  useEffect(() => {
    const found = transactions.find((tx) => tx.hash === currentDeposit);
    if (found) {
      setTransaction(found);
    } else {
      setTransaction(null);
    }
  }, [transactions, currentDeposit]);

  const [reloading, setReloading] = useState(false);
  useEffect(() => {
    setReloading(true);
    const timeout = setTimeout(() => {
      setReloading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [transaction]);
  (window as any).transaction = transaction;

  return (
    <>
      <GatewayPaperHeader title={paperTitle} />
      <PaperContent bottomPadding>
        {Boolean(parseError) && (
          <GeneralErrorDialog
            open={true}
            reason={parseError}
            alternativeActionText={t("navigation.back-to-home-label")}
            onAlternativeAction={() => history.push({ pathname: paths.HOME })}
          />
        )}
        {!connected && <ConnectWalletPaperSection />}
        {connected && (
          <WrongAddressWarningDialog
            actual={account}
            expected={toAddress}
            isGateway={true}
          />
        )}
        {connected && !gateway && <GatewayLoaderStatus />}
        {connected && gateway !== null && (
          <>
            <DepositWrapper>
              <ResponsiveDepositNavigation
                gateway={gateway}
                value={currentDeposit}
                onChange={handleCurrentDepositChange}
                transactions={transactions}
                expiryTime={expiryTime}
              />
              {transaction ? (
                reloading ? (
                  <DepositLoaderStatus />
                ) : (
                  <GatewayDepositProcessor
                    account={account}
                    gateway={gateway}
                    transaction={transaction}
                    onGoToGateway={handleGoToGateway}
                    expiryTime={expiryTime}
                  />
                )
              ) : (
                <MintGatewayAddress
                  gateway={gateway}
                  minimumAmount={minimumAmount}
                />
              )}
            </DepositWrapper>
            <Debug
              it={{
                currentDeposit,
                currentTx: transaction?.params,
                transactions: transactions.length,
              }}
            />
          </>
        )}
      </PaperContent>
      <Debug it={{ connected, gatewayParams, fees, orderedHashes, total }} />
      <Debug it={{ gateway, provider }} />
    </>
  );
};

export type GatewayDepositProcessorProps = {
  gateway: Gateway;
  transaction: GatewayTransaction;
  account: string;
  onGoToGateway: () => void;
  expiryTime: number;
};

export const GatewayDepositProcessor: FunctionComponent<
  GatewayDepositProcessorProps
> = ({ gateway, transaction, account, expiryTime, onGoToGateway }) => {
  const history = useHistory();

  const { decimals: lockAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.fromChain,
    gateway.params.asset
  );
  const { decimals: mintAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.toChain,
    gateway.params.asset
  );

  const inTxMeta = useChainTransactionStatusUpdater({
    tx: transaction.in,
    debugLabel: "in",
  });

  // const lockStatus = ChainTransactionStatus.Confirming;
  const {
    // error: lockError,
    status: lockStatus,
    confirmations: lockConfirmations,
    target: lockTargetConfirmations,
    // txId: lockTxId,
    txIdFormatted: lockTxIdFormatted,
    // txIndex: lockTxIndex,
    txUrl: lockTxUrl,
    amount: lockAmount,
  } = inTxMeta;

  const renVmSubmitter = useChainTransactionSubmitter({
    tx: transaction.renVM,
    autoSubmit:
      lockStatus === ChainTransactionStatus.Done &&
      isTxSubmittable(transaction.renVM),
    attempts: 4,
    debugLabel: "renVM",
  });
  const { submitting: renVMSubmitting } = renVmSubmitter;
  const renVMTxMeta = useRenVMChainTransactionStatusUpdater({
    tx: transaction.renVM,
    debugLabel: "renVM",
    // startTrigger: renVMSubmittingDone, //this blocks resolving from url
  });
  const {
    amount: mintAmount,
    error: renVMError,
    status: renVMStatus,
  } = renVMTxMeta;

  const outSubmitter = useChainTransactionSubmitter({
    tx: transaction.out,
    debugLabel: "out",
  });
  const {
    submittingDone: submittingMintDone,
    handleSubmit: handleSubmitMint,
    submitting: submittingMint,
    handleReset: handleResetMint,
    errorSubmitting: submittingMintError,
  } = outSubmitter;

  const [submittingOutSetup, setSubmittingOutSetup] = useState(false);
  const [submittingOutError, setSubmittingOutError] = useState<any>();

  const handleReset = useCallback(() => {
    setSubmittingOutError(false);
    setSubmittingOutSetup(false);
    handleResetMint();
  }, [handleResetMint]);

  const handleSubmit = useCallback(async () => {
    setSubmittingOutSetup(true);
    try {
      for (const key of Object.keys(transaction.outSetup)) {
        if (transaction.outSetup[key]) {
          await transaction.outSetup[key].submit?.();
          await transaction.outSetup[key].wait();
        }
      }
      setSubmittingOutSetup(false);
      await handleSubmitMint();
    } catch (error: any) {
      setSubmittingOutError({ code: 1984, message: "outSetup error" });
      console.error(error);
    }
  }, [handleSubmitMint, transaction.outSetup]);

  const outTxMeta = useChainTransactionStatusUpdater({
    tx: transaction.out,
    debugLabel: "out",
    startTrigger:
      submittingMintDone || lockStatus === ChainTransactionStatus.Done,
  });

  const {
    // error: mintError,
    status: mintStatus,
    confirmations: mintConfirmations,
    target: mintTargetConfirmations,
    // txId: mintTxId,
    txIdFormatted: mintTxIdFormatted,
    // txIndex: mintTxIndex,
    txUrl: mintTxUrl,
  } = outTxMeta;

  const { persistLocalTx } = useTxsStorage();

  useEffect(() => {
    console.info("persist", transaction);
    if (account && transaction !== null && transaction.hash) {
      persistLocalTx(account, transaction, false, { expiryTime });
      updateRenVMHashParam(history, transaction.hash);
    }
  }, [
    history,
    persistLocalTx,
    account,
    transaction,
    transaction?.hash,
    expiryTime,
  ]);

  useEffect(() => {
    if (mintTxUrl) {
      persistLocalTx(account, transaction, true, { expiryTime });
    }
  }, [account, transaction, persistLocalTx, expiryTime, mintTxUrl]);

  //TODO: fix types, create general error helpers;
  const isRevertedError =
    renVMError !== null &&
    (renVMError as any).code === "RENVM_TRANSACTION_REVERTED";

  useSetCurrentTxHash(transaction?.hash);

  let Content = null;
  if (lockStatus !== ChainTransactionStatus.Done) {
    switch (lockStatus) {
      case ChainTransactionStatus.Confirming:
        Content = (
          <MintDepositConfirmationStatus
            gateway={gateway}
            transaction={transaction}
            lockConfirmations={lockConfirmations}
            lockTargetConfirmations={lockTargetConfirmations}
            lockStatus={lockStatus}
            lockAssetDecimals={lockAssetDecimals}
            lockAmount={lockAmount}
            lockTxId={lockTxIdFormatted}
            lockTxUrl={lockTxUrl}
          />
        );
        break;
      case ChainTransactionStatus.Reverted:
        Content = <span>reverted</span>;
        break;
      default:
        Content = <DepositLoaderStatus reason="Updating Deposit..." />;
    }
  } else if (
    mintStatus === null &&
    lockStatus === ChainTransactionStatus.Done
  ) {
    Content = (
      <MintDepositAcceptedStatus
        expiryTime={expiryTime}
        gateway={gateway}
        transaction={transaction}
        lockConfirmations={lockConfirmations}
        lockTargetConfirmations={lockTargetConfirmations}
        lockAssetDecimals={lockAssetDecimals}
        lockAmount={lockAmount}
        lockTxId={lockTxIdFormatted}
        lockTxUrl={lockTxUrl}
        onSubmit={handleSubmit}
        onReset={handleReset}
        submitting={submittingMint || submittingOutSetup}
        submittingError={submittingMintError || submittingOutError}
        submittingDisabled={
          submittingOutSetup ||
          renVMSubmitting ||
          renVMStatus !== ChainTransactionStatus.Done
        }
        renVMStatus={renVMStatus}
        renVMSubmitting={renVMSubmitting}
        onReload={handleReset}
        waiting={false}
      />
    );
  } else {
    if (mintTxUrl) {
      Content = (
        <MintCompletedStatus
          gateway={gateway}
          mintAmount={mintAmount}
          lockTxUrl={lockTxUrl}
          lockAmount={lockAmount}
          lockAssetDecimals={lockAssetDecimals}
          mintTxUrl={mintTxUrl}
          mintAssetDecimals={mintAssetDecimals}
        />
      );
    } else {
      Content = (
        <MintCompletingStatus
          gateway={gateway}
          transaction={transaction}
          lockTxId={lockTxIdFormatted}
          lockTxUrl={lockTxUrl}
          mintAmount={mintAmount}
          mintAssetDecimals={mintAssetDecimals}
          mintTxUrl={mintTxUrl}
          mintTxHash={mintTxIdFormatted}
          mintConfirmations={mintConfirmations}
          mintTargetConfirmations={mintTargetConfirmations}
        />
      );
    }
  }

  return (
    <>
      {Content}
      <TransactionRevertedErrorDialog open={isRevertedError} />
      <Debug
        it={{
          inTxMeta,
          renVmSubmitter,
          renVmTxMeta: renVMTxMeta,
          outTxMeta,
          outSubmitter,
          mintAssetDecimals,
          hash: transaction.hash,
        }}
      />
    </>
  );
};

export type MintGatewayAddressProps = {
  gateway: Gateway;
  minimumAmount: number | string;
};

export const MintGatewayAddress: FunctionComponent<MintGatewayAddressProps> = ({
  gateway,
  minimumAmount,
}) => {
  const { t } = useTranslation();
  const { account } = useCurrentChainWallet();
  const [showQr, setShowQr] = useState(false);
  const toggleQr = useCallback(() => {
    setShowQr(!showQr);
  }, [showQr]);
  const { showNotification, closeNotification } = useNotifications();
  const [timeRemained] = useState(0); //useState(getRemainingGatewayTime(gateway.expiryTime));

  const toChainConfig = getChainConfig(gateway.toChain.chain as Chain);
  useEffect(() => {
    let key = 0;
    if (timeRemained > 0) {
      key = showNotification(
        <GatewayAddressValidityMessage
          milliseconds={timeRemained}
          destNetwork={toChainConfig.fullName}
        />,
        {
          variant: getHours(timeRemained) < 6 ? "error" : "warning",
          persist: true,
        }
      ) as number;
    }
    return () => {
      if (key) {
        closeNotification(key);
      }
    };
  }, [showNotification, toChainConfig, closeNotification, timeRemained]);

  const lockCurrencyConfig = getAssetConfig(gateway.params.asset as Asset);
  const lockChainConfig = getChainConfig(gateway.fromChain.chain as Chain);
  const { Icon } = lockChainConfig;

  useSetPaperTitle(t("mint.gateway-address-title"));

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={lockChainConfig.color} size={64}>
          <Icon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <MediumWrapper>
        <BigAssetAmount
          value={
            <span>
              {t("mint.gateway-send-to-message", {
                currency: lockCurrencyConfig.shortName,
              })}
            </span>
          }
        />
        {Boolean(minimumAmount) ? (
          <Typography
            component="p"
            variant="caption"
            align="center"
            color="textSecondary"
          >
            {t("mint.gateway-minimum-amount-label")}:{" "}
            <NumberFormatText
              value={minimumAmount}
              spacedSuffix={lockCurrencyConfig.shortName}
            />
          </Typography>
        ) : (
          <Box display="flex" justifyContent="center">
            <Skeleton variant="text" width={200} height={20} />
          </Box>
        )}
      </MediumWrapper>
      {Boolean(gateway.gatewayAddress) ? (
        <>
          {showQr && (
            <CenteringSpacedBox>
              <Grow in={showQr}>
                <BigQrCode>
                  <QRCode
                    value={getPaymentLink(
                      gateway.fromChain.chain as Chain,
                      gateway.gatewayAddress || ""
                    )}
                  />
                </BigQrCode>
              </Grow>
            </CenteringSpacedBox>
          )}
          <CopyContentButton
            content={gateway.gatewayAddress || ""}
            copiedMessage={t("common.copied-ex-message")}
          />
        </>
      ) : (
        <Skeleton variant="rect" height={45} />
      )}
      <Box
        mt={2}
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
      >
        <Typography variant="caption">
          {timeRemained > 0 && (
            <span>
              {t("mint.gateway-do-not-send-after-label")}:{" "}
              <strong>
                <HMSCountdown milliseconds={timeRemained} />
              </strong>
            </span>
          )}
          {timeRemained <= 0 && <span>{t("mint.expired-label")}</span>}
        </Typography>
        <Box mt={2}>
          <QrCodeIconButton onClick={toggleQr} />
        </Box>
        <BigTopWrapper>
          <TransactionDetailsButton
            label={t("common.recipient-address-label")}
            isTx={false}
            address={trimAddress(account, 5)}
            link={gateway.toChain.addressExplorerLink(account)}
            size="small"
          />
        </BigTopWrapper>
      </Box>
    </>
  );
};

type DepositNavigationToggleButton = ToggleButtonProps & {
  gateway: Gateway;
  transaction: GatewayTransaction;
};

export const DepositNavigationButton: FunctionComponent<
  DepositNavigationToggleButton
> = ({ transaction, gateway, ...rest }) => {
  const { t } = useTranslation();
  const { decimals: lockAssetDecimals } = useChainInstanceAssetDecimals(
    gateway.fromChain,
    gateway.params.asset
  );

  const lockAssetConfig = getAssetConfig(transaction.params.asset);
  // const lockChainConfig = getChainConfig(transaction.fromChain.chain);
  // const mintChainConfig = getChainConfig(transaction.toChain.chain);

  // const p = useChainTransactionSubmitter({
  //   tx: transaction.in,
  //   autoSubmit: isTxSubmittable(transaction.in),
  // });
  //TODO: remove
  const lockTxMeta = useChainTransactionStatusUpdater({
    tx: transaction.in,
    debugLabel: "in p",
  });

  const {
    amount: lockAmount,
    status: lockStatus,
    confirmations: lockConfirmations,
    target: lockTargetConfirmations,
    error: lockError,
  } = lockTxMeta;

  const renVMTxMeta = useRenVMChainTransactionStatusUpdater({
    tx: transaction.renVM,
    debugLabel: "renVM p",
  });

  const { status: renVMStatus } = renVMTxMeta;

  const mintTxMeta = useChainTransactionStatusUpdater({
    tx: transaction.out,
    startTrigger: lockStatus === ChainTransactionStatus.Done,
    debugLabel: "out p",
  });

  const lockAmountFormatted = decimalsAmount(lockAmount, lockAssetDecimals);

  const { status: mintStatus, txUrl: mintTxUrl } = mintTxMeta;
  const Icon = lockAssetConfig.Icon;
  //some universal loader
  let PendingProgress = (
    <CircledProgressWithContent processing>
      <Icon fontSize="large" />
    </CircledProgressWithContent>
  );
  let PendingContent = (
    <div>
      <Skeleton variant="text" width={100} height={22} />
      <Skeleton variant="text" width={70} height={16} />
    </div>
  );
  let Content: any = PendingContent;
  let Progress: any = PendingProgress;
  // const lockStatus = ChainTransactionStatus.Confirming;
  // const mintStatus = null;

  if (lockStatus !== ChainTransactionStatus.Done) {
    if (lockStatus === ChainTransactionStatus.Confirming) {
      const Icon = lockAssetConfig.Icon;
      Progress = (
        <CircledProgressWithContent
          color={lockAssetConfig.color}
          confirmations={
            lockConfirmations !== null ? lockConfirmations : undefined
          }
          targetConfirmations={
            lockTargetConfirmations !== null
              ? lockTargetConfirmations
              : undefined
          }
        >
          <Icon fontSize="large" />
        </CircledProgressWithContent>
      );
      Content = (
        <div>
          <Typography variant="body1" color="textPrimary">
            {lockAmountFormatted} {lockAssetConfig.shortName}
          </Typography>
          {lockTargetConfirmations !== 0 ? (
            <Typography variant="body2" color="textSecondary">
              {t("mint.deposit-navigation-confirmations-label", {
                confirmations: lockConfirmations,
                targetConfirmations: lockTargetConfirmations,
              })}
            </Typography>
          ) : (
            <Skeleton variant="text" width={100} height={14} />
          )}
        </div>
      );
    } else {
      Progress = PendingProgress;
      Content = PendingContent;
    }
  } else if (
    mintStatus === null &&
    lockStatus === ChainTransactionStatus.Done
  ) {
    const Icon = lockAssetConfig.Icon;
    const renProcessing = renVMStatus === ChainTransactionStatus.Confirming;
    Progress = (
      <CircledProgressWithContent
        color={lockAssetConfig.color}
        confirmations={undefinedForNull(lockConfirmations)}
        targetConfirmations={undefinedForNull(lockTargetConfirmations)}
        indicator={!renProcessing}
      >
        <Icon fontSize="large" />
      </CircledProgressWithContent>
    );
    Content = (
      <div>
        <Typography variant="body1" color="textPrimary">
          {lockAmountFormatted !== null ? (
            lockAmountFormatted
          ) : (
            <Skeleton variant="text" width={70} height={14} />
          )}{" "}
          {lockAssetConfig.shortName}
        </Typography>
        {renProcessing ? (
          <Typography variant="body2" color="textSecondary">
            submitting to RenVM...
          </Typography>
        ) : (
          <Typography variant="body2" color="primary">
            {renVMStatus === ChainTransactionStatus.Reverted
              ? t("tx.reverted")
              : t("mint.deposit-navigation-ready-to-mint-label")}
          </Typography>
        )}
      </div>
    );
  } else if (mintTxUrl !== null || mintStatus === ChainTransactionStatus.Done) {
    Progress = (
      <CircledProgressWithContent>
        <CompletedIcon fontSize="large" />
      </CircledProgressWithContent>
    );
    Content = (
      <div>
        <Typography variant="body1" color="textPrimary">
          {lockAmountFormatted} {lockAssetConfig.shortName}
        </Typography>
        <Typography variant="body2" color="primary">
          {t("mint.deposit-navigation-completed-label")}
        </Typography>
      </div>
    );
    // }
  }

  return (
    <DepositToggleButton {...rest}>
      {Progress}
      <MoreInfo>{Content}</MoreInfo>
      <Debug disable it={{ lockError, lockTxMeta, mintTxMeta }} />
    </DepositToggleButton>
  );
};
