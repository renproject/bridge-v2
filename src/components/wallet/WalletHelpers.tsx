import { makeStyles } from "@material-ui/core/styles";

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
    "& > p": {
      flexGrow: 2,
      paddingLeft: 16,
      textAlign: "center",
    },
    "& > button svg": {
      fontSize: 18,
    },
  },
  button: {
    border: `1px solid ${theme.palette.divider}`,
  },
}));
