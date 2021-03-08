import { Box, Chip, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { RenNetwork } from '@renproject/interfaces'
import { GatewaySession } from '@renproject/ren-tx'
import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useInterval } from 'react-use'
import {
  ActionButton,
  ActionButtonWrapper,
  SmallActionButton,
} from '../../components/buttons/Buttons'
import { AssetDropdown } from '../../components/dropdowns/AssetDropdown'
import { CompletedIcon, EmptyIcon } from '../../components/icons/RenIcons'
import {
  BigTopWrapper,
  BigWrapper,
  CenteringSpacedBox,
  MediumWrapper,
} from '../../components/layout/LayoutHelpers'
import { Link } from '../../components/links/Links'
import {
  SimplePagination,
  SimplestPagination,
} from '../../components/pagination/SimplePagination'
import { TransactionStatusIndicator } from '../../components/progress/ProgressHelpers'
import { TooltipWithIcon } from '../../components/tooltips/TooltipWithIcon'
import {
  TransactionsContent,
  TransactionsHeader,
  TransactionsPaginationWrapper,
} from '../../components/transactions/TransactionsGrid'
import { Debug } from '../../components/utils/Debug'
import { WalletConnectionProgress } from '../../components/wallet/WalletHelpers'
import {
  BridgeChain,
  BridgeCurrency,
  getChainConfig,
  supportedLockCurrencies,
  supportedMintDestinationChains,
  toMintedCurrency,
} from '../../utils/assetConfigs'
import { getFormattedDateTime, getFormattedHMS } from '../../utils/dates'
import { isFirstVowel } from '../../utils/strings'
import { useDepositPagination } from '../mint/mintHooks'
import { $mint, setMintCurrency } from '../mint/mintSlice'
import {
  createMintTransaction,
  getLockAndMintParams,
  getRemainingGatewayTime,
} from '../mint/mintUtils'
import { $renNetwork } from '../network/networkSlice'
import { useSelectedChainWallet } from '../wallet/walletHooks'
import {
  $wallet,
  setChain,
  setWalletPickerOpened,
} from '../wallet/walletSlice'
import {
  ExpiresChip,
  TransactionHistoryDialog,
  WarningChip,
} from './components/TransactionHistoryHelpers'
import { TransactionItemProps } from './components/TransactionsHelpers'
import { $currentTxId, $txHistoryOpened } from './transactionsSlice'
import {
  isTransactionCompleted,
  TxEntryStatus,
  TxPhase,
} from './transactionsUtils'
import { doubleTransaction, singleTransaction } from './txMocks'

export const MintTransactionHistory: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { chain } = useSelector($wallet);
  const { walletConnected, account } = useSelectedChainWallet();
  const { currency } = useSelector($mint);
  const network = useSelector($renNetwork);
  const opened = useSelector($txHistoryOpened);
  const activeTxId = useSelector($currentTxId);
  const [page, setPage] = useState(0);

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
        <>
          <TransactionsContent>
            <BigTopWrapper>
              {!walletConnected && (
                <>
                  <MediumWrapper>
                    <Typography variant="body1" align="center">
                      Please connect{" "}
                      {isFirstVowel(chainConfig.full) ? "an" : "a"}{" "}
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
          </TransactionsContent>
        </>
      )}
      <>
        {[0, 1, 2].map((offset) => (
          <div key={startDay + offset}>
            <span>{offset}</span>
            <GatewayEntryResolver
              dayOffset={startDay + offset}
              currency={currency}
              chain={chain}
              account={account || "0xdf88bc963E614FAB2bda81c298056ba18e01A424"}
              network={network}
              activeTxId={activeTxId}
            />
          </div>
        ))}
      </>
      <Debug disable it={{ activeTxId }} />
      <TransactionsPaginationWrapper>
        <SimplePagination
          count={rowsPerPage * 2}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
        />
      </TransactionsPaginationWrapper>
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
  const txData = useMemo(
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

  const isActive = activeTxId === txData.id;
  const tx = dayOffset ? singleTransaction : doubleTransaction;

  return (
    <>
      <GatewayEntry tx={(tx as unknown) as GatewaySession} />
      <Debug disable wrapper it={{ dayOffset, isActive }} />
    </>
  );
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
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  datetime: {
    paddingTop: 2,
  },
  gatewayAddress: {},
  counter: {},
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
    paddingRight: 20,
    paddingLet: 20,
  },
  status: {},
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
  onContinue,
}) => {
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
    lockConfirmations,
    lockTargetConfirmations,
    lockTxLink,
    lockTxAmount,
    mintCurrencyConfig,
    mintChainConfig,
    mintTxLink,
    meta: { status, phase, createdTimestamp, transactionsCount },
  } = getLockAndMintParams(tx, currentHash);

  const { date } = getFormattedDateTime(createdTimestamp); //TODO: correct period

  let StatusIcon = EmptyIcon;
  if (status === TxEntryStatus.COMPLETED) {
    StatusIcon = CompletedIcon;
  } else if (phase === TxPhase.LOCK) {
    StatusIcon = lockChainConfig.Icon;
  } else if (phase === TxPhase.MINT) {
    StatusIcon = mintChainConfig.Icon;
  }

  const handlePageChange = useCallback(
    (event: any, newPage: number) => {
      newPage > currentIndex ? handleNext() : handlePrev();
    },
    [currentIndex, handleNext, handlePrev]
  );

  const handleContinue = useCallback(() => {
    if (onContinue) {
      onContinue(currentHash);
    }
  }, [currentHash, onContinue]);

  const params = getLockAndMintParams(tx, currentHash);
  return (
    <>
      <Debug
        disable
        wrapper
        it={{
          currentHash,
          currentIndex,
          tx,
          params,
          completed: isTransactionCompleted(tx),
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
            <Typography variant="caption" color="textSecondary">
              {tx.gatewayAddress}
            </Typography>
          </div>
          <div className={styles.counter}>
            <ExpirationStatus expiryTime={tx.expiryTime} />
          </div>
        </div>
        {transactionsCount > 1 && (
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
            <Typography variant="body2" className={styles.title}>
              Mint {lockTxAmount || tx.targetAmount} {mintCurrencyConfig.short}{" "}
              on {mintChainConfig.full}
            </Typography>
            <div className={styles.links}>
              {lockTxLink && (
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
              {mintTxLink && (
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
                <Typography color="primary" variant="body2">
                  Currently viewing
                </Typography>
              )}
              {!isActive && (
                <SmallActionButton onClick={handleContinue}>
                  {phase === TxPhase.LOCK ? "Continue" : "Finish"} mint
                </SmallActionButton>
              )}
              {!isActive &&
                status === TxEntryStatus.PENDING &&
                lockConfirmations < lockTargetConfirmations && (
                  <Typography color="primary" variant="body2">
                    {lockConfirmations}/{lockTargetConfirmations} Confirmations
                  </Typography>
                )}
            </div>
            <div className={styles.status}>
              <TransactionStatusIndicator
                needsAction={status === TxEntryStatus.ACTION_REQUIRED}
                Icon={StatusIcon}
                showConfirmations={phase === TxPhase.LOCK}
                confirmations={lockConfirmations}
                targetConfirmations={lockTargetConfirmations}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

type ExpirationStatusProps = {
  expiryTime: number;
};

export const ExpirationStatus: FunctionComponent<ExpirationStatusProps> = ({
  expiryTime,
}) => {
  const [timeRemained, setTimeRemained] = useState(
    getRemainingGatewayTime(expiryTime)
  );
  useInterval(() => {
    setTimeRemained((ms) => ms - 1000);
  }, 1000);

  if (timeRemained <= 0) {
    return (
      <Chip
        label={
          <span>
            Gateway Expired{" "}
            <TooltipWithIcon title="This Gateway Address has expired." />
          </span>
        }
      />
    );
  }
  const time = getFormattedHMS(timeRemained);
  return (
    <ExpiresChip
      label={
        <span>
          Expires in: <strong>{time}</strong>{" "}
          <TooltipWithIcon title="This Gateway Address will expire." />
        </span>
      }
    />
  );
};
