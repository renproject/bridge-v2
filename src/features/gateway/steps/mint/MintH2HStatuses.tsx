import { Box, Divider, Fade, Typography } from "@material-ui/core";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus, ContractChain } from "@renproject/utils";
import React, { FunctionComponent, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ActionButton,
  MultipleActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../../components/formatting/NumberFormatText";
import {
  HorizontalPadder,
  MediumTopWrapper,
} from "../../../../components/layout/LayoutHelpers";
import { PaperContent } from "../../../../components/layout/Paper";
import {
  InlineSkeleton,
  ProgressWithContent,
  ProgressWrapper,
} from "../../../../components/progress/ProgressHelpers";
import { TooltipWithIcon } from "../../../../components/tooltips/TooltipWithIcon";
import {
  AssetInfo,
  LabelWithValue,
  SimpleAssetInfo,
} from "../../../../components/typography/TypographyHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { getChainConfig } from "../../../../utils/chainsConfig";
import {
  getAssetConfig,
  getRenAssetName,
} from "../../../../utils/tokensConfig";
import { SubmitErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { useSyncWalletChain } from "../../../wallet/walletHooks";
import {
  getGatewayParams,
  useEthereumChainAssetBalance,
} from "../../gatewayHooks";
import {
  useChainTransactionStatusUpdater,
  useChainTransactionSubmitter,
} from "../../gatewayTransactionHooks";

type MintH2HLockTransactionStatusProps = {
  gateway: Gateway;
  outputAmount: string | null;
  outputAmountUsd: string | null;
  Fees: ReactNode | null;
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
  const inStatus = useChainTransactionStatusUpdater(gateway.in);

  return (
    <>
      <PaperContent bottomPadding>
        <HorizontalPadder>
          <LabelWithValue
            label={t("common.balance") + ":"}
            value={
              <span>
                {balance === null ? (
                  <InlineSkeleton
                    variant="rect"
                    animation="pulse"
                    width={40}
                    height={12}
                  />
                ) : (
                  <Fade in={true}>
                    <span>{balance}</span>
                  </Fade>
                )}
                <span> {asset}</span>
              </span>
            }
          />
        </HorizontalPadder>
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
        {Fees}
        <HorizontalPadder>
          <Box
            mt={3}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box maxWidth={240}>
              <Typography variant="caption" color="textSecondary">
                {t("h2h.network-switching-message")}
              </Typography>
            </Box>
            <TooltipWithIcon title={t("h2h.network-switching-tooltip")} />
          </Box>
        </HorizontalPadder>
        <MultipleActionButtonWrapper>
          <ActionButton
            onClick={handleSubmit}
            disabled={
              submitting ||
              waiting ||
              done ||
              inStatus.status === ChainTransactionStatus.Confirming
            }
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
        <Debug it={{ inStatus }} />
      </PaperContent>
    </>
  );
};

type MintH2HLockTransactionProgressStatusProps = {
  gateway: Gateway;
  transaction: GatewayTransaction;
  outputAmount: string | null;
  outputAmountUsd: string | null;
  lockConfirmations: number | null;
  lockTargetConfirmations: number | null;
  lockStatus: ChainTransactionStatus | null;
  mintStatus: ChainTransactionStatus | null;
  Fees: ReactNode | null;
};

export const MintH2HLockTransactionProgressStatus: FunctionComponent<
  MintH2HLockTransactionProgressStatusProps
> = ({
  gateway,
  transaction,
  lockConfirmations,
  lockTargetConfirmations,
  outputAmount,
  outputAmountUsd,
  lockStatus,
  Fees,
}) => {
  const { t } = useTranslation();
  const { asset, from, amount } = getGatewayParams(gateway);
  const fromChainConfig = getChainConfig(from);
  const assetConfig = getAssetConfig(asset);
  const renAsset = getRenAssetName(asset);
  const { RenIcon } = assetConfig;

  const renVM = useChainTransactionSubmitter(transaction.renVM);
  const out = useChainTransactionSubmitter(transaction.out);

  const handleSubmitBoth = useCallback(async () => {
    await renVM.handleSubmit();
    await out.handleSubmit();
  }, [renVM.handleSubmit, out.handleSubmit]);

  const Icon = fromChainConfig.Icon;
  return (
    <>
      <PaperContent bottomPadding>
        <ProgressWrapper>
          <ProgressWithContent
            confirmations={
              lockConfirmations !== null ? lockConfirmations : undefined
            }
            targetConfirmations={
              lockTargetConfirmations !== null
                ? lockTargetConfirmations
                : undefined
            }
          >
            <Icon fontSize="inherit" />
          </ProgressWithContent>
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
        {Fees}
        <HorizontalPadder>
          <Box
            mt={3}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box maxWidth={240}>
              <Typography variant="caption" color="textSecondary">
                {t("h2h.network-switching-message")}
              </Typography>
            </Box>
            <TooltipWithIcon title={t("h2h.network-switching-tooltip")} />
          </Box>
        </HorizontalPadder>
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
