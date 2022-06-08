import {
  Box,
  Button,
  Checkbox,
  DialogContent,
  DialogTitle,
  Fade,
  FormControlLabel,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Asset, Chain } from "@renproject/chains";
import BigNumber from "bignumber.js";
import classNames from "classnames";
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
} from "../../components/buttons/Buttons";
import { RichDropdown } from "../../components/dropdowns/RichDropdown";
import { ArrowRightIcon, RemoveIcon } from "../../components/icons/RenIcons";
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
import { Debug } from "../../components/utils/Debug";
import { featureFlags } from "../../constants/featureFlags";
import { paths } from "../../pages/routes";
import {
  getAssetConfig,
  getRenAssetConfig,
  supportedAssets,
} from "../../utils/assetsConfig";
import {
  getChainConfig,
  supportedContractChains,
} from "../../utils/chainsConfig";
import { getFormattedDateTime } from "../../utils/dates";
import { trimAddress } from "../../utils/strings";
import {
  getAssetOptionData,
  getChainOptionData,
} from "../gateway/components/DropdownHelpers";
import {
  GatewayIOType,
  getToAddressFromGatewayParams,
  useAssetDecimals,
  useGatewayMeta,
} from "../gateway/gatewayHooks";
import { GatewayLocationState } from "../gateway/gatewayRoutingUtils";
import {
  createGatewayQueryString,
  getBridgeNonce,
} from "../gateway/gatewayUtils";
import {
  useAddressExplorerLink,
  useRenVMExplorerLink,
} from "../network/networkHooks";
import { LocalTxData, useTxsStorage } from "../storage/storageHooks";
import { WalletConnectionProgress } from "../wallet/components/WalletHelpers";
import { useCurrentChainWallet } from "../wallet/walletHooks";
import { $wallet, setChain, setPickerOpened } from "../wallet/walletSlice";
import {
  GatewayStatusChip,
  HMSCountdownTo,
  WithConfirmDialog,
} from "./components/TransactionsHelpers";
import {
  AddressOnChainLink,
  BluePadder,
  CustomChip,
  FullWidthWrapper,
  InfoChips,
  WideDialog,
} from "./components/TransactionsHistoryHelpers";
import {
  $txHistory,
  setShowConnectedTxs,
  setTxHistoryOpened,
} from "./transactionsSlice";

const standardShadow = `0px 0px 4px rgba(0, 27, 58, 0.1)`;

export const useTransactionModalStyles = makeStyles((theme) => ({
  title: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    fontSize: 14,
  },
  filters: {
    paddingLeft: 40,
    paddingRight: 30,
    paddingTop: 9,
    paddingBottom: 9,
    borderBottom: `1px solid ${theme.palette.divider}`,
    background: theme.palette.common.white,
    boxShadow: standardShadow,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filtersControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filtersActions: {
    display: "flex",
    alignItems: "center",
    marginLeft: theme.spacing(2),
  },
  spacer: {
    marginRight: 10,
  },
  checkboxLabel: {
    padding: `0px 16px`,
  },
  transactions: {
    minHeight: 430,
    padding: 0,
  },
  noTransactions: {
    height: 200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  pagination: {
    borderTop: `1px solid ${theme.palette.divider}`,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingRight: 30,
  },
}));

export const TransactionsHistory: FunctionComponent = () => {
  const styles = useTransactionModalStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { dialogOpened, showConnectedTxs } = useSelector($txHistory);

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

  const handleCheckboxChange = useCallback(() => {
    dispatch(setShowConnectedTxs(!showConnectedTxs));
  }, [dispatch, showConnectedTxs]);

  const handleRemoveAll = useCallback(() => {
    //dp
  }, []);

  const handleRemoveFiltered = useCallback(() => {}, []);

  return (
    <WideDialog open={dialogOpened} onClose={handleTxHistoryClose}>
      <DialogTitle>
        <Typography variant="h6" align="center" component="div">
          Transaction History
        </Typography>
        <IconButton
          aria-label="close"
          className={styles.closeButton}
          onClick={handleTxHistoryClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <div className={styles.filters}>
        <div className={styles.filtersControls}>
          <RichDropdown
            className={styles.spacer}
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
          <Fade in={showConnectedTxs}>
            <div>
              <RichDropdown
                condensed
                label={t("common.from-label")}
                supplementalLabel={t("common.blockchain-label")}
                getOptionData={getChainOptionData}
                options={supportedContractChains}
                value={chain}
                onChange={handleChainChange}
                nameVariant="full"
              />
            </div>
          </Fade>
        </div>
        <div className={styles.filtersActions}>
          <TxHistoryMenu
            onRemoveFiltered={handleRemoveFiltered}
            onRemoveAll={handleRemoveAll}
          >
            <FormControlLabel
              className={styles.checkboxLabel}
              checked={showConnectedTxs}
              onChange={handleCheckboxChange}
              control={<Checkbox name="walletTxs" color="primary" />}
              label={
                <Typography variant="body1">
                  Show connected wallet Txs
                </Typography>
              }
            />
          </TxHistoryMenu>
        </div>
      </div>
      {showConnectedTxs ? (
        <>
          {connected ? (
            <LocalTransactions address={account} chain={chain} asset={asset} />
          ) : (
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
        </>
      ) : (
        <LocalTransactions
          address={undefined}
          chain={undefined}
          asset={asset}
        />
      )}
    </WideDialog>
  );
};

const useTxHistoryMenuStyles = makeStyles(() => ({
  menuItem: {
    padding: `6px 44px`,
  },
}));

type TxHistoryMenuProps = {
  onRemoveFiltered: () => void;
  onRemoveAll: () => void;
  disabled?: boolean;
};

const TxHistoryMenu: FunctionComponent<TxHistoryMenuProps> = ({
  onRemoveFiltered,
  onRemoveAll,
  disabled,
  children,
}) => {
  const styles = useTxHistoryMenuStyles();
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
        <div>{children}</div>
        {featureFlags.godMode && (
          <div>
            <WithConfirmDialog
              reason={warningReason}
              actionText={warningActionText}
              onAction={handleRemoveFiltered}
              renderComponent={(onConfirm) => (
                <MenuItem className={styles.menuItem} onClick={onConfirm}>
                  Remove Filtered Txs
                </MenuItem>
              )}
            />
            <WithConfirmDialog
              reason={warningReason}
              actionText={warningActionText}
              onAction={handleRemoveAll}
              renderComponent={(onConfirm, innerRef) => (
                <MenuItem
                  className={styles.menuItem}
                  ref={innerRef}
                  onClick={onConfirm}
                  disabled={true}
                >
                  Remove All Txs
                </MenuItem>
              )}
            />
          </div>
        )}
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

type LocalTransactionsProps = {
  address?: string;
  chain?: Chain | string;
  asset?: Asset | string;
};

const LocalTransactions: FunctionComponent<LocalTransactionsProps> = ({
  address,
  chain,
  asset,
}) => {
  const styles = useTransactionModalStyles();
  const { localTxs, removeLocalTx, getAllLocalTxs } = useTxsStorage();

  const allTxsMap = getAllLocalTxs({ asset, address, chain });
  const allTxsUnsorted = Object.entries(allTxsMap);
  const allCount = allTxsUnsorted.length;

  const allTxs = [...allTxsUnsorted].sort((a, b) => {
    return b[1].timestamp - a[1].timestamp;
  });

  const handleRemoveTx = useCallback(
    (renVmHash: string, localAddress: string) => {
      // console.log("removing", renVmHash, localAddress);
      if (localAddress) {
        removeLocalTx(localAddress, renVmHash);
      } else {
        console.error("No local address specified", address);
      }
    },
    [address, removeLocalTx]
  );

  const [page, setPage] = useState(0);
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);
  useEffect(() => {
    setPage(0);
  }, [address, chain]);

  const rowsPerPage = 3;
  const totalCount = allCount;
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  return (
    <>
      <DialogContent className={styles.transactions}>
        {allTxs.map(([renVMHash, localTxData], index) => {
          const isInRange = index >= startIndex && index < endIndex;
          if (isInRange) {
            return (
              <RenVMTransactionEntry
                key={renVMHash}
                address={address || localTxData.address}
                renVMHash={renVMHash}
                localTxData={localTxData}
                onRemoveTx={handleRemoveTx}
                isLast={(index + 1) % 3 === 0}
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
      </DialogContent>
      <div className={styles.pagination}>
        <SimplePagination
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={totalCount > 0 ? page : 0}
          onPageChange={handleChangePage}
        />
      </div>
      <Debug it={{ page, localTxs }} />
    </>
  );
};

const resolveTxTypeLabels = (
  ioType: GatewayIOType | null,
  isH2H: boolean | null
) => {
  let fullTypeLabel = null;
  let typeLabel = null;
  if (ioType !== null && isH2H !== null) {
    if (ioType === GatewayIOType.lockAndMint) {
      typeLabel = "Mint";
    } else if (ioType === GatewayIOType.burnAndMint) {
      typeLabel = "Move";
    } else if (ioType === GatewayIOType.burnAndRelease) {
      typeLabel = "Release";
    }
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
  last: {
    borderBottom: "none",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fromWrapper: {
    position: "relative",
  },
  expiryTime: {
    alignItems: "center",
    height: 26,
    display: "flex",
  },
  arrow: {
    position: "absolute",
    top: 12,
    right: -12,
    color: theme.palette.grey[600],
    fontSize: 24,
  },
}));

type RenVMTransactionEntryProps = {
  address: string;
  renVMHash: string;
  localTxData: LocalTxData;
  onRemoveTx: (renVMHash: string, localAddress: string) => void;
  isLast?: boolean;
};

const RenVMTransactionEntry: FunctionComponent<RenVMTransactionEntryProps> = ({
  address,
  renVMHash,
  localTxData,
  onRemoveTx,
  isLast,
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const styles = useRenVMTransactionEntryStyles();
  const { params, timestamp, done, meta } = localTxData;
  const { asset, from, to } = decomposeLocalTxParams(localTxData);
  const { isMint, isRelease, isH2H, ioType } = useGatewayMeta(asset, from, to);
  const { date, time } = getFormattedDateTime(timestamp);
  const { getRenVmExplorerLink } = useRenVMExplorerLink();
  const { typeLabel } = resolveTxTypeLabels(ioType, isH2H);

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

  // special case for standard deposit mints;
  const isDepositMint = isMint && !isH2H;
  const toAddress = isDepositMint
    ? address
    : getToAddressFromGatewayParams(params as any) || "";
  const nonce = params.nonce || "";
  const expiryTime = meta?.expiryTime || 0;
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
    onRemoveTx(renVMHash, address);
    setRemoving(false);
  }, [renVMHash, onRemoveTx, address]);

  const resumeDisabled =
    amount === null || isMint === null || isRelease === null || isH2H === null;
  const [resuming, setResuming] = useState(false);
  const handleResume = useCallback(() => {
    console.info("resuming tx", renVMHash);
    setResuming(true);

    if (amount === null) {
      setResuming(false);
      return;
    }
    const state: GatewayLocationState = {
      reload: true,
    };
    if (ioType === GatewayIOType.burnAndMint) {
      // console.log("move");
      history.push({
        state,
        pathname: paths.BRIDGE_GATEWAY,
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
    } else if (isMint && isH2H) {
      // console.log("h2h: mint");
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
              toAddress,
            },
            {
              renVMHash,
            }
          ),
      });
    } else if (isRelease && isH2H) {
      // console.log("h2h release");
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
      // console.log("standard release");
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
    } else {
      // console.log("standard mint");
      const bridgeNonce = getBridgeNonce(nonce.toString());
      history.push({
        state,
        pathname: paths.MINT__GATEWAY_STANDARD,
        search: createGatewayQueryString(
          {
            asset,
            from,
            to,
            amount,
            nonce: bridgeNonce,
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
    ioType,
    amount,
    asset,
    from,
    to,
    toAddress,
    nonce,
  ]);

  const resolvedClassName = classNames(styles.root, { [styles.last]: isLast });

  return (
    <div className={resolvedClassName}>
      <div className={styles.topBar}>
        <InfoChips>
          <CustomChip label={date} />
          <CustomChip label={time} />
          {typeLabel === null ? (
            <InlineSkeleton width={40} height={16} variant="rect" />
          ) : (
            <CustomChip label={typeLabel} />
          )}
          {done ? (
            <CustomChip color="done" label="Finished" />
          ) : (
            <CustomChip color="pending" label="Pending" />
          )}
          {isDepositMint && <GatewayStatusChip timestamp={expiryTime} />}
        </InfoChips>
        <div>
          {(done || featureFlags.godMode) && (
            <CustomChip
              color="advanced"
              clickable
              label="Remove from Local Storage"
              onClick={handleRemove}
              disabled={removing}
              avatar={<RemoveIcon />}
            />
          )}
        </div>
      </div>
      <Grid container spacing={3}>
        <Grid item sm={12} md={6} className={styles.fromWrapper}>
          {isDepositMint ? (
            <SmallHorizontalPadder className={styles.expiryTime}>
              <FullWidthWrapper>
                <Typography variant="body2">Time Remaining</Typography>
                <Typography variant="body2">
                  <HMSCountdownTo timestamp={expiryTime} stopNegative />
                </Typography>
              </FullWidthWrapper>
            </SmallHorizontalPadder>
          ) : (
            <>
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
              <div className={styles.arrow}>
                <ArrowRightIcon fontSize="inherit" />
              </div>
            </>
          )}
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
      <Grid container spacing={3}>
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
              variant={done ? "outlined" : "contained"}
              size="small"
              color="primary"
              fullWidth
              disabled={resuming || resumeDisabled}
              onClick={handleResume}
            >
              {done
                ? "View details"
                : isDepositMint
                ? "Revisit Gateway"
                : "Resume Transaction"}
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Debug it={localTxData} />
    </div>
  );
};
