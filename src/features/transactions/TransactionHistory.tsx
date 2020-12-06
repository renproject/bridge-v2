import { Box, Dialog, Typography } from "@material-ui/core";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
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
import { MintTransactionEntryResolver } from "../mint/components/MintHelpers";
import {
  $wallet,
  $walletSignatures,
  setChain,
  setUser,
  setWalletPickerOpened,
} from "../wallet/walletSlice";
import {
  $orderedTransactions,
  $transactionsData,
  $txHistoryOpened,
  BridgeTransaction,
  setTransactions,
  setTxHistoryOpened,
  setTxsPending,
} from "./transactionsSlice";
import { TxType } from "./transactionsUtils";

export const TransactionHistory: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { account, status } = useSelectedChainWallet();
  const walletConnected = status === WalletStatus.CONNECTED;
  const { chain, user } = useSelector($wallet);
  const txs = useSelector($orderedTransactions);
  const { txsPending } = useSelector($transactionsData);
  const { signature, rawSignature } = useSelector($walletSignatures);
  const opened = useSelector($txHistoryOpened);

  useEffect(() => {
    if (account && signature && rawSignature) {
      dispatch(setTxsPending(true));
      console.log("getting user");
      db.getUser(account.toLowerCase(), {
        signature,
        rawSignature,
      })
        .then((userData) => {
          console.log("authenticated", userData);
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

  const all = txs.length;

  const [page, setPage] = useState(0);
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const itemsCount = all;
  const itemsPerPage = 4;

  const showTransactions = walletConnected && !txsPending;
  return (
    <Dialog
      open={opened}
      maxWidth="sm"
      fullWidth
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
                      You must connect {chainConfig.full} to view transactions
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
          <TransactionsStatusHeader title={`All (${all})`} />
          <div>
            {txs.map((tx, index) => {
              const startIndex = page * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const indexIsInCurrentPage =
                index >= startIndex && index < endIndex;

              if (tx.type === TxType.MINT) {
                return (
                  <ShowEntry when={indexIsInCurrentPage}>
                    <MintTransactionEntryResolver key={tx.id} tx={tx} />
                  </ShowEntry>
                );
              } else {
                return <span>Release</span>;
              }
            })}
          </div>
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
    </Dialog>
  );
};
