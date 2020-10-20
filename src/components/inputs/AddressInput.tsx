import { TextField, TextFieldProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import { ChainType } from "../utils/types";

export const useStyles = makeStyles((theme) => ({
  root: {
    // borderColor: theme.palette.primary.main
    // border: `1px solid ${theme.palette.primary.main}`,
    // borderRadius: 20,
    // padding: 18,
  },
}));

type AddressInputProps = TextFieldProps & {
  chain: ChainType;
};

export const AddressInput: FunctionComponent<AddressInputProps> = ({
  chain,
  ...rest
}) => {
  const classes = useStyles();
  // @ts-ignore
  return <TextField classes={classes} variant="outlined" fullWidth {...rest} />;
};
