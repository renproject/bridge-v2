import { Chip, ChipProps, Dialog } from "@material-ui/core";
import { DialogProps } from "@material-ui/core/Dialog";
import { makeStyles, styled } from "@material-ui/core/styles";
import { FunctionComponent } from "react";

const useWideDialogStyles = makeStyles((theme) => ({
  paper: {
    marginTop: 0, // 82,
    background: theme.customColors.greyHeaderBackground,
  },
  container: {
    paddingTop: 68,
  },
}));

export const WideDialog: FunctionComponent<DialogProps> = (props) => {
  const classes = useWideDialogStyles();
  return <Dialog maxWidth="sm" fullWidth classes={classes} {...props} />;
};

export const InfoChips = styled("div")({
  "& > *": {
    marginRight: 6,
  },
});

type InfoChipProps = ChipProps & {};

export const InfoChip: FunctionComponent<InfoChipProps> = ({
  size = "small",
  ...rest
}) => {
  return <Chip size={size} {...rest} />;
};
