import {
  Button,
  ListItemIcon,
  makeStyles,
  MenuItem,
  MenuItemProps,
  Typography,
} from "@material-ui/core";
import { Chain } from "@renproject/chains";
import { txidFormattedToTxid } from "@renproject/chains-bitcoin/build/main/utils/utils";
import { InputChainTransaction } from "@renproject/utils";
import classNames from "classnames";
import React, { FunctionComponent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  ActionButton,
  ActionButtonWrapper,
  RedButton,
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
import {
  BridgeModalTitle,
  NestedDrawer,
  NestedDrawerActions,
  NestedDrawerContent,
  NestedDrawerWrapper,
} from "../../../components/modals/BridgeModal";
import {
  TransactionUpdater,
  UpdateTransactionFn,
} from "../../../providers/TransactionProviders";
import { undefinedForEmptyString } from "../../../utils/propsUtils";
import { $gateway } from "../../gateway/gatewaySlice";
import { useCurrentNetworkChains } from "../../network/networkHooks";
import { setIssueResolverOpened } from "../transactionsSlice";

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
  onUpdateTransaction: TransactionUpdater;
  onClose: () => void;
};

export const TransactionMenu: FunctionComponent<TransactionMenuProps> = ({
  open,
  onClose,
  txHash,
  onUpdateTransaction,
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
              {onUpdateTransaction !== null && (
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
      {onUpdateTransaction !== null && (
        <UpdateTransactionDrawer
          open={updateOpen}
          onClose={handleUpdateClose}
          onUpdateTransaction={onUpdateTransaction}
        />
      )}
    </>
  );
};

type UpdateTransactionDrawerProps = {
  open: boolean;
  onClose: () => void;
  onUpdateTransaction: UpdateTransactionFn;
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
> = ({ open, onClose, onUpdateTransaction }) => {
  const { t } = useTranslation();
  const { from } = useSelector($gateway);
  const chains = useCurrentNetworkChains();
  const encodeTxId = useCallback(
    (txIdFormatted) => {
      const instance = chains[from].chain;
      // TODO: crit renJS should expose it on chain class
      if (instance && instance.chain === Chain.Bitcoin) {
        return txidFormattedToTxid(txIdFormatted);
      }
      return txIdFormatted;
      // chains[from].chain.txid()
    },
    [chains, from]
  );

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
  const handleTxIdFormattedChange = useCallback(
    (event) => {
      const newValue = event.target.value;
      setTxIdFormatted(newValue);
      setTxId(encodeTxId(newValue));
    },
    [encodeTxId]
  );

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

  const [updating, setUpdating] = useState(false);
  const handleUpdateTx = useCallback(() => {
    const inputTx = {
      txid: txId,
      txindex: txIndex,
      txidFormatted: txIdFormatted,
      amount: amount,
      toRecipient: undefinedForEmptyString(toRecipient),
      nonce: undefinedForEmptyString(nonce),
      toPayload: undefinedForEmptyString(toPayload),
    } as InputChainTransaction;
    setUpdating(true);
    onUpdateTransaction(inputTx);
  }, [
    onUpdateTransaction,
    txId,
    txIndex,
    txIdFormatted,
    amount,
    toRecipient,
    nonce,
    toPayload,
  ]);

  const valid = true;

  const handleFetch = useCallback(() => {
    // TODO: finish when renJS functionality done
  }, []);
  return (
    <NestedDrawer
      title={"Insert/Update transaction"}
      open={open}
      onClose={onClose}
    >
      <NestedDrawerWrapper>
        <NestedDrawerContent>
          <PaperContent topPadding>
            <OutlinedTextFieldWrapper>
              <OutlinedTextField
                label={"Transaction Id"}
                value={txId}
                onChange={handleTxIdChange}
                placeholder={"Transaction Id"}
              />
            </OutlinedTextFieldWrapper>
            <OutlinedTextFieldWrapper>
              <Button
                size="small"
                color="primary"
                variant="contained"
                disabled
                onClick={handleFetch}
              >
                Fetch data by Tx Id
              </Button>
            </OutlinedTextFieldWrapper>
            <OutlinedTextFieldWrapper>
              <OutlinedTextField
                label={"Formatted Transaction Id"}
                value={txIdFormatted}
                onChange={handleTxIdFormattedChange}
                placeholder={"Formatted Transaction Id"}
              />
            </OutlinedTextFieldWrapper>
            <OutlinedTextFieldWrapper>
              <OutlinedTextField
                label={"Tx Index / vOut"}
                value={txIndex}
                onChange={handleTxIndexChange}
                placeholder={"Enter transaction index/vOut"}
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
                label={"To Recipient"}
                value={toRecipient}
                onChange={handleToRecipientChange}
                placeholder={"Enter recipient address"}
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
                value={nonce}
                onChange={handleToPayloadChange}
                placeholder={"Enter urlBase64 encoded toPayload"}
              />
            </OutlinedTextFieldWrapper>
          </PaperContent>
        </NestedDrawerContent>
        <NestedDrawerActions>
          <PaperContent bottomPadding>
            <ActionButtonWrapper>
              <RedButton
                variant="text"
                color="inherit"
                onClick={handleUpdateTx}
                disabled={updating || !valid}
              >
                {updating
                  ? t("tx.menu-update-tx-updating-dots")
                  : t("tx.menu-update-tx-update")}{" "}
                transaction
              </RedButton>
            </ActionButtonWrapper>
            <ActionButtonWrapper>
              <ActionButton onClick={onClose} disabled={updating}>
                {t("common.cancel-label")}
              </ActionButton>
            </ActionButtonWrapper>
          </PaperContent>
        </NestedDrawerActions>
      </NestedDrawerWrapper>
    </NestedDrawer>
  );
};
