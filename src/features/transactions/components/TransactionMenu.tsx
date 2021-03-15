import {
  Button,
  Divider,
  ListItemIcon,
  makeStyles,
  MenuItem,
  MenuItemProps,
  Typography,
} from "@material-ui/core";
import { GatewaySession } from "@renproject/ren-tx";
import classNames from "classnames";
import React, { FunctionComponent, useCallback, useState } from "react";
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
import { externalLinkAttributes } from "../../../components/links/Links";
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
  tx: GatewaySession;
};

export const TransactionMenu: FunctionComponent<TransactionMenuProps> = ({
  open,
  onClose,
  onUpdateTx,
  tx,
}) => {
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
          <Typography variant="inherit">Transaction Menu</Typography>
        </BridgeModalTitle>
        <NestedDrawerWrapper>
          <NestedDrawerContent>
            <div className={styles.menuItems}>
              <TransactionMenuItem Icon={AddIcon} onClick={handleUpdateOpen}>
                Insert/update transaction
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
            <Divider />
            <PaperContent bottomPadding topPadding paddingVariant="medium">
              <Button
                variant="outlined"
                size="small"
                href="https://renprotocol.typeform.com/to/YdmFyB"
                {...externalLinkAttributes}
              >
                Report an Issue
              </Button>
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
    <NestedDrawer title="Update Transaction Hash" open={open} onClose={onClose}>
      <NestedDrawerWrapper>
        <NestedDrawerContent>
          <PaperContent topPadding>
            <OutlinedTextFieldWrapper>
              <OutlinedTextField
                label="Amount (sats)"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount in sats"
              />
            </OutlinedTextFieldWrapper>
            <OutlinedTextFieldWrapper>
              <OutlinedTextField
                label="Transaction Hash"
                value={hash}
                onChange={handleHashChange}
                placeholder="Enter transaction hash"
              />
            </OutlinedTextFieldWrapper>
            <OutlinedTextFieldWrapper>
              <OutlinedTextField
                label="vOut"
                value={vout}
                onChange={handleVoutChange}
                placeholder="Enter transaction vOut"
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
                {updating ? "Updating..." : "Update"} transaction
              </RedButton>
            </ActionButtonWrapper>
            <ActionButtonWrapper>
              <ActionButton onClick={onClose} disabled={updating}>
                Cancel
              </ActionButton>
            </ActionButtonWrapper>
          </PaperContent>
        </NestedDrawerActions>
      </NestedDrawerWrapper>
    </NestedDrawer>
  );
};
