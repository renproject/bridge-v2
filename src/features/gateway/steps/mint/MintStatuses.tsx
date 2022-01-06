import { Typography } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { Gateway, GatewayTransaction } from "@renproject/ren";
import { ChainTransactionStatus } from "@renproject/utils";
import BigNumber from "bignumber.js";
import { FunctionComponent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TransactionDetailsButton } from "../../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../../components/formatting/NumberFormatText";
import {
  MediumWrapper,
  SmallWrapper,
} from "../../../../components/layout/LayoutHelpers";
import {
  ProgressWithContent,
  ProgressWrapper,
} from "../../../../components/progress/ProgressHelpers";
import { BigAssetAmount } from "../../../../components/typography/TypographyHelpers";
import { usePaperTitle } from "../../../../providers/TitleProviders";
import { orangeLight } from "../../../../theme/colors";
import { getChainConfig } from "../../../../utils/chainsConfig";
import { getAssetConfig } from "../../../../utils/tokensConfig";
import { ProcessingTimeWrapper } from "../../../transactions/components/TransactionsHelpers";

type MintDepositConfirmationStatusProps = {
  gateway: Gateway;
  transaction: GatewayTransaction;
  lockConfirmations: number | null;
  lockTargetConfirmations: number | null;
  lockStatus: ChainTransactionStatus;
  lockAssetDecimals: number | null;
  lockAmount: string | null;
  lockTxId: string | null;
  lockTxUrl: string | null;
};

// TODO: finish
export const MintDepositConfirmationStatus: FunctionComponent<
  MintDepositConfirmationStatusProps
> = ({
  gateway,
  transaction,
  lockConfirmations,
  lockTargetConfirmations,
  lockStatus,
  lockAmount,
  lockAssetDecimals,
  lockTxId,
  lockTxUrl,
}) => {
  const { t } = useTranslation();
  const [, setTitle] = usePaperTitle();
  const lockAssetConfig = getAssetConfig(gateway.params.asset);
  const lockChainConfig = getChainConfig(gateway.fromChain.chain);

  const { Icon } = lockAssetConfig;

  const confirmed = lockStatus == ChainTransactionStatus.Done;
  const lockAmountFormatted =
    lockAmount !== null && lockAssetDecimals !== null
      ? new BigNumber(lockAmount).shiftedBy(-lockAssetDecimals).toString()
      : null;
  const lockTxHash = "sdfasdfa";
  const lockTxLink = "fdafasfsa";
  const lockProcessingTime = 500;

  useEffect(() => {
    setTitle(
      confirmed
        ? t("mint.deposit-confirmed-label")
        : t("mint.deposit-confirming-label")
    );
  }, [setTitle, confirmed, t]);

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent
          color={lockAssetConfig.color || orangeLight}
          confirmations={
            lockConfirmations !== null ? lockConfirmations : undefined
          }
          targetConfirmations={
            lockTargetConfirmations !== null
              ? lockTargetConfirmations
              : undefined
          }
        >
          <Icon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <SmallWrapper>
        <Typography variant="body1" align="center">
          {lockConfirmations !== null && lockTargetConfirmations !== null ? (
            <>
              {lockConfirmations} of {lockTargetConfirmations} confirmations
            </>
          ) : (
            <Skeleton variant="text" width={120} height={14} />
          )}
        </Typography>
      </SmallWrapper>
      <MediumWrapper>
        {lockAmountFormatted !== null ? (
          <BigAssetAmount
            value={
              <NumberFormatText
                value={lockAmountFormatted}
                spacedSuffix={lockAssetConfig.shortName}
              />
            }
          />
        ) : (
          <Skeleton width={120} height={32} />
        )}
      </MediumWrapper>
      {lockTxId !== null && lockTxUrl !== null && (
        <TransactionDetailsButton
          label={lockChainConfig.fullName}
          address={lockTxId}
          link={lockTxUrl}
        />
      )}
      <ProcessingTimeWrapper>
        <Typography variant="caption" component="p" align="center">
          Estimated time remaining: {lockProcessingTime} minutes
        </Typography>
      </ProcessingTimeWrapper>
    </>
  );
};
