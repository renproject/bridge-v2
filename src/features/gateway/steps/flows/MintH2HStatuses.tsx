import { Box, Divider, Typography } from "@material-ui/core";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus, ContractChain } from "@renproject/utils";
import BigNumber from "bignumber.js";
import React, {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useEffectOnce } from "react-use";
import {
  ActionButton,
  MultipleActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../../components/formatting/NumberFormatText";
import { MediumTopWrapper } from "../../../../components/layout/LayoutHelpers";
import { PaperContent } from "../../../../components/layout/Paper";
import { Link } from "../../../../components/links/Links";
import {
  BigDoneIcon,
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusInfo,
} from "../../../../components/progress/ProgressHelpers";
import {
  AssetInfo,
  SimpleAssetInfo,
} from "../../../../components/typography/TypographyHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import { useNotifications } from "../../../../providers/Notifications";
import { useSetPaperTitle } from "../../../../providers/TitleProviders";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { feesDecimalImpact } from "../../../../utils/numbers";
import { undefinedForNull } from "../../../../utils/propsUtils";
import {
  getAssetConfig,
  getRenAssetName,
} from "../../../../utils/tokensConfig";
import { getWalletConfig } from "../../../../utils/walletsConfig";
import { alterEthereumBaseChainProviderSigner } from "../../../chain/chainUtils";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import { useBrowserNotifications } from "../../../notifications/notificationsUtils";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { AddTokenButton } from "../../../wallet/components/WalletHelpers";
import {
  useCurrentChainWallet,
  useWallet,
  useWalletAssetHelpers,
} from "../../../wallet/walletHooks";
import { $wallet } from "../../../wallet/walletSlice";
import { WalletNetworkSwitchMessage } from "../../components/HostToHostHelpers";
import { TransactionProgressInfo } from "../../components/TransactionProgressHelpers";
import {
  getGatewayParams,
  useEthereumChainAssetBalance,
} from "../../gatewayHooks";
import { useChainTransactionSubmitter } from "../../gatewayTransactionHooks";
import {
  BalanceInfo,
  UsdNumberFormatText,
} from "../../components/BalanceHelpers";
import { FeesToggler } from "../../components/FeeHelpers";
import { SubmittingProps } from "../shared/SubmissionHelpers";
import { SwitchWalletDialog } from "../shared/WalletSwitchHelpers";

type MintH2HLockTransactionStatusProps = {
  gateway: Gateway;
  Fees: ReactNode | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
  onSubmit: () => void;
  onReload?: () => void;
  onRetry?: () => void;
  submitting: boolean;
  submittingError?: Error | string;
};

export const MintH2HLockTransactionStatus: FunctionComponent<
  MintH2HLockTransactionStatusProps
> = ({
  gateway,
  Fees,
  outputAmount,
  outputAmountUsd,
  onSubmit,
  submitting,
  onRetry,
  submittingError,
}) => {
  const { t } = useTranslation();
  const { asset, amount } = getGatewayParams(gateway);
  const assetConfig = getAssetConfig(asset);
  const renAsset = getRenAssetName(asset);
  const { balance } = useEthereumChainAssetBalance(
    gateway.fromChain as ContractChain,
    asset
  );
  const { RenIcon } = assetConfig;

  return (
    <>
      <PaperContent bottomPadding>
        <BalanceInfo balance={balance} asset={asset} />
        <SimpleAssetInfo
          label={t("mint.minting-label")}
          value={amount}
          asset={asset}
        />
        <MediumTopWrapper>
          <AssetInfo
            label={t("common.receiving-label")}
            value={
              <NumberFormatText
                value={outputAmount}
                spacedSuffix={renAsset}
                decimalScale={feesDecimalImpact(amount)}
              />
            }
            valueEquivalent={
              <UsdNumberFormatText amountUsd={outputAmountUsd} />
            }
            Icon={<RenIcon fontSize="inherit" />}
          />
        </MediumTopWrapper>
      </PaperContent>
      <Divider />
      <PaperContent topPadding darker>
        {Fees}
        <WalletNetworkSwitchMessage />
        <MultipleActionButtonWrapper>
          <ActionButton onClick={onSubmit} disabled={submitting}>
            {submitting
              ? t("gateway.submitting-tx-label")
              : t("gateway.submit-tx-label")}
          </ActionButton>
          {submittingError && (
            <SubmitErrorDialog
              open={true}
              error={submittingError}
              onAction={onRetry}
            />
          )}
        </MultipleActionButtonWrapper>
      </PaperContent>
    </>
  );
};

type MintH2HLockTransactionProgressStatusProps = {
  gateway: Gateway;
  transaction: GatewayTransaction | null;
  Fees: ReactNode | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
  lockStatus: ChainTransactionStatus | null;
  lockConfirmations: number | null;
  lockTargetConfirmations: number | null;
};

export const MintH2HLockTransactionProgressStatus: FunctionComponent<
  MintH2HLockTransactionProgressStatusProps
> = ({
  gateway,
  transaction,
  Fees,
  outputAmount,
  outputAmountUsd,
  lockConfirmations,
  lockTargetConfirmations,
  lockStatus,
}) => {
  const { t } = useTranslation();
  const { asset, from, to, amount, fromAverageConfirmationTime } =
    getGatewayParams(gateway);
  const fromChainConfig = getChainConfig(from);
  const assetConfig = getAssetConfig(asset);
  const renAsset = getRenAssetName(asset);
  const { RenIcon } = assetConfig;

  const renVM = useChainTransactionSubmitter({ tx: transaction?.renVM });
  const out = useChainTransactionSubmitter({ tx: transaction?.out });

  const handleSubmitBoth = useCallback(async () => {
    await renVM.handleSubmit();
    await out.handleSubmit();
  }, [out, renVM]);

  const Icon = fromChainConfig.Icon;

  const { chain } = useSelector($wallet);
  const { connected, provider } = useWallet(to);
  const showSwitchWalletDialog =
    lockStatus === ChainTransactionStatus.Done && !connected && chain !== to;
  console.log("ccl", chain, connected, lockStatus);
  const chains = useCurrentNetworkChains();
  useEffect(() => {
    if (provider) {
      alterEthereumBaseChainProviderSigner(chains, provider, true);
    }
  }, [chains, provider]);

  return (
    <>
      <SwitchWalletDialog open={showSwitchWalletDialog} targetChain={to} />
      <PaperContent bottomPadding>
        <ProgressWrapper>
          <ProgressWithContent
            confirmations={undefinedForNull(lockConfirmations)}
            targetConfirmations={undefinedForNull(lockTargetConfirmations)}
          >
            <Icon fontSize="inherit" />
          </ProgressWithContent>
        </ProgressWrapper>
        <TransactionProgressInfo
          confirmations={undefinedForNull(lockConfirmations)}
          target={undefinedForNull(lockTargetConfirmations)}
          averageConfirmationTime={fromAverageConfirmationTime}
        />
        <SimpleAssetInfo
          label={t("mint.minting-label")}
          value={amount}
          asset={asset}
        />
        <MediumTopWrapper>
          <AssetInfo
            label={t("common.receiving-label")}
            value={
              <NumberFormatText
                value={outputAmount}
                spacedSuffix={renAsset}
                decimalScale={feesDecimalImpact(amount)}
              />
            }
            valueEquivalent={
              <UsdNumberFormatText amountUsd={outputAmountUsd} />
            }
            Icon={<RenIcon fontSize="inherit" />}
          />
        </MediumTopWrapper>
      </PaperContent>
      <Divider />
      <PaperContent topPadding darker>
        <FeesToggler>{Fees}</FeesToggler>
        <MultipleActionButtonWrapper>
          <ActionButton
            onClick={handleSubmitBoth}
            disabled={
              out.submitting ||
              out.waiting ||
              out.done ||
              renVM.submitting ||
              renVM.waiting ||
              renVM.done ||
              lockStatus === ChainTransactionStatus.Confirming
            }
          >
            {out.submitting || out.waiting || renVM.submitting || renVM.waiting
              ? t("gateway.submitting-tx-label")
              : t("gateway.submit-tx-label")}
          </ActionButton>
          {renVM.errorSubmitting && (
            <SubmitErrorDialog
              open={true}
              error={renVM.errorSubmitting}
              onAction={renVM.handleReset}
            />
          )}
          {out.errorSubmitting && (
            <SubmitErrorDialog
              open={true}
              error={out.errorSubmitting}
              onAction={out.handleReset}
            />
          )}
        </MultipleActionButtonWrapper>
      </PaperContent>
    </>
  );
};

type MintH2HMintTransactionProgressStatusProps = SubmittingProps & {
  gateway: Gateway;
  Fees: ReactNode | null;
  transaction: GatewayTransaction | null;
  renVMStatus: ChainTransactionStatus | null;
  mintStatus: ChainTransactionStatus | null;
  mintConfirmations: number | null;
  mintTargetConfirmations: number | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
};

export const MintH2HMintTransactionProgressStatus: FunctionComponent<
  MintH2HMintTransactionProgressStatusProps
> = ({
  gateway,
  Fees,
  transaction,
  renVMStatus,
  mintConfirmations,
  mintTargetConfirmations,
  mintStatus,
  outputAmount,
  outputAmountUsd,
  onSubmit,
  onReset,
  submitting,
  waiting,
  done,
  errorSubmitting,
}) => {
  const { t } = useTranslation();
  const { asset, to, amount } = getGatewayParams(gateway);
  const mintChainConfig = getChainConfig(to);
  const assetConfig = getAssetConfig(asset);
  const renAsset = getRenAssetName(asset);

  const { RenIcon } = assetConfig;
  const Icon = mintChainConfig.Icon;
  return (
    <>
      <PaperContent bottomPadding>
        <ProgressWrapper>
          {renVMStatus === ChainTransactionStatus.Confirming ? (
            <ProgressWithContent processing>
              <TransactionStatusInfo status="Submitting to RenVM..." />
            </ProgressWithContent>
          ) : (
            <ProgressWithContent
              confirmations={undefinedForNull(mintConfirmations)}
              targetConfirmations={undefinedForNull(mintTargetConfirmations)}
            >
              <Icon fontSize="inherit" />
            </ProgressWithContent>
          )}
        </ProgressWrapper>

        <SimpleAssetInfo
          label={t("mint.minting-label")}
          value={amount}
          asset={asset}
        />
        <MediumTopWrapper>
          <AssetInfo
            label={t("common.receiving-label")}
            value={
              <NumberFormatText
                value={outputAmount}
                spacedSuffix={renAsset}
                decimalScale={3} // TODO: make dynamic decimal scale based on input decimals
              />
            }
            valueEquivalent={
              outputAmountUsd !== null ? (
                <NumberFormatText
                  prefix=" = $"
                  value={outputAmountUsd}
                  spacedSuffix="USD"
                  decimalScale={2}
                  fixedDecimalScale
                />
              ) : null
            }
            Icon={<RenIcon fontSize="inherit" />}
          />
        </MediumTopWrapper>
      </PaperContent>
      <Divider />
      <PaperContent topPadding darker>
        <FeesToggler>{Fees}</FeesToggler>
        <MultipleActionButtonWrapper>
          <ActionButton onClick={onSubmit} disabled={submitting || waiting}>
            {submitting || waiting
              ? t("gateway.submitting-tx-label")
              : t("gateway.submit-tx-label")}
          </ActionButton>
          {errorSubmitting && (
            <SubmitErrorDialog
              open={true}
              error={errorSubmitting}
              onAction={onReset}
            />
          )}
        </MultipleActionButtonWrapper>
      </PaperContent>
    </>
  );
};

type MintH2HCompletedStatusProps = {
  gateway: Gateway;
  lockTxUrl: string | null;
  mintAssetDecimals: number | null;
  mintAmount: string | null;
  mintTxUrl: string | null;
};

export const MintH2HCompletedStatus: FunctionComponent<
  MintH2HCompletedStatusProps
> = ({ gateway, lockTxUrl, mintTxUrl, mintAmount, mintAssetDecimals }) => {
  const { t } = useTranslation();
  useSetPaperTitle(t("mint.complete-title"));
  const history = useHistory();
  const { wallet } = useCurrentChainWallet();
  const walletConfig = getWalletConfig(wallet);
  const lockAssetConfig = getAssetConfig(gateway.params.asset);
  const lockChainConfig = getChainConfig(gateway.params.from.chain);
  const mintChainConfig = getChainConfig(gateway.params.to.chain);

  const handleGoToHome = useCallback(() => {
    history.push({
      pathname: paths.HOME,
    });
  }, [history]);

  const { showNotification } = useNotifications();
  const { showBrowserNotification } = useBrowserNotifications();

  const mintAmountFormatted =
    mintAmount !== null && mintAssetDecimals !== null
      ? new BigNumber(mintAmount).shiftedBy(-mintAssetDecimals).toString()
      : null;

  const showNotifications = useCallback(() => {
    if (mintTxUrl !== null) {
      const notificationMessage = t("mint.success-notification-message", {
        total: mintAmountFormatted,
        currency: lockAssetConfig.shortName,
        chain: mintChainConfig.fullName,
      });
      showNotification(
        <span>
          {notificationMessage}{" "}
          <Link external href={mintTxUrl}>
            {t("tx.view-chain-transaction-link-text", {
              chain: mintChainConfig.fullName,
            })}
          </Link>
        </span>
      );
      showBrowserNotification(notificationMessage);
    }
  }, [
    showNotification,
    showBrowserNotification,
    mintAmountFormatted,
    mintChainConfig,
    lockAssetConfig,
    mintTxUrl,
    t,
  ]);

  useEffectOnce(showNotifications);

  const walletTokenMeta = useWalletAssetHelpers(
    gateway.params.to.chain,
    gateway.params.asset
  );
  const { addToken } = walletTokenMeta;

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent>
          <BigDoneIcon />
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        {t("tx.you-received-message")}{" "}
        <NumberFormatText
          value={mintAmountFormatted}
          spacedSuffix={lockAssetConfig.shortName}
        />
        !
      </Typography>
      <MultipleActionButtonWrapper>
        {addToken !== null && (
          <Box mb={1}>
            <AddTokenButton
              onAddToken={addToken}
              wallet={walletConfig.shortName || walletConfig.fullName}
              currency={lockAssetConfig.shortName}
            />
          </Box>
        )}
        <ActionButton onClick={handleGoToHome}>
          {t("navigation.back-to-home-label")}
        </ActionButton>
      </MultipleActionButtonWrapper>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" py={2}>
        {lockTxUrl !== null && (
          <Link
            external
            color="primary"
            variant="button"
            underline="hover"
            href={lockTxUrl}
          >
            {lockChainConfig.fullName} {t("common.transaction")}
          </Link>
        )}
        {mintTxUrl !== null && (
          <Link
            external
            color="primary"
            variant="button"
            underline="hover"
            href={mintTxUrl}
          >
            {mintChainConfig.fullName} {t("common.transaction")}
          </Link>
        )}
      </Box>
      <Debug it={{ walletTokenMeta }} />
    </>
  );
};
