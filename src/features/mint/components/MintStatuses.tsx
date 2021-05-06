import { Box, Grow, Typography, useTheme } from "@material-ui/core";
import { GatewaySession, OpenedGatewaySession } from "@renproject/ren-tx";
import QRCode from "qrcode.react";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import { useEffectOnce } from "react-use";
import {
  ActionButton,
  ActionButtonWrapper,
  BigQrCode,
  CopyContentButton,
  QrCodeIconButton,
  TransactionDetailsButton,
} from "../../../components/buttons/Buttons";
import { NumberFormatText } from "../../../components/formatting/NumberFormatText";
import {
  BigTopWrapper,
  CenteringSpacedBox,
  MediumWrapper,
  SmallWrapper,
} from "../../../components/layout/LayoutHelpers";
import { Link } from "../../../components/links/Links";
import {
  BigDoneIcon,
  ProgressWithContent,
  ProgressWrapper,
  TransactionStatusInfo,
} from "../../../components/progress/ProgressHelpers";
import { BigAssetAmount } from "../../../components/typography/TypographyHelpers";
import { paths } from "../../../pages/routes";
import { useNotifications } from "../../../providers/Notifications";
import {
  usePaperTitle,
  useSetActionRequired,
  useSetPaperTitle,
} from "../../../providers/TitleProviders";
import { orangeLight } from "../../../theme/colors";
import { getChainConfigByRentxName } from "../../../utils/assetConfigs";
import { getHours } from "../../../utils/dates";
import { trimAddress } from "../../../utils/strings";
import { useFetchFees } from "../../fees/feesHooks";
import { getTransactionFees } from "../../fees/feesUtils";
import { useBrowserNotifications } from "../../notifications/notificationsUtils";
import {
  HMSCountdown,
  ProcessingTimeWrapper,
  SubmitErrorDialog,
} from "../../transactions/components/TransactionsHelpers";
import { getPaymentLink, TxType } from "../../transactions/transactionsUtils";
import {
  getLockAndMintBasicParams,
  getLockAndMintParams,
  getRemainingGatewayTime,
  getRemainingMintTime,
} from "../mintUtils";
import {
  GatewayAddressValidityMessage,
  GatewayTransactionValidityMessage,
} from "./MintHelpers";

export type MintDepositToProps = {
  tx: OpenedGatewaySession<any>;
  minimumAmount: number;
};

export const MintDepositToStatus: FunctionComponent<MintDepositToProps> = ({
  tx,
  minimumAmount,
}) => {
  const [showQr, setShowQr] = useState(false);
  const toggleQr = useCallback(() => {
    setShowQr(!showQr);
  }, [showQr]);
  const { showNotification, closeNotification } = useNotifications();
  const [timeRemained] = useState(getRemainingGatewayTime(tx.expiryTime));

  useEffect(() => {
    let key = 0;
    if (timeRemained > 0) {
      key = showNotification(
        <GatewayAddressValidityMessage
          milliseconds={timeRemained}
          destNetwork={getChainConfigByRentxName(tx.destChain).full}
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
  }, [showNotification, tx.destChain, closeNotification, timeRemained]);

  const {
    lockCurrencyConfig,
    lockChainConfig,
    mintAddressLink,
  } = getLockAndMintBasicParams(tx);
  const { color } = lockCurrencyConfig;
  const { MainIcon } = lockChainConfig;
  useSetPaperTitle("Gateway address");

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={color || orangeLight} size={64}>
          <MainIcon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <MediumWrapper>
        <BigAssetAmount
          value={<span>Send {lockCurrencyConfig.short} to</span>}
        />
        <Typography
          component="p"
          variant="caption"
          align="center"
          color="textSecondary"
        >
          Minimum amount:{" "}
          <NumberFormatText
            value={minimumAmount}
            spacedSuffix={lockCurrencyConfig.short}
          />
        </Typography>
      </MediumWrapper>
      {!!tx.gatewayAddress && (
        <>
          {showQr && (
            <CenteringSpacedBox>
              <Grow in={showQr}>
                <BigQrCode>
                  <QRCode
                    value={getPaymentLink(
                      lockChainConfig.symbol,
                      tx.gatewayAddress
                    )}
                  />
                </BigQrCode>
              </Grow>
            </CenteringSpacedBox>
          )}
          <CopyContentButton content={tx.gatewayAddress} />
        </>
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
              Do not send after: <HMSCountdown milliseconds={timeRemained} />
            </span>
          )}
          {timeRemained <= 0 && <span>Expired</span>}
        </Typography>
        <Box mt={2}>
          <QrCodeIconButton onClick={toggleQr} />
        </Box>
        <BigTopWrapper>
          <TransactionDetailsButton
            label="Recipient Address"
            isTx={false}
            address={trimAddress(tx.userAddress, 5)}
            link={mintAddressLink}
            size="small"
          />
        </BigTopWrapper>
      </Box>
    </>
  );
};

type MintDepositConfirmationStatusProps = {
  tx: GatewaySession<any>;
  depositHash: string;
};

export const MintDepositConfirmationStatus: FunctionComponent<MintDepositConfirmationStatusProps> = ({
  tx,
  depositHash,
}) => {
  const [, setTitle] = usePaperTitle();
  const {
    lockCurrencyConfig,
    lockChainConfig,
    lockTxHash,
    lockTxLink,
    lockTxAmount,
    lockConfirmations,
    lockTargetConfirmations,
    lockProcessingTime,
  } = getLockAndMintParams(tx, depositHash);

  const { MainIcon } = lockChainConfig;

  const confirmed = lockConfirmations === lockTargetConfirmations;
  useEffect(() => {
    setTitle(confirmed ? "Confirmed" : "Confirming");
  }, [setTitle, confirmed]);

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent
          color={lockCurrencyConfig.color || orangeLight}
          confirmations={lockConfirmations}
          targetConfirmations={lockTargetConfirmations}
        >
          <MainIcon fontSize="inherit" color="inherit" />
        </ProgressWithContent>
      </ProgressWrapper>
      <SmallWrapper>
        <Typography variant="body1" align="center">
          {lockConfirmations} of {lockTargetConfirmations} confirmations
        </Typography>
      </SmallWrapper>
      <MediumWrapper>
        <BigAssetAmount
          value={
            <NumberFormatText
              value={lockTxAmount}
              spacedSuffix={lockCurrencyConfig.short}
            />
          }
        />
      </MediumWrapper>
      <TransactionDetailsButton
        label={lockChainConfig.short}
        address={lockTxHash}
        link={lockTxLink}
      />
      <ProcessingTimeWrapper>
        <Typography variant="caption" component="p" align="center">
          Estimated time remaining: {lockProcessingTime} minutes
        </Typography>
      </ProcessingTimeWrapper>
    </>
  );
};

const maxConfirmations = (actual: number, target: number) => {
  if (actual > target) {
    return target;
  }
  return actual;
};

type MintDepositAcceptedStatusProps = {
  tx: GatewaySession<any>;
  onSubmit?: () => void;
  onReload?: () => void;
  submitting: boolean;
  submittingError: boolean;
  depositHash: string;
};

export const MintDepositAcceptedStatus: FunctionComponent<MintDepositAcceptedStatusProps> = ({
  tx,
  onSubmit = () => {},
  onReload,
  submitting,
  submittingError,
  depositHash,
}) => {
  useSetPaperTitle("Submit");
  useSetActionRequired(true);
  const theme = useTheme();
  const {
    lockCurrencyConfig,
    lockChainConfig,
    lockTxHash,
    lockTxAmount,
    lockTxLink,
    lockConfirmations,
    lockTargetConfirmations,
    mintChainConfig,
    mintCurrencyConfig,
  } = getLockAndMintParams(tx, depositHash);

  const notificationMessage = `${maxConfirmations(
    lockConfirmations,
    lockTargetConfirmations
  )}/${lockTargetConfirmations} confirmations, ready to submit ${
    lockCurrencyConfig.short
  } to ${mintChainConfig.full}?`;
  const { showNotification, closeNotification } = useNotifications();
  useEffectOnce(() => {
    const key = showNotification(notificationMessage);
    return () => {
      closeNotification(key);
    };
  });
  const [mintTimeRemained] = useState(getRemainingMintTime(tx.expiryTime));

  useEffect(() => {
    let key = 0;
    if (mintTimeRemained < 24 * 3600 * 1000) {
      key = showNotification(
        <GatewayTransactionValidityMessage milliseconds={mintTimeRemained} />,
        {
          variant: getHours(mintTimeRemained) < 12 ? "error" : "warning",
          persist: true,
        }
      ) as number;
    }
    return () => {
      if (key) {
        closeNotification(key);
      }
    };
  }, [showNotification, closeNotification, mintTimeRemained]);

  const { MainIcon } = lockChainConfig;

  return (
    <>
      <ProgressWrapper>
        {submitting ? (
          <ProgressWithContent color={theme.customColors.skyBlue} processing>
            <MainIcon fontSize="inherit" color="inherit" />
          </ProgressWithContent>
        ) : (
          <ProgressWithContent
            color={lockCurrencyConfig.color || theme.customColors.skyBlue}
            confirmations={lockConfirmations}
            targetConfirmations={lockTargetConfirmations}
          >
            <MainIcon fontSize="inherit" color="inherit" />
          </ProgressWithContent>
        )}
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        <NumberFormatText
          value={lockTxAmount}
          spacedSuffix={lockCurrencyConfig.full}
        />{" "}
        Received
      </Typography>
      <ActionButtonWrapper>
        <ActionButton onClick={onSubmit} disabled={submitting}>
          {submitting ? "Minting" : "Mint"} {mintCurrencyConfig.short}
          {submitting && "..."}
        </ActionButton>
      </ActionButtonWrapper>
      <ActionButtonWrapper>
        <TransactionDetailsButton
          label={lockChainConfig.short}
          address={lockTxHash}
          link={lockTxLink}
        />
      </ActionButtonWrapper>
      <SubmitErrorDialog open={submittingError} onAction={onReload} />
    </>
  );
};

type DestinationPendingStatusProps = {
  tx: GatewaySession<any>;
  onSubmit?: () => void;
  submitting: boolean;
  depositHash: string;
};

export const DestinationPendingStatus: FunctionComponent<DestinationPendingStatusProps> = ({
  tx,
  onSubmit = () => {},
  submitting,
  depositHash,
}) => {
  const theme = useTheme();
  const {
    lockCurrencyConfig,
    lockChainConfig,
    lockTxHash,
    lockTxAmount,
    lockTxLink,
    mintTxLink,
    mintTxHash,
    mintChainConfig,
    mintCurrencyConfig,
  } = getLockAndMintParams(tx, depositHash);

  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent color={theme.customColors.skyBlue} processing>
          <TransactionStatusInfo
            status="Pending"
            chain={mintChainConfig.full}
            address={
              <Link
                color="primary"
                underline="hover"
                href={mintTxLink}
                target="_blank"
              >
                {mintTxHash}
              </Link>
            }
          />
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        <NumberFormatText
          value={lockTxAmount}
          spacedSuffix={lockCurrencyConfig.full}
        />
      </Typography>
      <ActionButtonWrapper>
        <ActionButton onClick={onSubmit} disabled={submitting}>
          {submitting ? "Minting" : "Mint"} {mintCurrencyConfig.short}
          {submitting && "..."}
        </ActionButton>
      </ActionButtonWrapper>
      <ActionButtonWrapper>
        <TransactionDetailsButton
          label={lockChainConfig.short}
          address={lockTxHash}
          link={lockTxLink}
        />
      </ActionButtonWrapper>
    </>
  );
};

type MintCompletedStatusProps = {
  tx: GatewaySession<any>;
  depositHash: string;
};

export const MintCompletedStatus: FunctionComponent<MintCompletedStatusProps> = ({
  tx,
  depositHash,
}) => {
  useSetPaperTitle("Complete");
  const history = useHistory();
  const {
    lockCurrencyConfig,
    mintCurrencyConfig,
    lockChainConfig,
    lockTxLink,
    lockTxAmount,
    mintTxLink,
    mintChainConfig,
  } = getLockAndMintParams(tx, depositHash);
  const { fees, pending } = useFetchFees(
    lockCurrencyConfig.symbol,
    TxType.MINT
  );
  const { conversionTotal } = getTransactionFees({
    amount: lockTxAmount,
    fees,
    type: TxType.MINT,
  });
  const handleReturn = useCallback(() => {
    history.push({
      pathname: paths.HOME,
    });
  }, [history]);

  const { showNotification } = useNotifications();
  const { showBrowserNotification } = useBrowserNotifications();

  const showNotifications = useCallback(() => {
    if (!pending) {
      const notificationMessage = `Successfully minted ${conversionTotal} ${mintCurrencyConfig.short} on ${mintChainConfig.full}.`;
      showNotification(
        <span>
          {notificationMessage}{" "}
          <Link external href={mintTxLink}>
            View {mintChainConfig.full} transaction
          </Link>
        </span>
      );
      showBrowserNotification(notificationMessage);
    }
  }, [
    showNotification,
    showBrowserNotification,
    pending,
    conversionTotal,
    mintChainConfig,
    mintCurrencyConfig,
    mintTxLink,
  ]);

  useEffect(showNotifications, [showNotifications, pending]);
  return (
    <>
      <ProgressWrapper>
        <ProgressWithContent>
          <BigDoneIcon />
        </ProgressWithContent>
      </ProgressWrapper>
      <Typography variant="body1" align="center" gutterBottom>
        You received{" "}
        <NumberFormatText
          value={conversionTotal}
          spacedSuffix={mintCurrencyConfig.short}
        />
        !
      </Typography>
      <ActionButtonWrapper>
        <ActionButton onClick={handleReturn}>Back to home</ActionButton>
      </ActionButtonWrapper>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" py={2}>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={lockTxLink}
        >
          {lockChainConfig.full} transaction
        </Link>
        <Link
          external
          color="primary"
          variant="button"
          underline="hover"
          href={mintTxLink}
        >
          {mintChainConfig.full} transaction
        </Link>
      </Box>
    </>
  );
};
