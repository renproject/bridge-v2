import { Divider } from "@material-ui/core";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus, ContractChain } from "@renproject/utils";
import React, {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  ActionButton,
  MultipleActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../../components/formatting/NumberFormatText";
import { MediumTopWrapper } from "../../../../components/layout/LayoutHelpers";
import { PaperContent } from "../../../../components/layout/Paper";
import {
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusInfo,
} from "../../../../components/progress/ProgressHelpers";
import {
  AssetInfo,
  SimpleAssetInfo,
} from "../../../../components/typography/TypographyHelpers";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { feesDecimalImpact } from "../../../../utils/numbers";
import { undefinedForNull } from "../../../../utils/propsUtils";
import {
  getAssetConfig,
  getRenAssetName,
} from "../../../../utils/tokensConfig";
import { alterEthereumBaseChainProviderSigner } from "../../../chain/chainUtils";
import { useCurrentNetworkChains } from "../../../network/networkHooks";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { useWallet } from "../../../wallet/walletHooks";
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
import { SwitchWalletDialog } from "../shared/WalletSwitchHelpers";

type MintH2HLockTransactionStatusProps = {
  gateway: Gateway;
  Fees: ReactNode | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
};

export const MintH2HLockTransactionStatus: FunctionComponent<
  MintH2HLockTransactionStatusProps
> = ({ gateway, Fees, outputAmount, outputAmountUsd }) => {
  const { t } = useTranslation();
  const { asset, amount } = getGatewayParams(gateway);
  const assetConfig = getAssetConfig(asset);
  const renAsset = getRenAssetName(asset);
  const { balance } = useEthereumChainAssetBalance(
    gateway.fromChain as ContractChain,
    asset
  );
  const { RenIcon } = assetConfig;

  const {
    handleSubmit,
    submitting,
    done,
    waiting,
    errorSubmitting,
    handleReset,
  } = useChainTransactionSubmitter(gateway.in);

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
          <ActionButton
            onClick={handleSubmit}
            disabled={submitting || waiting || done}
          >
            {submitting || waiting
              ? t("gateway.submitting-tx-label")
              : t("gateway.submit-tx-label")}
          </ActionButton>
          {errorSubmitting && (
            <SubmitErrorDialog
              open={true}
              error={errorSubmitting}
              onAction={handleReset}
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

  const renVM = useChainTransactionSubmitter(transaction?.renVM);
  const out = useChainTransactionSubmitter(transaction?.out);

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

type MintH2HMintTransactionProgressStatusProps = {
  gateway: Gateway;
  transaction: GatewayTransaction | null;
  renVMStatus: ChainTransactionStatus | null;
  mintStatus: ChainTransactionStatus | null;
  mintConfirmations: number | null;
  mintTargetConfirmations: number | null;
  outputAmount: string | null;
  outputAmountUsd: string | null;
  Fees: ReactNode | null;
};

export const MintH2HMintTransactionProgressStatus: FunctionComponent<
  MintH2HMintTransactionProgressStatusProps
> = ({
  gateway,
  transaction,
  renVMStatus,
  mintConfirmations,
  mintTargetConfirmations,
  mintStatus,
  outputAmount,
  outputAmountUsd,
  Fees,
}) => {
  const { t } = useTranslation();
  const { asset, to, amount } = getGatewayParams(gateway);
  const mintChainConfig = getChainConfig(to);
  const assetConfig = getAssetConfig(asset);
  const renAsset = getRenAssetName(asset);

  const renVM = useChainTransactionSubmitter(transaction?.renVM);
  const out = useChainTransactionSubmitter(transaction?.out);

  const handleSubmitBoth = useCallback(async () => {
    await renVM.handleSubmit();
    await out.handleSubmit();
  }, [renVM, out]);

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
          <ActionButton
            onClick={handleSubmitBoth}
            disabled={
              out.submitting ||
              out.waiting ||
              out.done ||
              renVM.submitting ||
              renVM.waiting ||
              renVM.done ||
              mintStatus === ChainTransactionStatus.Confirming
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
