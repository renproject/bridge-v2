import {
  Button,
  ListItemIcon,
  makeStyles,
  MenuItem,
  MenuItemProps,
  Typography,
} from "@material-ui/core";
import React, { FunctionComponent, useCallback } from "react";
import {
  BitcoinIcon,
  CustomSvgIconComponent,
} from "../../../components/icons/RenIcons";
import { PaperContent } from "../../../components/layout/Paper";
import {
  BridgeModalTitle,
  NestedDrawer,
} from "../../../components/modals/BridgeModal";
import { SpacedPaperContent } from "./TransactionsHelpers";

const useTransactionMenuStyles = makeStyles((theme) => ({
  modalTitle: {
    padding: 20,
  },
}));

type TransactionMenuProps = {
  open: boolean;
  onClose: () => void;
};

const useTransactionMenuItemStyles = makeStyles((theme) => ({
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
}) => {
  const styles = useTransactionMenuItemStyles();
  return (
    <MenuItem dense onClick={onClick}>
      <ListItemIcon className={styles.iconWrapper}>
        <Icon fontSize="small" />
      </ListItemIcon>
      <Typography variant="inherit">{children}</Typography>
    </MenuItem>
  );
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
    <NestedDrawer open={open} onClose={handleClose}>
      <BridgeModalTitle className={styles.modalTitle} onClose={handleClose}>
        <ListItemIcon>i</ListItemIcon>
        <Typography variant="body2">Transaction Menu</Typography>
      </BridgeModalTitle>
      <SpacedPaperContent topPadding bottomPadding paddingVariant="medium">
        <Button variant="text" size="small" startIcon={<BitcoinIcon />}>
          Report an Issue
        </Button>
      </SpacedPaperContent>
      <PaperContent bottomPadding paddingVariant="medium">
        <Button variant="outlined" size="small">
          Report an Issue
        </Button>
      </PaperContent>
    </NestedDrawer>
  );
};
