import {
  OutlinedInputProps, styled,
  TextField,
  TextFieldProps,
} from '@material-ui/core'
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";

export const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: 13,
    // border: `1px solid ${theme.palette.primary.main}`,
    // borderRadius: 20,
    // padding: 18,
  },
  input: {
    paddingTop: 10,
    fontSize: 13,
  },
}));

export const AddressInput: FunctionComponent<TextFieldProps> = (props) => {
  const { input, ...classes } = useStyles();
  return (
    <TextField
      classes={classes}
      variant="outlined"
      InputProps={
        { notched: false, classes: { root: input } } as OutlinedInputProps
      }
      fullWidth
      {...props}
    />
  );
};

export const AddressInputWrapper = styled('div')({
  marginTop: 50,
  marginBottom: 25,
})
