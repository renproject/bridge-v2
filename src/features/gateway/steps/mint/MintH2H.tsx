import { Box, Divider, Fade, Typography } from "@material-ui/core";
import { Gateway } from "@renproject/ren";
import { ContractChain } from "@renproject/utils";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../../components/formatting/NumberFormatText";
import {
  HorizontalPadder,
  MediumTopWrapper,
} from "../../../../components/layout/LayoutHelpers";
import { PaperContent } from "../../../../components/layout/Paper";
import { InlineSkeleton } from "../../../../components/progress/ProgressHelpers";
import { TooltipWithIcon } from "../../../../components/tooltips/TooltipWithIcon";
import {
  AssetInfo,
  LabelWithValue,
  SimpleAssetInfo,
} from "../../../../components/typography/TypographyHelpers";
import { Debug } from "../../../../components/utils/Debug";
import { paths } from "../../../../pages/routes";
import {
  getAssetConfig,
  getRenAssetName,
} from "../../../../utils/tokensConfig";
import { GeneralErrorDialog } from "../../../transactions/components/TransactionsHelpers";
import { GatewayFees } from "../../components/GatewayFees";
import { GatewayLoaderStatus } from "../../components/GatewayHelpers";
import {
  getGatewayParams,
  useEthereumChainAssetBalance,
  useGatewayFeesWithRates,
} from "../../gatewayHooks";
import { useSharedGateway } from "../../gatewaySlice";
import { GatewayPaperHeader } from "../shared/GatewayNavigationHelpers";

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
  const { t } = useTranslation();
  const { asset, from, to, amount } = getGatewayParams(gateway);
  const assetConfig = getAssetConfig(asset);
  const renAsset = getRenAssetName(asset);
  const fees = useGatewayFeesWithRates(gateway, amount);
  const { outputAmount, outputAmountUsd } = fees;
  const { balance } = useEthereumChainAssetBalance(
    gateway.fromChain as ContractChain,
    asset
  );
  const { RenIcon } = assetConfig;

  const [approvalTxUrl, setApprovalTxUrl] = useState("");
  useEffect(() => {
    try {
      const url = gateway.fromChain.transactionExplorerLink(
        gateway.inSetup.approval.progress.transaction!
      );
      if (url) {
        setApprovalTxUrl(url);
      }
    } finally {
      setApprovalTxUrl("");
    }
  }, [gateway, gateway.inSetup.approval.progress.transaction]);

  console.log(
    "gtx",
    gateway.inSetup.approval.progress.transaction,
    approvalTxUrl
  );

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
        <GatewayFees
          asset={asset}
          from={from}
          to={to}
          {...fees}
          needsApproval={true}
          approved={true}
          approvalTxUrl={approvalTxUrl}
        />
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
        <ActionButtonWrapper>
          <ActionButton onClick={() => {}}>
            {t("gateway.submit-tx-label")}
          </ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
      <Debug it={{ approvalTxUrl }} />
    </>
  );
};
