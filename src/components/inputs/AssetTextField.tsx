import { Divider, Input, TextField, TextFieldProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { FunctionComponent } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: 54,
    display: "flex",
  },
  input: {
    textAlign: "right",
  },
  postfix: {},
}));

type AssetTextFieldProps = TextFieldProps & {
  symbol: string;
}; //TODO: change

export const AssetTextField: FunctionComponent<AssetTextFieldProps> = ({
  symbol,
  ...props
}) => {
  const styles = useStyles();
  return (
    <>
      <TextField
        classes={styles}
        size="medium"
        variant="standard"
        inputProps={
          {
            // disableUnderline: true,
          }
        }
        {...props}
      />
      <Divider />
      <Input
        className={styles.root}
        inputProps={{
          className: styles.input,
        }}
        disableUnderline
        onChange={props.onChange}
        value={props.value}
        placeholder={props.placeholder}
        endAdornment={<span className={styles.postfix}>{symbol}</span>}
      />
    </>
  );
};
