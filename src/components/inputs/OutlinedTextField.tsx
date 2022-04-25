import {
  OutlinedInputProps,
  styled,
  TextField,
  TextFieldProps,
} from "@material-ui/core";
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

export const OutlinedTextField: FunctionComponent<TextFieldProps> = ({
  InputProps,
  ...props
}) => {
  const { input, ...classes } = useStyles();
  return (
    <TextField
      classes={classes}
      variant="outlined"
      InputProps={
        {
          notched: false,
          classes: { root: input },
          ...InputProps,
        } as OutlinedInputProps
      }
      fullWidth
      {...props}
    />
  );
};

export const OutlinedTextFieldWrapper = styled("div")({
  marginTop: 8,
  marginBottom: 8,
});

export const BigOutlinedTextFieldWrapper = styled("div")({
  marginTop: 50,
  marginBottom: 25,
});
