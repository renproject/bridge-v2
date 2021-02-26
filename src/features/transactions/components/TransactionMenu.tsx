import {
  Button,
  Divider,
  ListItemIcon,
  makeStyles,
  MenuItem,
  MenuItemProps,
  Typography,
} from '@material-ui/core'
import { GatewaySession } from '@renproject/ren-tx'
import classNames from 'classnames'
import React, { FunctionComponent, useCallback, useState } from 'react'
import {
  ActionButton,
  ActionButtonWrapper,
  RedButton,
} from '../../../components/buttons/Buttons'
import { CircleIcon } from '../../../components/icons/IconHelpers'
import {
  AddIcon,
  CustomSvgIconComponent,
  DeleteIcon,
  TxSettingsIcon,
} from '../../../components/icons/RenIcons'
import { AddressInput } from '../../../components/inputs/AddressInput'
import { PaperContent } from '../../../components/layout/Paper'
import { externalLinkAttributes } from '../../../components/links/Links'
import {
  BridgeModalTitle,
  NestedDrawer,
  NestedDrawerActions,
  NestedDrawerContent,
  NestedDrawerWrapper,
} from '../../../components/modals/BridgeModal'

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
  transferId: {
    paddingBottom: 10,
  },
}));

type TransactionMenuProps = {
  open: boolean;
  onClose: () => void;
  onDeleteTx: () => void;
  onUpdateTx?: (txHash: string, vout: string) => void;
  tx: GatewaySession;
};

export const TransactionMenu: FunctionComponent<TransactionMenuProps> = ({
  open,
  onClose,
  onDeleteTx,
  onUpdateTx = (tx, vout) => {
    console.log("updating");
    console.log(tx, vout);
  },
  tx,
}) => {
  const styles = useTransactionMenuStyles();
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const handleConfirmClose = useCallback(() => {
    setConfirmOpen(false);
  }, []);
  const handleDeleteWithConfirm = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const [updateOpen, setUpdateOpen] = useState(true); // FIXME: false
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
              <TransactionMenuItem
                Icon={DeleteIcon}
                onClick={handleDeleteWithConfirm}
              >
                Delete transaction
              </TransactionMenuItem>
            </div>
          </NestedDrawerContent>
          <NestedDrawerActions>
            <PaperContent paddingVariant="medium" className={styles.transferId}>
              <Typography variant="inherit">Transfer ID: {tx.id}</Typography>
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
      <ConfirmTransactionDeletionDrawer
        open={confirmOpen}
        onClose={handleConfirmClose as any}
        onDeleteTx={onDeleteTx}
      />
      <UpdateTransactionDrawer
        open={updateOpen}
        onClose={handleUpdateClose}
        onUpdateTx={onUpdateTx}
      />
    </>
  );
};

type ConfirmTransactionDeletionDrawerProps = {
  open: boolean;
  onClose: () => void;
  onDeleteTx: () => void;
};

export const ConfirmTransactionDeletionDrawer: FunctionComponent<ConfirmTransactionDeletionDrawerProps> = ({
  open,
  onClose,
  onDeleteTx,
}) => {
  const [deleting, setDeleting] = useState(false);
  const handleDeleteTx = useCallback(() => {
    setDeleting(true);
    onDeleteTx();
  }, [onDeleteTx]);
  return (
    <NestedDrawer title="Delete a Transaction" open={open} onClose={onClose}>
      <NestedDrawerWrapper>
        <NestedDrawerContent>
          <PaperContent topPadding>
            <Typography variant="h5" align="center" gutterBottom>
              Are you sure?
            </Typography>
            <Typography
              variant="body2"
              align="center"
              color="textSecondary"
              gutterBottom
            >
              If you have already sent your assets you will lose them forever if
              you remove the transaction.
            </Typography>
          </PaperContent>
        </NestedDrawerContent>
        <NestedDrawerActions>
          <PaperContent bottomPadding>
            <ActionButtonWrapper>
              <RedButton
                variant="text"
                color="inherit"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteTx}
                disabled={deleting}
              >
                {deleting ? "Removing..." : "Remove"} Transaction
              </RedButton>
            </ActionButtonWrapper>
            <ActionButtonWrapper>
              <ActionButton onClick={onClose} disabled={deleting}>
                Cancel
              </ActionButton>
            </ActionButtonWrapper>
          </PaperContent>
        </NestedDrawerActions>
      </NestedDrawerWrapper>
    </NestedDrawer>
  );
};

type UpdateTransactionDrawerProps = {
  open: boolean;
  onClose: () => void;
  onUpdateTx: (txHash: string, vout: string) => void;
};

export const UpdateTransactionDrawer: FunctionComponent<UpdateTransactionDrawerProps> = ({
  open,
  onClose,
  onUpdateTx,
}) => {
  const [vout, setVout] = useState("");
  const [hash, setHash] = useState("");
  const [updating, setUpdating] = useState(false);
  const handleVoutChange = useCallback((event) => {
    setVout(event.target.value);
  }, []);
  const handleHashChange = useCallback((event) => {
    setHash(event.target.value);
  }, []);
  const handleUpdateTx = useCallback(() => {
    setUpdating(true);
    onUpdateTx(hash, vout);
  }, [onUpdateTx, hash, vout]);

  return (
    <NestedDrawer title="Update Transaction Hash" open={open} onClose={onClose}>
      <NestedDrawerWrapper>
        <NestedDrawerContent>
          <PaperContent topPadding>
            <AddressInput
              label="Transaction Hash"
              value={hash}
              placeholder="Enter transaction hash"
            />
            <AddressInput
              label="Vout"
              value={vout}
              placeholder="Enter transaction vout"
            />
          </PaperContent>
        </NestedDrawerContent>
        <NestedDrawerActions>
          <PaperContent bottomPadding>
            <ActionButtonWrapper>
              <RedButton
                variant="text"
                color="inherit"
                onClick={handleUpdateTx}
                disabled={updating}
              >
                {updating ? "Updating..." : "Update"} Transaction
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
