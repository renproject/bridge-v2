import {
  Box,
  Button,
  ListItemIcon,
  makeStyles,
  MenuItem,
  MenuItemProps,
  Typography,
} from "@material-ui/core";
import { Asset, Chain } from "@renproject/chains";
import { BitcoinBaseChain } from "@renproject/chains-bitcoin";
import { Gateway } from "@renproject/ren";
import { ChainTransaction, isContractChain } from "@renproject/utils";
import classNames from "classnames";
import React, { FunctionComponent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import { CircleIcon } from "../../../components/icons/IconHelpers";
import {
  AddIcon,
  CustomSvgIconComponent,
  TxSettingsIcon,
  WarningIcon,
} from "../../../components/icons/RenIcons";
import {
  OutlinedTextField,
  OutlinedTextFieldWrapper,
} from "../../../components/inputs/OutlinedTextField";
import { PaperContent } from "../../../components/layout/Paper";
import { Link } from "../../../components/links/Links";
import {
  BridgeModalTitle,
  NestedDrawer,
  NestedDrawerActions,
  NestedDrawerContent,
  NestedDrawerWrapper,
} from "../../../components/modals/BridgeModal";
import { Debug } from "../../../components/utils/Debug";
import { EthereumBaseChain } from "../../../utils/missingTypes";
import { trimAddress } from "../../../utils/strings";
import { getGatewayParams } from "../../gateway/gatewayHooks";
import { useRedirectToGatewayFlow } from "../../gateway/gatewayRoutingUtils";
import { useCurrentNetworkChains } from "../../network/networkHooks";
import {
  useCurrentChain,
  useCurrentChainWallet,
} from "../../wallet/walletHooks";
import {
  setIssueResolverOpened,
  setTxRecoveryOpened,
} from "../transactionsSlice";

const useTransactionMenuItemStyles = makeStyles((theme) => ({
  root: {
    padding: "8px 20px",
    fontSize: 12,
  },
  iconWrapper: {
    minWidth: 32,
  },
}));

type TransactionMenuItemProps = MenuItemProps & {
  Icon: CustomSvgIconComponent;
};

export const TransactionMenuItem: FunctionComponent<
  TransactionMenuItemProps
> = ({ onClick, Icon, children, className, button, ...rest }) => {
  const styles = useTransactionMenuItemStyles();
  return (
    <MenuItem
      dense
      onClick={onClick}
      className={classNames(styles.root, className)}
      {...rest}
    >
      <ListItemIcon className={styles.iconWrapper}>
        <CircleIcon Icon={Icon} fontSize="small" variant="outlined" />
      </ListItemIcon>
      <Typography variant="inherit">{children}</Typography>
    </MenuItem>
  );
};

const useTransactionMenuStyles = makeStyles((theme) => ({
  root: {
    fontSize: 12,
  },
  modalTitle: {
    padding: `12px 20px`,
  },
  titleIconWrapper: {
    minWidth: 32,
  },
  menuItems: {
    paddingTop: 6,
    minHeight: 150,
  },
  transferData: {
    paddingBottom: 10,
  },
  transferId: {
    wordBreak: "break-all",
  },
}));

type TransactionMenuProps = {
  open: boolean;
  txHash: string;
  gateway: Gateway | null;
  onClose: () => void;
};

export const TransactionMenu: FunctionComponent<TransactionMenuProps> = ({
  open,
  onClose,
  txHash,
  gateway,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const styles = useTransactionMenuStyles();
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const [updateOpen, setUpdateOpen] = useState(false);
  const handleUpdateClose = useCallback(() => {
    setUpdateOpen(false);
  }, []);
  const handleUpdateOpen = useCallback(() => {
    setUpdateOpen(true);
  }, []);

  const handleResolveIssues = useCallback(() => {
    dispatch(setIssueResolverOpened(true));
  }, [dispatch]);

  return (
    <>
      <NestedDrawer open={open} onClose={handleClose} className={styles.root}>
        <BridgeModalTitle className={styles.modalTitle} onClose={handleClose}>
          <ListItemIcon className={styles.titleIconWrapper}>
            <CircleIcon
              Icon={TxSettingsIcon}
              fontSize="small"
              variant="solid"
            />
          </ListItemIcon>
          <Typography variant="inherit">{t("tx.menu-title")}</Typography>
        </BridgeModalTitle>
        <NestedDrawerWrapper>
          <NestedDrawerContent>
            <div className={styles.menuItems}>
              {gateway !== null && (
                <TransactionMenuItem Icon={AddIcon} onClick={handleUpdateOpen}>
                  {t("tx.menu-insert-update-label")}
                </TransactionMenuItem>
              )}
              <TransactionMenuItem
                Icon={WarningIcon}
                onClick={handleResolveIssues}
              >
                Resolve issue
              </TransactionMenuItem>
            </div>
          </NestedDrawerContent>
          <NestedDrawerActions>
            <PaperContent
              paddingVariant="medium"
              className={styles.transferData}
            >
              <Typography variant="inherit">Transfer ID:</Typography>
              <Typography variant="inherit" className={styles.transferId}>
                {txHash}
              </Typography>
            </PaperContent>
          </NestedDrawerActions>
        </NestedDrawerWrapper>
      </NestedDrawer>
      {gateway !== null && (
        <UpdateTransactionDrawer
          open={updateOpen}
          onClose={handleUpdateClose}
          gateway={gateway}
        />
      )}
    </>
  );
};

type UpdateTransactionDrawerProps = {
  open: boolean;
  onClose: () => void;
  gateway: Gateway;
};

const isValidInteger = (amount: string) => {
  return Number.isInteger(Number(amount));
};

/*
export interface ChainTransaction {
    chain: string; // from gateway
    txid: UrlBase64String;
    txindex: NumericString;

    txidFormatted: string;
}

export interface InputChainTransaction extends ChainTransaction {
    asset: string; // from gateway
    amount: string;
    toRecipient?: string;
    toChain?: string; // from gateway

    nonce?: string; // urlBase64 encoded
    toPayload?: string; // urlBase64 encoded
}
 */

export const UpdateTransactionDrawer: FunctionComponent<
  UpdateTransactionDrawerProps
> = ({ open, onClose, gateway }) => {
  const { t } = useTranslation();
  const { asset, from, to } = getGatewayParams(gateway);

  return (
    <NestedDrawer
      title={"Insert/Update transaction"}
      open={open}
      onClose={onClose}
    >
      <NestedDrawerWrapper>
        <NestedDrawerContent>
          <UpdateTransactionForm asset={asset} from={from} to={to} />
        </NestedDrawerContent>
      </NestedDrawerWrapper>
      <NestedDrawerActions>
        <PaperContent bottomPadding>
          <ActionButtonWrapper>
            <ActionButton onClick={onClose}>
              {t("common.cancel-label")}
            </ActionButton>
          </ActionButtonWrapper>
        </PaperContent>
      </NestedDrawerActions>
    </NestedDrawer>
  );
};

type UpdateTransactionFormProps = {
  asset: Asset;
  from: Chain;
  to: Chain;
};

export const UpdateTransactionForm: FunctionComponent<
  UpdateTransactionFormProps
> = ({ asset, from, to }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const chains = useCurrentNetworkChains();
  const isFromCC = isContractChain(chains[from].chain);
  const isFromDC = !isFromCC;
  const isToCC = isContractChain(chains[to].chain);

  const [data, setData] = useState({});
  const [txId, setTxId] = useState("");
  const handleTxIdChange = useCallback((event) => {
    setTxId(event.target.value);
  }, []);

  const [txIndex, setTxIndex] = useState("");
  const handleTxIndexChange = useCallback((event) => {
    const newValue = event.target.value;
    if (isValidInteger(newValue)) {
      setTxIndex(newValue);
    }
  }, []);

  const [txIdFormatted, setTxIdFormatted] = useState("");
  const handleTxIdFormattedChange = useCallback((event) => {
    const newValue = event.target.value;
    setTxIdFormatted(newValue);
  }, []);

  const [amount, setAmount] = useState("");
  const handleAmountChange = useCallback((event) => {
    const newValue = event.target.value;
    if (isValidInteger(newValue)) {
      setAmount(newValue);
    }
  }, []);

  const [toRecipient, setToRecipient] = useState("");
  const handleToRecipientChange = useCallback((event) => {
    setToRecipient(event.target.value);
  }, []);

  const [nonce, setNonce] = useState("");
  const handleNonceChange = useCallback((event) => {
    setNonce(event.target.value);
  }, []);

  const [toPayload, setToPayload] = useState("");
  const handleToPayloadChange = useCallback((event) => {
    setToPayload(event.target.value);
  }, []);

  const handleTxRecoveryClose = useCallback(() => {
    dispatch(setTxRecoveryOpened(false));
  }, [dispatch]);

  const [updating, setUpdating] = useState(false);

  const navigateToGateway = useRedirectToGatewayFlow({
    asset,
    from,
    to,
    toAddress: toRecipient,
  });

  const handleUpdateTx = useCallback(() => {
    const instance = chains[from].chain;
    if (!instance) {
      return;
    }
    let txPayload;
    if (isFromCC) {
      txPayload = (instance as EthereumBaseChain).Transaction({
        txidFormatted: txIdFormatted,
      });
    } else {
      txPayload = (instance as BitcoinBaseChain).Transaction({
        txidFormatted: txIdFormatted,
        txindex: txIndex,
      });
    }
    if (!txPayload) {
      return;
    }
    const payloadTxData = ((txPayload as any).params as any)
      .tx as ChainTransaction;
    // const finalTx: InputChainTransaction = {
    //   txid: txId || payloadTxData.txid,
    //   txidFormatted: txIdFormatted || payloadTxData.txidFormatted,
    //   txindex: txIndex || payloadTxData.txindex,
    //   chain: payloadTxData.chain,
    //   asset: asset as string,
    //   amount: amount,
    //   toRecipient: undefinedForEmptyString(toRecipient),
    //   nonce: undefinedForEmptyString(nonce),
    //   toPayload: undefinedForEmptyString(toPayload),
    // };
    setData(payloadTxData);
    setUpdating(true);
    const partialTxParam = encodeURIComponent(JSON.stringify(payloadTxData));
    navigateToGateway({ partialTx: partialTxParam });
    handleTxRecoveryClose();
    // reloadWithPartialTxParam(history, partialTxParam);

    // gateway
    //   .processDeposit(finalTx)
    //   .then(() => {})
    //   .catch((error) => {
    //     console.error(error);
    //   })
    //   .finally(() => {
    //     setUpdating(false);
    //   });

    // onUpdateTransaction(payload);
  }, [
    chains,
    isFromCC,
    from,
    // gateway,
    // txId,
    txIndex,
    txIdFormatted,
    navigateToGateway,
    handleTxRecoveryClose,
    // amount,
    // toRecipient,
    // nonce,
    // toPayload,
  ]);

  const valid = true;

  const [details, setDetails] = useState(false);
  const handleToggleDetails = useCallback(() => {
    setDetails((details) => !details);
  }, []);

  const chain = useCurrentChain();
  const { connected, account } = useCurrentChainWallet();
  const handleImportAccount = useCallback(() => {
    if (connected && account) {
      setToRecipient(account);
    }
  }, [connected, account]);

  return (
    <PaperContent topPadding bottomPadding>
      <OutlinedTextFieldWrapper>
        <OutlinedTextField
          label={"Formatted Transaction Hash (Id)"}
          value={txIdFormatted}
          onChange={handleTxIdFormattedChange}
          placeholder={"Enter formatted transaction hash (id)"}
        />
      </OutlinedTextFieldWrapper>
      {isFromDC && (
        <OutlinedTextFieldWrapper>
          <OutlinedTextField
            label={"Transaction Index / vOut"}
            value={txIndex}
            onChange={handleTxIndexChange}
            placeholder={"Enter transaction index/vOut"}
          />
        </OutlinedTextFieldWrapper>
      )}
      {isToCC && (
        <OutlinedTextFieldWrapper>
          <OutlinedTextField
            label={"To Recipient"}
            value={toRecipient}
            onChange={handleToRecipientChange}
            placeholder={"Enter recipient address"}
          />
          <Box display="flex" justifyContent="flex-end">
            {connected && (
              <Typography variant="body2">
                <Link
                  color="primary"
                  underline="hover"
                  onClick={handleImportAccount}
                >
                  Set current {chain} account ({trimAddress(account)})
                </Link>
              </Typography>
            )}
          </Box>
        </OutlinedTextFieldWrapper>
      )}
      <Debug it={data} />
      {details && (
        <>
          <OutlinedTextFieldWrapper>
            <Button size="small" color="primary" onClick={handleToggleDetails}>
              Show/hide advanced mode
            </Button>
          </OutlinedTextFieldWrapper>
          <OutlinedTextFieldWrapper>
            <OutlinedTextField
              label={"Transaction Id"}
              value={txId}
              onChange={handleTxIdChange}
              placeholder={"Enter transaction Id"}
            />
          </OutlinedTextFieldWrapper>
          <OutlinedTextFieldWrapper>
            <OutlinedTextField
              label={t("tx.menu-update-tx-amount-label")}
              value={amount}
              onChange={handleAmountChange}
              placeholder={t("tx.menu-update-tx-amount-placeholder")}
            />
          </OutlinedTextFieldWrapper>
          <OutlinedTextFieldWrapper>
            <OutlinedTextField
              label={"Nonce"}
              value={nonce}
              onChange={handleNonceChange}
              placeholder={"Enter urlBase64 encoded nonce"}
            />
          </OutlinedTextFieldWrapper>
          <OutlinedTextFieldWrapper>
            <OutlinedTextField
              label={"To Payload"}
              value={toPayload}
              onChange={handleToPayloadChange}
              placeholder={"Enter urlBase64 encoded toPayload"}
            />
          </OutlinedTextFieldWrapper>
        </>
      )}
      <ActionButtonWrapper>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdateTx}
          disabled={updating || !valid}
        >
          {updating ? "Recovering transaction..." : "Recover transaction"}
        </Button>
      </ActionButtonWrapper>
    </PaperContent>
  );
};
