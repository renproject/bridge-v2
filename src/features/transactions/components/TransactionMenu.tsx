import {
  ListItemIcon,
  makeStyles,
  MenuItem,
  MenuItemProps,
  Typography,
} from "@material-ui/core";
import { BurnSession, GatewaySession } from "@renproject/ren-tx";
import classNames from "classnames";
import React, { FunctionComponent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
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

export const TransactionMenuItem: FunctionComponent<TransactionMenuItemProps> = ({
  onClick,
  Icon,
  children,
  className,
  button,
  ...rest
}) => {
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

export type UpdateTxFn = (amount: number, vOut: number, txHash: string) => void;

type TransactionMenuProps = {
  open: boolean;
  onClose: () => void;
  onUpdateTx?: UpdateTxFn;
  tx: GatewaySession<any> | BurnSession<any, any>;
};

export const TransactionMenu: FunctionComponent<TransactionMenuProps> = ({
  open,
  onClose,
  onUpdateTx,
  tx,
}) => {
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
              <TransactionMenuItem Icon={AddIcon} onClick={handleUpdateOpen}>
                {t("tx.menu-insert-update-label")}
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
                {tx.id}
              </Typography>
            </PaperContent>
          </NestedDrawerActions>
        </NestedDrawerWrapper>
      </NestedDrawer>
      {onUpdateTx && (
        <UpdateTransactionDrawer
          open={updateOpen}
          onClose={handleUpdateClose}
          onUpdateTx={onUpdateTx}
        />
      )}
    </>
  );
};

type UpdateTransactionDrawerProps = {
  open: boolean;
  onClose: () => void;
  onUpdateTx: UpdateTxFn;
};

const isValidInteger = (amount: string) => {
  return Number.isInteger(Number(amount));
};

export const UpdateTransactionDrawer: FunctionComponent<UpdateTransactionDrawerProps> = ({
  open,
  onClose,
  onUpdateTx,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [vout, setVout] = useState("");
  const [hash, setHash] = useState("");
  const [updating, setUpdating] = useState(false);
  const valid = amount && vout && hash;
  const handleAmountChange = useCallback((event) => {
    const newValue = event.target.value;
    if (isValidInteger(newValue)) {
      setAmount(newValue);
    }
  }, []);
  const handleVoutChange = useCallback((event) => {
    const newValue = event.target.value;
    if (isValidInteger(newValue)) {
      setVout(newValue);
    }
  }, []);
  const handleHashChange = useCallback((event) => {
    setHash(event.target.value);
  }, []);

  const handleUpdateTx = useCallback(() => {
    setUpdating(true);
    onUpdateTx(Number(amount), Number(vout), hash);
  }, [onUpdateTx, hash, vout, amount]);

  return (
    <NestedDrawer
      title={t("tx.menu-update-tx-title")}
      open={open}
      onClose={onClose}
    >
      <NestedDrawerWrapper>
        <NestedDrawerContent>
          <PaperContent topPadding>
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
                label={t("tx.menu-update-tx-hash-label")}
                value={hash}
                onChange={handleHashChange}
                placeholder={t("tx.menu-update-tx-hash-placeholder")}
              />
            </OutlinedTextFieldWrapper>
            <OutlinedTextFieldWrapper>
              <OutlinedTextField
                label={t("tx.menu-update-tx-vout-label")}
                value={vout}
                onChange={handleVoutChange}
                placeholder={t("tx.menu-update-tx-vout-placeholder")}
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
