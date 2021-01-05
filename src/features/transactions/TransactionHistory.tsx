import { Box, Typography } from "@material-ui/core";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../components/buttons/Buttons";
import { AssetDropdown } from "../../components/dropdowns/AssetDropdown";
import {
  BigTopWrapper,
  BigWrapper,
  CenteringSpacedBox,
  MediumWrapper,
  PaperSpacerWrapper,
} from "../../components/layout/LayoutHelpers";
import {
  ShowEntry,
  SimplePagination,
} from "../../components/pagination/SimplePagination";
import { CenteredProgress } from "../../components/progress/ProgressHelpers";
import {
  TransactionsContent,
  TransactionsHeader,
  TransactionsPaginationWrapper,
  TransactionsStatusHeader,
} from "../../components/transactions/TransactionsGrid";
import { WalletStatus } from "../../components/utils/types";
import { WalletConnectionProgress } from "../../components/wallet/WalletHelpers";
import { useSelectedChainWallet } from "../../providers/multiwallet/multiwalletHooks";
import { db } from "../../services/database/database";
import {
  getChainConfig,
  supportedMintDestinationChains,
} from "../../utils/assetConfigs";
import { isFirstVowel } from "../../utils/strings";
import { MintTransactionEntryResolver } from "../mint/components/MintHistoryHelpers";
import { ReleaseTransactionEntryResolver } from "../release/components/ReleaseHistoryHelpers";
import {
  $wallet,
  $walletSignatures,
  setChain,
  setUser,
  setWalletPickerOpened,
} from "../wallet/walletSlice";
import { TransactionHistoryDialog } from "./components/TransactionHistoryHelpers";
import {
  $orderedTransactions,
  $transactionsData,
  $txHistoryOpened,
  BridgeTransaction,
  setTransactions,
  setTxHistoryOpened,
  setTxsPending,
} from "./transactionsSlice";
import { isTransactionCompleted, TxType } from "./transactionsUtils";

export const TransactionHistory: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { account, status } = useSelectedChainWallet();
  const walletConnected = status === WalletStatus.CONNECTED;
  const { chain, user } = useSelector($wallet);
  const allTransactions = useSelector($orderedTransactions);
  const { txsPending } = useSelector($transactionsData);
  const { signature, rawSignature } = useSelector($walletSignatures);
  const opened = useSelector($txHistoryOpened);

  useEffect(() => {
    if (account && signature && rawSignature) {
      dispatch(setTxsPending(true));
      db.getUser(account.toLowerCase(), {
        signature,
        rawSignature,
      })
        .then((userData) => {
          dispatch(setUser(userData));
        })
        .catch(console.error);
    }
  }, [dispatch, account, signature, rawSignature]);

  useEffect(() => {
    if (user) {
      db.getTxs(signature)
        .then((txsData) => {
          dispatch(setTransactions(txsData as Array<BridgeTransaction>));
          dispatch(setTxsPending(false));
        })
        .catch(console.error);
    }
  }, [dispatch, user, signature]);

  const chainConfig = getChainConfig(chain);
  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setWalletPickerOpened(true));
  }, [dispatch]);

  const handleChainChange = useCallback(
    (event) => {
      dispatch(setChain(event.target.value));
    },
    [dispatch]
  );

  const handleClose = useCallback(() => {
    dispatch(setTxHistoryOpened(false));
  }, [dispatch]);

  const all = allTransactions.length;

  const [page, setPage] = useState(0);
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const itemsCount = all;
  const itemsPerPage = 4;

  const showTransactions = walletConnected && !txsPending;

  const { pendingTxsCount, completedTxsCount } = useMemo(() => {
    const pendingTxsCount = allTransactions.filter(
      (tx) => !isTransactionCompleted(tx)
    ).length;
    const completedTxsCount = allTransactions.filter((tx) =>
      isTransactionCompleted(tx)
    ).length;
    return { pendingTxsCount, completedTxsCount };
  }, [allTransactions]);

  return (
    <TransactionHistoryDialog
      open={opened}
      onBackdropClick={handleClose}
      keepMounted
    >
      <TransactionsHeader title="Transactions">
        <Box mr={1}>
          <Typography variant="subtitle2">Viewing: </Typography>
        </Box>
        <AssetDropdown
          mode="chain"
          condensed
          available={supportedMintDestinationChains}
          value={chain}
          onChange={handleChainChange}
        />
      </TransactionsHeader>
      {(!walletConnected || txsPending) && (
        <>
          <TransactionsStatusHeader />
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
              {txsPending && (
                <BigWrapper>
                  <CenteredProgress color="primary" size={100} />
                </BigWrapper>
              )}
            </BigTopWrapper>
          </TransactionsContent>
        </>
      )}
      {showTransactions && (
        <>
          <div>
            {allTransactions
              .map((tx, index) => {
                const startIndex = page * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const indexIsInCurrentPage =
                  index >= startIndex && index < endIndex;

                const isFirstShown = index === startIndex;
                const isPreviousDifferent =
                  index > 0 &&
                  isTransactionCompleted(tx) &&
                  !isTransactionCompleted(allTransactions[index - 1]);
                const showHeader = isFirstShown || isPreviousDifferent;
                const isCurrentCompleted = isTransactionCompleted(tx);
                const title = isCurrentCompleted
                  ? `Completed (${completedTxsCount})`
                  : `Pending (${pendingTxsCount})`;

                const Header = <TransactionsStatusHeader title={title} />;

                if (tx.type === TxType.MINT) {
                  return (
                    <ShowEntry when={indexIsInCurrentPage} key={tx.id}>
                      {showHeader && Header}
                      <MintTransactionEntryResolver tx={tx} />
                    </ShowEntry>
                  );
                } else {
                  return (
                    <ShowEntry when={indexIsInCurrentPage} key={tx.id}>
                      {showHeader && Header}
                      <ReleaseTransactionEntryResolver tx={tx} />
                    </ShowEntry>
                  );
                }
              })}
          </div>
          {allTransactions.length === 0 && (
            <PaperSpacerWrapper>
              <Typography variant="body2" align="center" color="textSecondary">
                You have no transactions...
              </Typography>
            </PaperSpacerWrapper>
          )}
          <TransactionsPaginationWrapper>
            <SimplePagination
              count={itemsCount}
              rowsPerPage={itemsPerPage}
              page={page}
              onChangePage={handleChangePage}
            />
          </TransactionsPaginationWrapper>
        </>
      )}
    </TransactionHistoryDialog>
  );
};
