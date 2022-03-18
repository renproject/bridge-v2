import {
  Box,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Asset, Chain } from "@renproject/chains";
import BigNumber from "bignumber.js";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  ActionButton,
  ActionButtonWrapper,
  RedButton,
} from "../../components/buttons/Buttons";
import { RichDropdown } from "../../components/dropdowns/RichDropdown";
import {
  BigTopWrapper,
  BigWrapper,
  CenteringSpacedBox,
  MediumWrapper,
  SmallHorizontalPadder,
} from "../../components/layout/LayoutHelpers";
import { CustomLink } from "../../components/links/Links";
import { SimplePagination } from "../../components/pagination/SimplePagination";
import { InlineSkeleton } from "../../components/progress/ProgressHelpers";
import { TransactionsHeader } from "../../components/transactions/TransactionsGrid";
import { Debug } from "../../components/utils/Debug";
import { paths } from "../../pages/routes";
import {
  getAssetConfig,
  getRenAssetConfig,
  supportedAssets,
} from "../../utils/assetsConfig";
import {
  getChainConfig,
  supportedEthereumChains,
} from "../../utils/chainsConfig";
import { getFormattedDateTime } from "../../utils/dates";
import { trimAddress } from "../../utils/strings";
import {
  getAssetOptionData,
  getChainOptionData,
} from "../gateway/components/DropdownHelpers";
import { useAssetDecimals, useGatewayMeta } from "../gateway/gatewayHooks";
import { createGatewayQueryString } from "../gateway/gatewayUtils";
import { GatewayLocationState } from "../gateway/steps/gatewayRoutingUtils";
import {
  useAddressExplorerLink,
  useRenVMExplorerLink,
} from "../network/networkHooks";
import { LocalTxData, useTxsStorage } from "../storage/storageHooks";
import { WalletConnectionProgress } from "../wallet/components/WalletHelpers";
import { useCurrentChainWallet } from "../wallet/walletHooks";
import { $wallet, setChain, setPickerOpened } from "../wallet/walletSlice";
import { WithConfirmDialog } from "./components/TransactionsHelpers";
import {
  AddressOnChainLink,
  BluePadder,
  CustomChip,
  FullWidthWrapper,
  InfoChips,
  TxEnumerationHeader,
  WideDialog,
} from "./components/TransactionsHistoryHelpers";
import { $txHistory, setTxHistoryOpened } from "./transactionsSlice";

const useTransactionHistoryStyles = makeStyles({
  title: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  intro: {
    marginRight: 10,
  },
  spacer: {
    marginRight: 10,
  },
  transactions: {
    // minHeight: 300,
  },
  noTransactions: {
    height: 200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  pagination: {
    paddingTop: 10,
    paddingLeft: 30,
    paddingRight: 30,
  },
});

export const TransactionsHistory: FunctionComponent = () => {
  const styles = useTransactionHistoryStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { dialogOpened } = useSelector($txHistory);

  const { chain } = useSelector($wallet);
  const { connected, account } = useCurrentChainWallet();
  const chainConfig = getChainConfig(chain);

  const [asset, setAsset] = useState<Asset>();
  const handleAssetChange = useCallback((event) => {
    setAsset(event.target.value);
  }, []);

  const handleTxHistoryClose = useCallback(() => {
    dispatch(setTxHistoryOpened(false));
  }, [dispatch]);

  const handleWalletPickerOpen = useCallback(() => {
    dispatch(setPickerOpened(true));
  }, [dispatch]);

  const handleChainChange = useCallback(
    (event) => {
      dispatch(setChain(event.target.value));
    },
    [dispatch]
  );

  const handleRemoveAll = useCallback(() => {
    //dp
  }, []);

  const handleRemoveVisible = useCallback(() => {
    //do
  }, []);

  return (
    <WideDialog open={dialogOpened} onClose={handleTxHistoryClose}>
      {
        <>
          <TransactionsHeader
            title={
              <div className={styles.title}>
                <span className={styles.intro}>Txs:</span>
                <RichDropdown
                  className={styles.spacer}
                  condensed
                  label={t("common.chain-label")}
                  supplementalLabel={t("common.blockchain-label")}
                  getOptionData={getChainOptionData}
                  options={supportedEthereumChains}
                  value={chain}
                  onChange={handleChainChange}
                  nameVariant="full"
                />
                {Boolean(account) && (
                  <span className={styles.spacer}>
                    {trimAddress(account, 8)}
                  </span>
                )}
                <RichDropdown
                  condensed
                  label={t("common.asset-label")}
                  getOptionData={getAssetOptionData}
                  options={supportedAssets}
                  value={asset}
                  onChange={handleAssetChange}
                  nameVariant="short"
                  showNone
                  noneLabel="All Assets"
                />
              </div>
            }
          >
            <TxHistoryMenu
              onRemoveFiltered={handleRemoveVisible}
              onRemoveAll={handleRemoveAll}
              disabled={!connected}
            />
          </TransactionsHeader>
        </>
      }
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
        <AddressTransactions address={account} from={chain} asset={asset} />
      )}
    </WideDialog>
  );
};

type TxHistoryMenuProps = {
  onRemoveFiltered: () => void;
  onRemoveAll: () => void;
  disabled?: boolean;
};

const TxHistoryMenu: FunctionComponent<TxHistoryMenuProps> = ({
  onRemoveFiltered,
  onRemoveAll,
  disabled,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback((event: any) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleToggleMenu = useCallback(
    (event) => {
      if (anchorEl === null) {
        handleOpen(event);
      } else {
        handleClose();
      }
    },
    [anchorEl, handleOpen, handleClose]
  );

  const handleRemoveFiltered = useCallback(() => {
    onRemoveFiltered();
    handleClose();
  }, [onRemoveFiltered, handleClose]);

  const handleRemoveAll = useCallback(() => {
    onRemoveAll();
    handleClose();
  }, [onRemoveAll, handleClose]);

  const warningActionText = "Remove Transactions from History";
  const warningReason =
    "This action is permanent. If you have unfinished transactions, your funds could be lost.";
  return (
    <div>
      <IconButton
        onClick={handleToggleMenu}
        aria-controls="history-menu"
        aria-haspopup="true"
        disabled={disabled}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="history-menu"
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        getContentAnchorEl={null}
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        <div>
          <WithConfirmDialog
            reason={warningReason}
            actionText={warningActionText}
            onAction={handleRemoveFiltered}
            renderComponent={(onConfirm) => (
              <MenuItem onClick={onConfirm}>Remove Filtered Txs</MenuItem>
            )}
          />
          <WithConfirmDialog
            reason={warningReason}
            actionText={warningActionText}
            onAction={handleRemoveAll}
            renderComponent={(onConfirm, innerRef) => (
              <MenuItem ref={innerRef} onClick={onConfirm} disabled={true}>
                Remove All Txs
              </MenuItem>
            )}
          />
        </div>
      </Menu>
    </div>
  );
};

export const decomposeLocalTxParams = (localTx: LocalTxData) => {
  const asset = localTx?.params?.asset as Asset;
  const from = localTx?.params?.fromTx?.chain as Chain;
  const to = localTx?.params?.to.chain as Chain;

  return { asset, from, to };
};

type AddressTransactionsProps = {
  address: string;
  from?: Chain | string;
  asset?: Asset | string;
};

const AddressTransactions: FunctionComponent<AddressTransactionsProps> = ({
  address,
  from,
  asset,
}) => {
  const styles = useTransactionHistoryStyles();
  const { localTxs, removeLocalTx, getLocalTxsForAddress } = useTxsStorage();

  const pendingTxsMap = getLocalTxsForAddress(address, {
    done: false,
    from,
    asset,
  });
  const pendingTxs = Object.entries(pendingTxsMap);
  const pendingCount = Object.entries(pendingTxs).length;

  const completedTxsMap = getLocalTxsForAddress(address, {
    done: true,
    from,
    asset,
  });
  const completedTxs = Object.entries(completedTxsMap);
  const completedCount = completedTxs.length;

  const allTxs = [...pendingTxs, ...completedTxs].sort((a, b) => {
    return b[1].timestamp - a[1].timestamp;
  });

  const handleRemoveTx = useCallback(
    (renVmHash: string) => {
      removeLocalTx(address, renVmHash);
    },
    [address, removeLocalTx]
  );

  const renVMTxMap = Object.entries(localTxs)
    .filter(([localAddress]) => localAddress === address)
    .map(([localAddress, txHashMap]) => txHashMap);

  const [page, setPage] = useState(1);
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);
  useEffect(() => {
    setPage(0);
  }, [address, from]);

  const rowsPerPage = 3;
  const totalCount = pendingCount + completedCount;
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  return (
    <>
      <div className={styles.transactions}>
        <TxEnumerationHeader>
          {pendingCount > 0 && (
            <span>
              Pending ({pendingCount}){completedCount > 0 && <span> | </span>}
            </span>
          )}
          {completedCount > 0 && <span>Completed ({completedCount}) </span>}
        </TxEnumerationHeader>
        {allTxs.map(([renVMHash, localTxData], index) => {
          const isInRange = index >= startIndex && index < endIndex;
          if (isInRange) {
            return (
              <RenVMTransactionEntry
                key={renVMHash}
                address={address}
                renVMHash={renVMHash}
                localTxData={localTxData}
                onRemoveTx={handleRemoveTx}
              />
            );
          }
          return null;
        })}
        {totalCount === 0 && (
          <div className={styles.noTransactions}>
            <Typography variant="h6">
              No transactions for selected filters
            </Typography>
          </div>
        )}
      </div>
      <div className={styles.pagination}>
        <SimplePagination
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={totalCount > 0 ? page : 0}
          onPageChange={handleChangePage}
        />
      </div>
      <Debug it={{ page, renVMTxMap, localTxs }} />
    </>
  );
};

const resolveTxTypeLabels = (
  isMint: boolean | null,
  isRelease: boolean | null,
  isH2H: boolean | null
) => {
  let fullTypeLabel = null;
  let typeLabel = null;
  if (isMint !== null && isRelease !== null && isH2H !== null) {
    typeLabel = isMint ? "Mint" : "Release";
    const h2hLabel = isH2H ? "H2H " : "";
    fullTypeLabel = h2hLabel + " " + typeLabel;
  }

  return { typeLabel, fullTypeLabel };
};

const useRenVMTransactionEntryStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingRight: 30,
    paddingLeft: 30,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

type RenVMTransactionEntryProps = {
  address: string;
  renVMHash: string;
  localTxData: LocalTxData;
  onRemoveTx: (renVMHash: string) => void;
};

const RenVMTransactionEntry: FunctionComponent<RenVMTransactionEntryProps> = ({
  address,
  renVMHash,
  localTxData,
  onRemoveTx,
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const styles = useRenVMTransactionEntryStyles();
  const { params, timestamp, done } = localTxData;
  const { asset, from, to } = decomposeLocalTxParams(localTxData);
  const { isMint, isRelease, isH2H } = useGatewayMeta(asset, from, to);
  const { date, time } = getFormattedDateTime(timestamp);
  const { getRenVmExplorerLink } = useRenVMExplorerLink();
  const { fullTypeLabel, typeLabel } = resolveTxTypeLabels(
    isMint,
    isRelease,
    isH2H
  );

  const { getAddressExplorerLink: getFromAddressLink } =
    useAddressExplorerLink(from);
  const { getAddressExplorerLink: getToAddressLink } =
    useAddressExplorerLink(to);
  const { decimals: fromAssetDecimals } = useAssetDecimals(from, asset);

  const fromChainConfig = getChainConfig(from);
  const toChainConfig = getChainConfig(to);
  const assetConfig = getAssetConfig(asset);
  const renAssetConfig = getRenAssetConfig(asset);

  const renVMUrl = getRenVmExplorerLink(renVMHash);
  const fromAddressUrl = getFromAddressLink(address);
  const toAddressUrl = getToAddressLink(address);
  const toAddress = (params.to as any).params.address || ""; //TODO consider adding to decomposeLocalTxparams
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

  const [removing, setRemoving] = useState(false);
  const handleRemove = useCallback(() => {
    setRemoving(true);
    onRemoveTx(renVMHash);
    setRemoving(false);
  }, [renVMHash, onRemoveTx]);

  const resumeDisabled =
    amount === null || isMint === null || isRelease === null || isH2H === null;
  const [resuming, setResuming] = useState(false);
  const handleResume = useCallback(() => {
    console.log("resuming tx", renVMHash);
    setResuming(true);
    if (amount === null) {
      setResuming(false);
      return;
    }
    console.log(isMint, isH2H);
    const state: GatewayLocationState = {
      renVMHashReplaced: true,
    };
    if (isMint && isH2H) {
      console.log("h2h: mint");
      history.push({
        state,
        pathname: paths.MINT__GATEWAY_H2H,
        search:
          "?" +
          createGatewayQueryString(
            {
              asset,
              from,
              to,
              amount,
            },
            {
              renVMHash,
            }
          ),
      });
    } else if (isRelease && isH2H) {
      console.log("h2h release");
      history.push({
        state,
        pathname: paths.RELEASE__GATEWAY_H2H,
        search:
          "?" +
          createGatewayQueryString(
            {
              asset,
              from,
              to,
              amount,
              toAddress,
            },
            {
              renVMHash,
            }
          ),
      });
    } else if (isRelease) {
      console.log("standard release");
      history.push({
        state,
        pathname: paths.RELEASE__GATEWAY_STANDARD,
        search: createGatewayQueryString(
          {
            asset,
            from,
            to,
            amount,
            toAddress,
          },
          {
            renVMHash,
          }
        ),
      });
    }
    dispatch(setTxHistoryOpened(false));
    setResuming(false);
  }, [
    dispatch,
    history,
    renVMHash,
    isMint,
    isRelease,
    isH2H,
    amount,
    asset,
    from,
    to,
    toAddress,
  ]);

  return (
    <div className={styles.root}>
      <Box mb={1}>
        <InfoChips>
          <CustomChip label={date} />
          <CustomChip label={time} />
          {fullTypeLabel === null ? (
            <InlineSkeleton width={40} height={16} variant="rect" />
          ) : (
            <CustomChip label={fullTypeLabel} />
          )}
          {done ? (
            <CustomChip size="small" color="success" label="Finished" />
          ) : (
            <CustomChip size="small" color="primary" label="Pending" />
          )}
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
                {typeLabel === null ? (
                  <InlineSkeleton variant="rect" width={35} height={13} />
                ) : (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="span"
                  >
                    {typeLabel}:
                  </Typography>
                )}{" "}
                <Typography variant="body2" component="span">
                  {amount !== null ? amount : <InlineSkeleton width={30} />}{" "}
                  {assetName}
                </Typography>
              </div>
              <AssetIcon />
            </FullWidthWrapper>
          </SmallHorizontalPadder>
          <Box mt={2}>
            {done ? (
              <Button
                variant="outlined"
                size="small"
                color="primary"
                fullWidth
                disabled={removing}
                onClick={handleRemove}
              >
                Remove from Local Storage
              </Button>
            ) : (
              <WithConfirmDialog
                onAction={handleRemove}
                reason="This transaction seems to be pending. Resume and finish it first."
                actionText="I consent, remove Transaction"
                renderComponent={(onConfirm) => (
                  <RedButton
                    variant="outlined"
                    size="small"
                    color="secondary"
                    fullWidth
                    disabled={removing}
                    onClick={onConfirm}
                  >
                    Remove from Local Storage
                  </RedButton>
                )}
              >
                <Typography variant="body1" color="textSecondary">
                  Or ensure it is completed it in RenVM Explorer
                </Typography>
              </WithConfirmDialog>
            )}
          </Box>
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
                <CustomLink
                  underline="hover"
                  href={renVMUrl}
                  external
                  externalPointer={false}
                >
                  {trimAddress(renVMHash, 8)}
                </CustomLink>
              </Typography>
            </FullWidthWrapper>
          </SmallHorizontalPadder>
          <Box mt={2}>
            <Button
              variant="contained"
              size="small"
              color="primary"
              fullWidth
              disabled={resuming || resumeDisabled}
              onClick={handleResume}
            >
              {done ? "View details" : "Resume Transaction"}
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Debug disable it={localTxData} />
    </div>
  );
};
