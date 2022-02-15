import { Grid, Typography } from "@material-ui/core";
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
import { PaperContent } from "../../components/layout/Paper";
import { TransactionsHeader } from "../../components/transactions/TransactionsGrid";
import { LabelWithValue } from "../../components/typography/TypographyHelpers";
import { Debug } from "../../components/utils/Debug";
import { getChainConfig } from "../../utils/chainsConfig";
import { getFormattedDateTime } from "../../utils/dates";
import { trimAddress } from "../../utils/strings";
import { LocalTxData, useTxsStorage } from "../storage/storageHooks";
import { WalletConnectionProgress } from "../wallet/components/WalletHelpers";
import { useCurrentChainWallet } from "../wallet/walletHooks";
import { $wallet, setPickerOpened } from "../wallet/walletSlice";
import {
  InfoChip,
  InfoChips,
  WideDialog,
} from "./components/TransactionsHistoryHelpers";
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
          <PaperContent>
            <AddressTransactions address={account} />
          </PaperContent>
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
  const { getLocalTxsForAddress } = useTxsStorage();

  const pendingLocalTxs = getLocalTxsForAddress(address, {
    done: false,
  });
  const pendingCount = Object.entries(pendingLocalTxs).length;

  const { localTxs } = useTxsStorage();

  const renVMTxMap = Object.entries(localTxs)
    .filter(([localAddress]) => localAddress === address)
    .map(([localAddress, txHashMap]) => txHashMap);

  return (
    <>
      {pendingCount > 0 && (
        <Typography variant="body2">
          <strong>Pending ({pendingCount})</strong>
        </Typography>
      )}
      <Debug it={{ pendingLocalTxs }} />
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
  data: LocalTxData;
};
const RenVMTransactionEntry: FunctionComponent<RenVMTransactionEntryProps> = ({
  hash,
  data,
}) => {
  // TODO: add link to renVM tx explorer and issue resolver
  const { date, time } = getFormattedDateTime(data.timestamp);
  const typeLabel = "H2H Mint";
  return (
    <div>
      <InfoChips>
        <InfoChip label={date} />
        <InfoChip label={time} />
        <InfoChip label={typeLabel} />
      </InfoChips>
      <Grid container>
        <Grid item>
          <LabelWithValue label="Sender Address" value="Recipient Address" />
        </Grid>
      </Grid>
      hash: {hash}
      <Debug it={data} />
    </div>
  );
};
