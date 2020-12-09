import {
  Button,
  Divider,
  ListItemIcon,
  makeStyles,
  MenuItem,
  MenuItemProps,
  Typography,
} from "@material-ui/core";
import classNames from 'classnames'
import React, { FunctionComponent, useCallback } from "react";
import { CircleIcon } from "../../../components/icons/IconHelpers";
import {
  AddIcon,
  BitcoinIcon,
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
};

export const TransactionMenu: FunctionComponent<TransactionMenuProps> = ({
  open,
  onClose,
}) => {
  const styles = useTransactionMenuStyles();
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);
  return (
    <NestedDrawer open={open} onClose={handleClose} className={styles.root}>
      <BridgeModalTitle className={styles.modalTitle} onClose={handleClose}>
        <ListItemIcon className={styles.titleIconWrapper}>
          <CircleIcon Icon={TxSettingsIcon} fontSize="small" variant="solid" />
        </ListItemIcon>
        <Typography variant="inherit">Transaction Menu</Typography>
      </BridgeModalTitle>
      <div className={styles.menuItems}>
        <TransactionMenuItem Icon={AddIcon} disabled>
          Insert/update transaction
        </TransactionMenuItem>
        <TransactionMenuItem Icon={DeleteIcon}>
          Delete transaction
        </TransactionMenuItem>
      </div>
      <PaperContent paddingVariant="medium" className={styles.transferId}>
        <Typography variant="inherit">
          Transfer ID: TODO: CRIT: add here
        </Typography>
      </PaperContent>
      <Divider />
      <PaperContent bottomPadding topPadding paddingVariant="medium">
        <Button variant="outlined" size="small">
          Report an Issue
        </Button>
      </PaperContent>
    </NestedDrawer>
  );
};
