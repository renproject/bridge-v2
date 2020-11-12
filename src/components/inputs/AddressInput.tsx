import { TextField, TextFieldProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";
import { BridgeChain } from '../../utils/assetConfigs'

export const useStyles = makeStyles((theme) => ({
  root: {
    // borderColor: theme.palette.primary.main
    // border: `1px solid ${theme.palette.primary.main}`,
    // borderRadius: 20,
    // padding: 18,
  },
}));

type AddressInputProps = TextFieldProps & {
  chain: BridgeChain;
};

export const AddressInput: FunctionComponent<AddressInputProps> = ({
  chain,
  ...rest
}) => {
  const classes = useStyles();
  // @ts-ignore
  return <TextField classes={classes} variant="outlined" fullWidth {...rest} />;
};
