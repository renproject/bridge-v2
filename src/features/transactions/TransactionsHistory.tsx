import { Box, Button, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Asset, Chain } from "@renproject/chains";
import BigNumber from "bignumber.js";
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
  SmallHorizontalPadder,
} from "../../components/layout/LayoutHelpers";
import { CustomLink } from "../../components/links/Links";
import { TransactionsHeader } from "../../components/transactions/TransactionsGrid";
import { Debug } from "../../components/utils/Debug";
import { getChainConfig } from "../../utils/chainsConfig";
import { getFormattedDateTime } from "../../utils/dates";
import { trimAddress } from "../../utils/strings";
import { getAssetConfig, getRenAssetConfig } from "../../utils/tokensConfig";
import { useAssetDecimals, useGatewayMeta } from "../gateway/gatewayHooks";
import {
  useAddressExplorerLink,
  useRenVMExplorerLink,
} from "../network/networkHooks";
import { LocalTxData, useTxsStorage } from "../storage/storageHooks";
import { WalletConnectionProgress } from "../wallet/components/WalletHelpers";
import { useCurrentChainWallet } from "../wallet/walletHooks";
import { $wallet, setPickerOpened } from "../wallet/walletSlice";
import {
  AddressOnChainLink,
  BluePadder,
  FullWidthWrapper,
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
  const { getLocalTxsForAddress } = useTxsStorage();

  const pendingLocalTxs = getLocalTxsForAddress(address, {
    done: false,
  });
  const pendingCount = Object.entries(pendingLocalTxs).length;

  const { localTxs, removeLocalTx } = useTxsStorage();

  const handleRemoveTx = useCallback(
    (renVmHash: string) => {
      removeLocalTx(address, renVmHash);
    },
    [address, removeLocalTx]
  );

  const handleResumeTx = useCallback(
    (renVmHash: string) => {
      console.error("finish handleResumeTx", address, renVmHash);
    },
    [address]
  );

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
          <RenVMTransactionEntry
            address={address}
            hash={renVMTxHash}
            data={txEntry}
            onRemove={handleRemoveTx}
            onResume={handleResumeTx}
          />
        ));
      })}
      <Debug it={{ renVMTxMap, localTxs }} />
    </>
  );
};

const useRenVMTransactionEntryStyles = makeStyles((theme) => ({
  root: {
    paddingBottom: 20,
    paddingRight: 30,
    paddingLeft: 30,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

type RenVMTransactionEntryProps = {
  address: string;
  hash: string;
  data: LocalTxData;
  onRemove: (renVMHash: string) => void;
  onResume: (renVMHash: string) => void;
};
const RenVMTransactionEntry: FunctionComponent<RenVMTransactionEntryProps> = ({
  address,
  hash,
  data,
  onRemove,
  onResume,
}) => {
  const styles = useRenVMTransactionEntryStyles();
  const { params, timestamp, done } = data;
  const asset = params.asset as Asset;
  const to = params.to.chain as Chain;
  const from = params.fromTx.chain as Chain;
  const { isMint, isH2H } = useGatewayMeta(asset, from, to);
  const { date, time } = getFormattedDateTime(timestamp);
  const { getRenVmExplorerLink } = useRenVMExplorerLink();
  const typeLabel = isMint ? "Mint" : "Release";
  const h2hLabel = isH2H ? "H2H " : "";
  const fullTypeLabel = h2hLabel + typeLabel;

  const { getAddressExplorerLink: getFromAddressLink } =
    useAddressExplorerLink(from);
  const { getAddressExplorerLink: getToAddressLink } =
    useAddressExplorerLink(to);
  const { decimals: fromAssetDecimals } = useAssetDecimals(from, asset);

  const fromChainConfig = getChainConfig(from);
  const toChainConfig = getChainConfig(to);
  const assetConfig = getAssetConfig(asset);
  const renAssetConfig = getRenAssetConfig(asset);

  const renVMUrl = getRenVmExplorerLink(hash);
  const fromAddressUrl = getFromAddressLink(address);
  const toAddressUrl = getToAddressLink(address);
  const toAddress = (params.to as any).address || "";
  const amount =
    fromAssetDecimals !== null
      ? new BigNumber(params.fromTx.amount)
          .shiftedBy(-fromAssetDecimals)
          .toString()
      : null;
  const assetName = isMint ? renAssetConfig.shortName : assetConfig.shortName;
  const AssetIcon = isMint ? assetConfig.RenIcon : assetConfig.Icon;
  const ToChainIcon = toChainConfig.Icon;
  const FromChainIcon = fromChainConfig.Icon;

  const handleRemove = useCallback(() => {
    onRemove(hash);
  }, [hash, onRemove]);

  const handleResume = useCallback(() => {
    onResume(hash);
  }, [hash, onResume]);

  return (
    <div className={styles.root}>
      <Box mb={1}>
        <InfoChips>
          <InfoChip label={date} />
          <InfoChip label={time} />
          <InfoChip label={fullTypeLabel} />
        </InfoChips>
      </Box>
      <Grid container spacing={2}>
        <Grid item sm={12} md={6}>
          <BluePadder>
            <FullWidthWrapper>
              <Typography variant="body2">Sender Address</Typography>
              <AddressOnChainLink
                address={address}
                addressUrl={fromAddressUrl}
                Icon={FromChainIcon}
              />
            </FullWidthWrapper>
          </BluePadder>
        </Grid>
        <Grid item sm={12} md={6}>
          <BluePadder>
            <FullWidthWrapper>
              <Typography variant="body2">Recipient Address</Typography>
              <AddressOnChainLink
                address={toAddress}
                addressUrl={toAddressUrl}
                Icon={ToChainIcon}
              />
            </FullWidthWrapper>
          </BluePadder>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item sm={12} md={6}>
          <SmallHorizontalPadder>
            <FullWidthWrapper>
              <div>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="span"
                >
                  {typeLabel}:{" "}
                </Typography>
                <Typography variant="body2" component="span">
                  {amount} {assetName}
                </Typography>
              </div>
              <AssetIcon />
            </FullWidthWrapper>
          </SmallHorizontalPadder>
        </Grid>
        <Grid item sm={12} md={6}>
          <SmallHorizontalPadder>
            <FullWidthWrapper>
              <Typography
                variant="body2"
                component="span"
                color="textSecondary"
              >
                renVMTxHash:
              </Typography>
              <Typography variant="body2" component="span">
                <CustomLink underline="hover" href={renVMUrl}>
                  {trimAddress(hash, 8)}
                </CustomLink>
              </Typography>
            </FullWidthWrapper>
          </SmallHorizontalPadder>
          <Box mt={2}>
            {done ? (
              <Button
                variant="outlined"
                size="small"
                color="primary"
                fullWidth
                onClick={handleRemove}
              >
                Delete from Local Storage
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                color="primary"
                fullWidth
                onClick={handleResume}
              >
                Resume Transaction
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
      <Debug disable it={data} />
    </div>
  );
};
