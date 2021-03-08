import { Box, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { RenNetwork } from "@renproject/interfaces";
import React, {
  FunctionComponent,
  useCallback,
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
  CompletedIcon,
  EmptyIcon,
  TooltipIcon,
} from "../../components/icons/RenIcons";
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
import { TransactionStatusIndicator } from "../../components/progress/ProgressHelpers";
import {
  TransactionsContent,
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
import { getFormattedDateTime } from "../../utils/dates";
import { isFirstVowel } from "../../utils/strings";
import { useDepositPagination } from "../mint/mintHooks";
import { $mint, resetMint, setMintCurrency } from "../mint/mintSlice";
import { createMintTransaction, getLockAndMintParams } from "../mint/mintUtils";
import { $renNetwork } from "../network/networkSlice";
import { useSelectedChainWallet } from "../wallet/walletHooks";
import {
  $wallet,
  setChain,
  setWalletPickerOpened,
} from "../wallet/walletSlice";
import {
  ExpiresChip,
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
  isTransactionCompleted,
  TxEntryStatus,
  TxPhase,
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
  return (
    <>
      <GatewayEntry tx={tx} />
      <Debug disable wrapper it={{ dayOffset, isActive }} />
    </>
  );
};

const standardPaddings = {
  paddingLeft: 30,
  paddingRight: 30,
};

const standardShadow = `0px 0px 4px rgba(0, 27, 58, 0.1)`;

export const useGatewayResolverStyles = makeStyles((theme) => ({
  root: {
    borderTop: `1px solid ${theme.palette.divider}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginTop: 8,
    boxShadow: standardShadow,
  },
  details: {
    ...standardPaddings,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  datetime: {},
  gateway: {},
  counter: {},
  multiple: {
    ...standardPaddings,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  multipleLabel: {
    marginRight: 16,
  },
  multiplePagination: {},
  description: {
    marginTop: 3,
    marginBottom: 3,
  },
  title: {
    fontSize: 15,
  },
  links: {},
  expired: {
    fontSize: 14,
    display: "inline-block",
    marginRight: 8,
  },
  link: {
    fontSize: 14,
    display: "inline-block",
    marginRight: 24,
    "&:last-child": {
      marginRight: 0,
    },
  },
  tooltipIcon: {
    fontSize: 15,
    marginBottom: -2,
    marginRight: 2,
  },
  actions: {
    flexGrow: 1,
    paddingRight: 20,
    display: "flex",
    justifyContent: "flex-end",
  },
  status: {},
}));

const GatewayEntry: FunctionComponent<TransactionItemProps> = ({
  tx,
  isActive,
  onContinue,
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
    lockConfirmations,
    lockTargetConfirmations,
    lockTxLink,
    lockTxAmount,
    mintCurrencyConfig,
    mintChainConfig,
    mintTxLink,
    meta: { status, phase, createdTimestamp, transactionsCount },
  } = getLockAndMintParams(tx, currentHash);

  const handleRestart = useCallback(() => {
    const { lockCurrencyConfig, mintChainConfig } = getLockAndMintParams(
      tx,
      currentHash
    );
    dispatch(setTxHistoryOpened(false));
    dispatch(
      resetMint({
        currency: lockCurrencyConfig.symbol,
      })
    );
    dispatch(setChain(mintChainConfig.symbol));
    history.push({
      pathname: paths.MINT,
    });
  }, [dispatch, history, tx, currentHash]);

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
        <div className={styles.details}>
          <div className={styles.datetime}>
            <Typography variant="overline">{date}</Typography>
          </div>
          <div className={styles.gateway}>
            <Typography variant="overline">{tx.gatewayAddress}</Typography>
          </div>
          <div className={styles.counter}>
            <ExpiresChip label="Expires in" />
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
        <div className={styles.description}>
          <Typography variant="body2" className={styles.title}>
            Mint {lockTxAmount || tx.targetAmount} {mintCurrencyConfig.short} on{" "}
            {mintChainConfig.full}
          </Typography>
        </div>
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
          {status === TxEntryStatus.EXPIRED && (
            <>
              <Typography
                variant="body2"
                color="textSecondary"
                display="inline"
                className={styles.expired}
              >
                <Tooltip title="This Gateway Address has expired. Gateway Addresses are only valid for 24 hours. If you have sent funds to this Gateway Address but have not submitted them to the destination chain then they are lost forever.">
                  <span>
                    <TooltipIcon
                      fontSize="inherit"
                      color="inherit"
                      className={styles.tooltipIcon}
                    />
                  </span>
                </Tooltip>
                Expired
              </Typography>
              <Link
                color="primary"
                underline="hover"
                className={styles.link}
                onClick={handleRestart}
              >
                Restart transaction
              </Link>
            </>
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
    </>
  );
};
