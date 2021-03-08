import { Box, Typography } from "@material-ui/core";
import React, { FunctionComponent, useCallback, useState } from "react";
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
import { SimplePagination } from "../../components/pagination/SimplePagination";
import {
  TransactionsContent,
  TransactionsHeader,
  TransactionsPaginationWrapper,
  TransactionsStatusHeader,
} from "../../components/transactions/TransactionsGrid";
import { Debug } from "../../components/utils/Debug";
import { WalletConnectionProgress } from "../../components/wallet/WalletHelpers";
import {
  getChainConfig,
  supportedLockCurrencies,
  supportedMintDestinationChains,
} from "../../utils/assetConfigs";
import { isFirstVowel } from "../../utils/strings";
import { $mint, setMintCurrency } from "../mint/mintSlice";
import { useSelectedChainWallet } from "../wallet/walletHooks";
import {
  $wallet,
  setChain,
  setWalletPickerOpened,
} from "../wallet/walletSlice";
import { TransactionHistoryDialog } from "./components/TransactionHistoryHelpers";
import { $currentTxId, $txHistoryOpened } from "./transactionsSlice";

export const MintTransactionHistory: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { walletConnected } = useSelectedChainWallet();
  const { chain } = useSelector($wallet);
  const { currency } = useSelector($mint);
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
            </BigTopWrapper>
          </TransactionsContent>
        </>
      )}
      <Debug it={{ activeTxId }} />
      <TransactionsPaginationWrapper>
        <SimplePagination
          count={1}
          rowsPerPage={3}
          page={page}
          onChangePage={handleChangePage}
        />
      </TransactionsPaginationWrapper>
    </TransactionHistoryDialog>
  );
};
