import {
  Button,
  Divider,
  ListItemIcon,
  makeStyles,
  MenuItem,
  MenuItemProps,
  Typography,
  withStyles,
} from "@material-ui/core";
import { GatewaySession } from "@renproject/ren-tx";
import classNames from "classnames";
import React, { FunctionComponent, useCallback, useState } from "react";
import {
  ActionButton,
  ActionButtonWrapper,
} from "../../../components/buttons/Buttons";
import { CircleIcon } from "../../../components/icons/IconHelpers";
import {
  AddIcon,
  CustomSvgIconComponent,
  DeleteIcon,
  TxSettingsIcon,
} from "../../../components/icons/RenIcons";
import { PaperContent } from "../../../components/layout/Paper";
import {
  BridgeModalTitle,
  NestedDrawer,
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
  transferId: {
    paddingBottom: 10,
  },
}));

type TransactionMenuProps = {
  open: boolean;
  onClose: () => void;
  onDeleteTx: () => void;
  tx: GatewaySession;
};

export const TransactionMenu: FunctionComponent<TransactionMenuProps> = ({
  open,
  onClose,
  onDeleteTx,
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
        <div className={styles.menuItems}>
          <TransactionMenuItem Icon={AddIcon} disabled>
            Insert/update transaction
          </TransactionMenuItem>
          <TransactionMenuItem
            Icon={DeleteIcon}
            onClick={handleDeleteWithConfirm}
          >
            Delete transaction
          </TransactionMenuItem>
        </div>
        <PaperContent paddingVariant="medium" className={styles.transferId}>
          <Typography variant="inherit">Transfer ID: {tx.id}</Typography>
        </PaperContent>
        <Divider />
        <PaperContent bottomPadding topPadding paddingVariant="medium">
          <Button variant="outlined" size="small" disabled>
            Report an Issue
          </Button>
        </PaperContent>
      </NestedDrawer>
      <ConfirmTransactionDeletion
        open={confirmOpen}
        onClose={handleConfirmClose}
        onDeleteTx={onDeleteTx}
      />
    </>
  );
};

type ConfirmTransactionDeletionProps = {
  open: boolean;
  onClose: () => void;
  onDeleteTx: () => void;
};

const RedButton = withStyles((theme) => ({
  root: {
    color: theme.palette.error.main,
  },
}))(Button);

export const ConfirmTransactionDeletion: FunctionComponent<ConfirmTransactionDeletionProps> = ({
  open,
  onClose,
  onDeleteTx,
}) => {
  return (
    <NestedDrawer title="Delete a Transaction" open={open} onClose={onClose}>
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
          If you have already sent your assets you will lose them forever if you
          remove the transaction.
        </Typography>
      </PaperContent>
      <PaperContent bottomPadding>
        <ActionButtonWrapper>
          <RedButton
            variant="text"
            color="inherit"
            startIcon={<DeleteIcon />}
            onClick={onDeleteTx}
          >
            Remove Transaction
          </RedButton>
        </ActionButtonWrapper>
        <ActionButtonWrapper>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
        </ActionButtonWrapper>
      </PaperContent>
    </NestedDrawer>
  );
};
