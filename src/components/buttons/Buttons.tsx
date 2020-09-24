import { IconButton, IconButtonProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FunctionComponent } from "react";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React from "react";

type ToggleIconButton = IconButtonProps & {
  pressed?: boolean;
};

const useToggleIconButtonStyles = makeStyles((theme) => ({
  root: {},
}));

export const SettingsButton: FunctionComponent<ToggleIconButton> = ({
  pressed,
  ...rest
}) => {
  const styles = useToggleIconButtonStyles();
  console.log(styles, pressed);
  return (
    <IconButton {...rest} color='inherit'>
      <MoreVertIcon fontSize="small" />
    </IconButton>
  );
};
