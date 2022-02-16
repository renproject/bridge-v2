import { Chip, ChipProps, Dialog } from "@material-ui/core";
import { DialogProps } from "@material-ui/core/Dialog";
import { makeStyles, styled } from "@material-ui/core/styles";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { CustomSvgIconComponent } from "../../../components/icons/RenIcons";
import { SmallHorizontalPadder } from "../../../components/layout/LayoutHelpers";
import { CustomLink } from "../../../components/links/Links";
import { trimAddress } from "../../../utils/strings";

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

export const BluePadder = styled(SmallHorizontalPadder)(({ theme }) => ({
  paddingTop: 1,
  paddingBottom: 1,
  borderRadius: 18,
  background: theme.customColors.skyBlueLight,
}));

export const FullWidthWrapper = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const useAddressOnChainLinkStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "center",
    fontSize: 14,
  },
  link: {},
  separator: {
    marginLeft: 8,
    marginRight: 8,
  },
}));

type AddressOnChainLinkProps = {
  address: string;
  addressUrl?: string;
  Icon: CustomSvgIconComponent;
};

export const AddressOnChainLink: FunctionComponent<AddressOnChainLinkProps> = ({
  address,
  addressUrl,
  Icon,
}) => {
  const styles = useAddressOnChainLinkStyles();
  const { t } = useTranslation();
  return (
    <div className={styles.root}>
      <CustomLink
        className={styles.link}
        color="primary"
        underline="hover"
        external
        externalPointer={false}
        href={addressUrl}
      >
        {trimAddress(address)}
      </CustomLink>
      <span className={styles.separator}>{t("common.on")}</span>
      <Icon />
    </div>
  );
};
