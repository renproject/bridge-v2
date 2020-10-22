import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { QuestionAnswer } from '@material-ui/icons'
import { WalletPickerProps } from '@renproject/multiwallet-ui'
import React from 'react'
import { MetamaskFullIcon, WalletConnectFullIcon, } from '../icons/RenIcons'

export const useWalletPickerStyles = makeStyles((theme) => ({
  root: {},
  body: {
    padding: 24,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: `16px 16px 14px`,
  },
  headerTitle: {
    flexGrow: 2,
    paddingLeft: 16,
    textAlign: "center",
    lineHeight: 2,
  },
  headerCloseIcon: {
    fontSize: 16,
  },
  button: {
    border: `1px solid ${theme.palette.divider}`,
  },
  chainTitle: {
    textTransform: "capitalize",
  },
}));

const mapWalletEntryIcon = (chain: string, name: string) => {
  console.log(chain, name);
  if (chain === "ethereum") {
    switch (name) {
      case "Metamask":
        return <MetamaskFullIcon fontSize="inherit" />;
      case "WalletConnect":
        return <WalletConnectFullIcon fontSize="inherit" />;
    }
  }
  return <QuestionAnswer />;
};

const useWalletEntryButtonStyles = makeStyles({
  root: {
    marginTop: 20,
    fontSize: 16,
    padding: "11px 20px 11px 40px",
  },
  label: {
    display: "flex",
    justifyContent: "space-between",
    alignContent: "center",
  },
  icon: {
    fontSize: 36,
    display: "inline-flex",
  },
});

export const WalletEntryButton: WalletPickerProps<
  any,
  any
>["WalletEntryButton"] = ({ chain, onClick, name, logo }) => {
  const { icon: iconClassName, ...classes } = useWalletEntryButtonStyles();
  const Icon = mapWalletEntryIcon(chain, name);
  return (
    <Button
      classes={classes}
      variant="outlined"
      size="large"
      fullWidth
      onClick={onClick}
    >
      <span>{name}</span> <span className={iconClassName}>{Icon}</span>
    </Button>
  );
};
