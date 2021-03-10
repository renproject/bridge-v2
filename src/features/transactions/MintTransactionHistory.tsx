import { Box, Chip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { RenNetwork } from "@renproject/interfaces";
import { GatewaySession } from "@renproject/ren-tx";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  ActionButton,
  ActionButtonWrapper,
  SmallActionButton,
} from "../../components/buttons/Buttons";
import { AssetDropdown } from "../../components/dropdowns/AssetDropdown";
import {
  BigTopWrapper,
  BigWrapper,
  CenteringSpacedBox,
  MediumWrapper,
} from "../../components/layout/LayoutHelpers";
import { Link } from "../../components/links/Links";
import {
  SimplePagination,
  SimplestPagination,
} from "../../components/pagination/SimplePagination";
import {
  CenteredProgress,
  PulseIndicator,
} from "../../components/progress/ProgressHelpers";
import { TooltipWithIcon } from "../../components/tooltips/TooltipWithIcon";
import {
  TransactionsHeader,
  TransactionsPaginationWrapper,
} from "../../components/transactions/TransactionsGrid";
import { Debug } from "../../components/utils/Debug";
import { WalletConnectionProgress } from "../../components/wallet/WalletHelpers";
import { paths } from "../../pages/routes";
import {
  BridgeChain,
  BridgeCurrency,
  getChainConfig,
  supportedLockCurrencies,
  supportedMintDestinationChains,
  toMintedCurrency,
} from "../../utils/assetConfigs";
import { getFormattedDateTime, getFormattedHMS } from "../../utils/dates";
import { isFirstVowel } from "../../utils/strings";
import {
  CircledProgressWithContent,
  getDepositStatusIcon,
} from "../mint/components/MultipleDepositsHelpers";
import {
  useDepositPagination,
  useIntervalCountdown,
  useMintMachine,
} from "../mint/mintHooks";
import { $mint, setMintCurrency } from "../mint/mintSlice";
import {
  createMintTransaction,
  getDepositParams,
  getLockAndMintBasicParams,
  getLockAndMintParams,
  getRemainingGatewayTime,
} from "../mint/mintUtils";
import { $renNetwork } from "../network/networkSlice";
import { useSelectedChainWallet } from "../wallet/walletHooks";
import {
  $wallet,
  setChain,
  setWalletPickerOpened,
} from "../wallet/walletSlice";
import {
  SuccessChip,
  TransactionHistoryDialog,
  WarningChip,
} from "./components/TransactionHistoryHelpers";
import { TransactionItemProps } from "./components/TransactionsHelpers";
import {
  $currentTxId,
  $txHistoryOpened,
  setTxHistoryOpened,
} from "./transactionsSlice";
import {
  createTxQueryString,
  DepositEntryStatus,
  DepositPhase,
  GatewayStatus,
} from "./transactionsUtils";

export const MintTransactionHistory: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { chain } = useSelector($wallet);
  const { walletConnected, account } = useSelectedChainWallet();
  const { currency } = useSelector($mint);
  const network = useSelector($renNetwork);
  const opened = useSelector($txHistoryOpened);
  const activeTxId = useSelector($currentTxId);
  const [page, setPage] = useState(0);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(true);
    setTimeout(() => {
      setPending(false);
    }, 1000);
  }, [currency, chain]);

  const chainConfig = getChainConfig(chain);

  const handleCurrencyChange = useCallback(
    (event) => {
      dispatch(setMintCurrency(event.target.value));
    },
    [dispatch]
  );
  const handleChainChange = useCallback(
    (event) => {
      dispatch(setChain(event.target.value));
    },
    [dispatch]
  );

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setWalletPickerOpened(true));
  }, [dispatch]);

  const rowsPerPage = 3;
  const startDay = rowsPerPage * page;
  return (
    <TransactionHistoryDialog open={opened}>
      <TransactionsHeader title="Viewing mint history for">
        <AssetDropdown
          condensed
          available={supportedLockCurrencies}
          value={currency}
          onChange={handleCurrencyChange}
        />
        <Box mx={2}>to</Box>
        <AssetDropdown
          mode="chain"
          condensed
          available={supportedMintDestinationChains}
          value={chain}
          onChange={handleChainChange}
        />
      </TransactionsHeader>
      {!walletConnected && (
        <BigTopWrapper>
          {!walletConnected && (
            <>
              <MediumWrapper>
                <Typography variant="body1" align="center">
                  Please connect {isFirstVowel(chainConfig.full) ? "an" : "a"}{" "}
                  {chainConfig.full} compatible wallet to view transactions
                </Typography>
              </MediumWrapper>
              <BigWrapper>
                <MediumWrapper>
                  <CenteringSpacedBox>
                    <WalletConnectionProgress />
                  </CenteringSpacedBox>
                </MediumWrapper>
                <ActionButtonWrapper>
                  <ActionButton onClick={handleWalletPickerOpen}>
                    Connect Wallet
                  </ActionButton>
                </ActionButtonWrapper>
              </BigWrapper>
            </>
          )}
        </BigTopWrapper>
      )}
      {walletConnected && pending && (
        <BigTopWrapper>
          <CenteredProgress color="primary" size={100} />
        </BigTopWrapper>
      )}
      {walletConnected && !pending && (
        <>
          {[0, 1, 2].map((offset) => (
            <GatewayEntryResolver
              key={startDay + offset}
              dayOffset={startDay + offset}
              currency={currency}
              chain={chain}
              account={account}
              network={network}
              activeTxId={activeTxId}
            />
          ))}
          <Debug it={{ activeTxId }} />
          <TransactionsPaginationWrapper>
            <SimplePagination
              count={rowsPerPage * 2}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
            />
          </TransactionsPaginationWrapper>
        </>
      )}
    </TransactionHistoryDialog>
  );
};

type GatewayResolverProps = {
  dayOffset: number;
  currency: BridgeCurrency;
  chain: BridgeChain;
  account: string;
  network: RenNetwork;
  activeTxId: string;
};

const GatewayEntryResolver: FunctionComponent<GatewayResolverProps> = ({
  dayOffset,
  currency,
  chain,
  network,
  account,
  activeTxId,
}) => {
  console.log(dayOffset);
  const tx = useMemo(
    () =>
      createMintTransaction({
        currency: currency,
        destAddress: account,
        mintedCurrency: toMintedCurrency(currency),
        mintedCurrencyChain: chain,
        userAddress: account,
        network: network,
        dayOffset: dayOffset,
      }),
    [currency, account, chain, network, dayOffset]
  );

  const isActive = activeTxId === tx.id;
  if (isActive) {
    return <GatewayEntry tx={tx} isActive />;
  }
  return (
    <>
      <GatewayEntryMachine tx={tx} />
    </>
  );
};

export type GatewayEntryProps = {
  tx: GatewaySession;
  isActive?: boolean;
  onContinue?: ((depositHash?: string) => void) | (() => void);
};

export const GatewayEntryMachine: FunctionComponent<GatewayEntryProps> = ({
  tx,
}) => {
  const [current, , service] = useMintMachine(tx);
  useEffect(
    () => () => {
      service.stop();
    },
    [service]
  );

  return <GatewayEntry tx={current.context.tx} />;
};

const standardPaddings = {
  paddingLeft: 40,
  paddingRight: 50,
};

const standardShadow = `0px 0px 4px rgba(0, 27, 58, 0.1)`;

export const useGatewayResolverStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.common.white,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginTop: 8,
    boxShadow: standardShadow,
  },
  gateway: {
    ...standardPaddings,
    height: 32,
    display: "flex",
    justifyContent: "stretch",
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  datetime: {
    paddingTop: 2,
    minWidth: 80,
  },
  gatewayAddress: {
    paddingTop: 1,
    flexGrow: 2,
  },
  gatewayLink: {
    marginLeft: 8,
  },
  counter: {
    minWidth: 180,
    display: "flex",
    justifyContent: "flex-end",
  },
  multiple: {
    ...standardPaddings,
    height: 32,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  multipleLabel: {
    marginRight: 16,
  },
  multiplePagination: {},
  details: {
    paddingLeft: standardPaddings.paddingLeft,
    paddingTop: 6,
    paddingBottom: 6,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleAndLinks: {},
  title: {
    fontSize: 14,
  },
  links: {},
  link: {
    fontSize: 12,
    display: "inline-block",
    marginRight: 16,
    "&:last-child": {
      marginRight: 0,
    },
  },
  statusAndActions: {
    display: "flex",
    flexGrow: 2,
  },
  status: {},
  indicator: {
    width: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    flexGrow: 1,
    paddingRight: 10,
  },
}));

const GatewayEntry: FunctionComponent<TransactionItemProps> = ({
  tx,
  isActive,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const styles = useGatewayResolverStyles();
  const {
    handleNext,
    handlePrev,
    currentIndex,
    currentHash,
    total,
  } = useDepositPagination(tx);

  const {
    lockChainConfig,
    lockCurrencyConfig,
    mintCurrencyConfig,
    mintChainConfig,
    depositsCount,
    gatewayStatus,
  } = getLockAndMintBasicParams(tx);

  const {
    lockConfirmations,
    lockTargetConfirmations,
    lockTxLink,
    lockTxAmount,
    mintTxLink,
    depositStatus,
    depositPhase,
  } = getDepositParams(tx, tx.transactions[currentHash]);
  const hasDeposits = depositsCount > 0;
  const { date } = getFormattedDateTime(tx.expiryTime - 48 * 3600 * 1000);

  const StatusIcon = getDepositStatusIcon({
    depositStatus,
    depositPhase,
    mintChainConfig,
    lockChainConfig,
  });

  const handlePageChange = useCallback(
    (event: any, newPage: number) => {
      newPage > currentIndex ? handleNext() : handlePrev();
    },
    [currentIndex, handleNext, handlePrev]
  );

  const handleContinue = useCallback(() => {
    history.push({
      pathname: paths.MINT_TRANSACTION,
      search: "?" + createTxQueryString(tx),
      state: {
        txState: {
          reloadTx: true,
          currentHash, // TODO: querystring?
        },
      },
    });
    dispatch(setTxHistoryOpened(false));
  }, [dispatch, history, tx, currentHash]);

  const timeToGatewayExpiration = useIntervalCountdown(
    getRemainingGatewayTime(tx.expiryTime)
  );
  const params = getLockAndMintParams(tx, currentHash);
  return (
    <>
      <Debug
        wrapper
        it={{
          tx,
          currentHash,
          currentIndex,
          depositStatus,
          depositPhase,
          params,
        }}
      />
      <div className={styles.root}>
        <div className={styles.gateway}>
          <div className={styles.datetime}>
            <Typography variant="overline" color="textSecondary">
              {date}
            </Typography>
          </div>
          <div className={styles.gatewayAddress}>
            {Boolean(tx.gatewayAddress) &&
              gatewayStatus !== GatewayStatus.EXPIRED && (
                <Typography
                  variant="caption"
                  color={
                    gatewayStatus === GatewayStatus.DEPOSITS_ACCEPTED
                      ? "textPrimary"
                      : "textSecondary"
                  }
                >
                  {tx.gatewayAddress}
                  {gatewayStatus === GatewayStatus.DEPOSITS_ACCEPTED && (
                    <Link
                      className={styles.gatewayLink}
                      color="primary"
                      underline="hover"
                      onClick={handleContinue}
                    >
                      View
                    </Link>
                  )}
                </Typography>
              )}
          </div>
          <div className={styles.counter}>
            <GatewayStatusChip
              status={gatewayStatus}
              timeToGatewayExpiration={timeToGatewayExpiration}
            />
          </div>
        </div>
        {depositsCount > 1 && (
          <div className={styles.multiple}>
            <WarningChip
              className={styles.multipleLabel}
              label="Multiple deposits"
            />
            <SimplestPagination
              className={styles.multiplePagination}
              count={total}
              rowsPerPage={1}
              page={currentIndex}
              onChangePage={handlePageChange}
            />
          </div>
        )}
        <div className={styles.details}>
          <div className={styles.titleAndLinks}>
            {hasDeposits && (
              <Typography variant="body2" className={styles.title}>
                Mint {lockTxAmount} {mintCurrencyConfig.short} on{" "}
                {mintChainConfig.full}
              </Typography>
            )}
            <div className={styles.links}>
              {Boolean(lockTxLink) && (
                <Link
                  href={lockTxLink}
                  external
                  color="primary"
                  underline="hover"
                  className={styles.link}
                >
                  {lockChainConfig.full} transaction
                </Link>
              )}
              {Boolean(mintTxLink) && (
                <Link
                  href={mintTxLink}
                  external
                  color="primary"
                  underline="hover"
                  className={styles.link}
                >
                  {mintChainConfig.full} transaction
                </Link>
              )}
            </div>
          </div>
          <div className={styles.statusAndActions}>
            <div className={styles.actions}>
              {isActive && (
                <Typography color="primary" variant="caption">
                  Currently viewing
                </Typography>
              )}
              {!isActive && hasDeposits && (
                <>
                  {depositStatus === DepositEntryStatus.ACTION_REQUIRED && (
                    <SmallActionButton onClick={handleContinue}>
                      {depositPhase === DepositPhase.LOCK
                        ? "Continue"
                        : "Finish"}{" "}
                      mint
                    </SmallActionButton>
                  )}
                  {depositStatus === DepositEntryStatus.PENDING &&
                    lockConfirmations < lockTargetConfirmations && (
                      <Typography color="textPrimary" variant="caption">
                        {lockConfirmations}/{lockTargetConfirmations}{" "}
                        Confirmations
                      </Typography>
                    )}
                </>
              )}
            </div>
            <div className={styles.status}>
              <CircledProgressWithContent
                color={lockCurrencyConfig.color}
                confirmations={lockConfirmations}
                targetConfirmations={lockTargetConfirmations}
                processing={depositPhase === DepositPhase.NONE}
                size={34}
              >
                <StatusIcon />
              </CircledProgressWithContent>
            </div>
            <div className={styles.indicator}>
              {hasDeposits &&
                depositStatus === DepositEntryStatus.ACTION_REQUIRED && (
                  <PulseIndicator pulsing size={12} />
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const expiresInMessage =
  "To ensure funds stay secure, Gateway Addresses refresh every 24 hours.  Make sure a Gateway Address is not expired before sending assets to it.";

const submitInMessage =
  "After the asset has been received and confirmed by RenVM, you must submit a mint transaction to the destination chain within 24 hours. If you do not, the assets will be lost. This is part of RenVM's security-first approach that sees gateways renew every 24 hours to ensure custodied funds cannot be stolen.";

const gatewayExpiredMessage =
  "This Gateway Address is no longer valid. Any transactions completed before the Gateway Address expired are safe and remain on the destination chain. To begin another transaction, open a new Gateway Address from the home screen.";

type GatewayStatusChipProps = {
  status: GatewayStatus;
  timeToGatewayExpiration?: number;
};

export const GatewayStatusChip: FunctionComponent<GatewayStatusChipProps> = ({
  status,
  timeToGatewayExpiration = 0,
}) => {
  switch (status) {
    case GatewayStatus.DEPOSITS_ACCEPTED:
      return (
        <SuccessChip
          label={
            <span>
              Expires in:{" "}
              <strong>{getFormattedHMS(timeToGatewayExpiration)}</strong>{" "}
              <TooltipWithIcon title={expiresInMessage} />
            </span>
          }
        />
      );
    case GatewayStatus.SUBMIT_ONLY:
      return (
        <SuccessChip
          label={
            <span>
              Submit in:{" "}
              <strong>
                {getFormattedHMS(timeToGatewayExpiration + 24 * 3600 * 1000)}
              </strong>{" "}
              <TooltipWithIcon title={submitInMessage} />
            </span>
          }
        />
      );
    case GatewayStatus.EXPIRED:
      return (
        <Chip
          label={
            <span>
              Gateway Expired <TooltipWithIcon title={gatewayExpiredMessage} />
            </span>
          }
        />
      );
    default:
      return null;
  }
};
