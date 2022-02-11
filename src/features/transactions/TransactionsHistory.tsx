import { Typography } from "@material-ui/core";
import { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../components/buttons/Buttons";
import {
  BigTopWrapper,
  BigWrapper,
  CenteringSpacedBox,
  MediumWrapper,
} from "../../components/layout/LayoutHelpers";
import { TransactionsHeader } from "../../components/transactions/TransactionsGrid";
import { Debug } from "../../components/utils/Debug";
import { getChainConfig } from "../../utils/chainsConfig";
import { trimAddress } from "../../utils/strings";
import { useTxsStorage } from "../storage/storageHooks";
import { WalletConnectionProgress } from "../wallet/components/WalletHelpers";
import { useCurrentChainWallet } from "../wallet/walletHooks";
import { $wallet, setPickerOpened } from "../wallet/walletSlice";
import { WideDialog } from "./components/TransactionsHistoryHelpers";
import { $txHistory, setTxHistoryOpened } from "./transactionsSlice";

export const TransactionsHistory: FunctionComponent = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { dialogOpened } = useSelector($txHistory);

  const { chain } = useSelector($wallet);
  const { connected, account } = useCurrentChainWallet();
  const chainConfig = getChainConfig(chain);

  const handleTxHistoryClose = useCallback(() => {
    dispatch(setTxHistoryOpened(false));
  }, [dispatch]);

  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setPickerOpened(true));
  }, [dispatch]);

  return (
    <WideDialog
      open={dialogOpened}
      onEscapeKeyDown={handleTxHistoryClose}
      onBackdropClick={handleTxHistoryClose}
    >
      {!connected && (
        <BigTopWrapper>
          <MediumWrapper>
            <Typography variant="body1" align="center">
              {t("history.please-connect-wallet", {
                chain: chainConfig.fullName,
              })}
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
                {t("wallet.connect")}
              </ActionButton>
            </ActionButtonWrapper>
          </BigWrapper>
        </BigTopWrapper>
      )}
      {connected && (
        <>
          <TransactionsHeader
            title={t("history.header", {
              address: trimAddress(account, 16),
              chain: chainConfig.fullName,
            })}
          />
          <AddressTransactions address={account} />
        </>
      )}
    </WideDialog>
  );
};

type AddressTransactionsProps = {
  address: string;
};

const AddressTransactions: FunctionComponent<AddressTransactionsProps> = ({
  address,
}) => {
  const { localTxs } = useTxsStorage();

  const renVMTxMap = Object.entries(localTxs)
    .filter(([localAddress]) => localAddress === address)
    .map(([localAddress, txHashMap]) => txHashMap);

  return (
    <>
      {renVMTxMap.map((renVMTxHashMap) => {
        return Object.entries(renVMTxHashMap).map(([renVMTxHash, txEntry]) => (
          <RenVMTransactionEntry hash={renVMTxHash} data={txEntry} />
        ));
      })}
      <Debug it={{ renVMTxMap, localTxs }} />
    </>
  );
};

type RenVMTransactionEntryProps = {
  hash: string;
  data: any;
};
const RenVMTransactionEntry: FunctionComponent<RenVMTransactionEntryProps> = ({
  hash,
  data,
}) => {
  // TODO: add link to renVM tx explorer and issue resolver
  return (
    <div>
      hash: {hash}
      <Debug it={data} />
    </div>
  );
};
