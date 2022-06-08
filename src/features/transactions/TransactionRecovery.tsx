import { DialogTitle, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import React, { FunctionComponent, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClosableMenuIconButton } from "../../components/buttons/Buttons";
import { TxRecoveryIcon } from "../../components/icons/RenIcons";
import { $gateway } from "../gateway/gatewaySlice";
import { UpdateTransactionForm } from "./components/TransactionMenu";
import { WideDialog } from "./components/TransactionsHistoryHelpers";
import { useTransactionModalStyles } from "./TransactionsHistory";
import { $txRecovery, setTxRecoveryOpened } from "./transactionsSlice";

export const TransactionRecovery: FunctionComponent = () => {
  const styles = useTransactionModalStyles();
  const dispatch = useDispatch();
  const { dialogOpened } = useSelector($txRecovery);

  // const { chain } = useSelector($wallet);
  // const { connected, account } = useCurrentChainWallet();
  // const chainConfig = getChainConfig(chain);

  const handleTxRecoveryClose = useCallback(() => {
    dispatch(setTxRecoveryOpened(false));
  }, [dispatch]);

  // const handleWalletPickerOpen = useCallback(() => {
  //   dispatch(setPickerOpened(true));
  // }, [dispatch]);

  const { asset, from, to } = useSelector($gateway);
  return (
    <WideDialog open={dialogOpened} onClose={handleTxRecoveryClose}>
      <DialogTitle>
        <Typography variant="h6" align="center" component="div">
          Transaction Recovery
        </Typography>
        <IconButton
          aria-label="close"
          className={styles.closeButton}
          onClick={handleTxRecoveryClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <div className={styles.filters}>
        <div className={styles.filtersControls}>
          <>
            <Typography>
              Recover transaction for {asset} from {from} to {to}
            </Typography>
          </>
        </div>
      </div>
      <UpdateTransactionForm asset={asset} from={from} to={to} />
    </WideDialog>
  );
};

export const useTransactionRecoveryButtonStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    right: 16,
    bottom: 100,
    [theme.breakpoints.up("sm")]: {
      right: 48,
    },
    "@media (min-width: 1280px)": {
      right: `calc((100% - 1280px)/2 + 48px)`,
    },
  },
}));

export const TransactionRecoveryButton: FunctionComponent = () => {
  const dispatch = useDispatch();
  const styles = useTransactionRecoveryButtonStyles();
  const { dialogOpened } = useSelector($txRecovery);

  const handleTxRecoveryToggle = useCallback(() => {
    dispatch(setTxRecoveryOpened(!dialogOpened));
  }, [dispatch, dialogOpened]);

  return (
    <ClosableMenuIconButton
      className={styles.root}
      title="Transaction Recovery"
      Icon={TxRecoveryIcon}
      opened={dialogOpened}
      onClick={handleTxRecoveryToggle}
    />
  );
};
