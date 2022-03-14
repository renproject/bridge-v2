import { Chip, ChipProps, Dialog, Typography } from "@material-ui/core";
import { DialogProps } from "@material-ui/core/Dialog";
import { makeStyles, styled } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
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
  display: "flex",
  alignItems: "center",
  "& > *": {
    marginRight: 6,
  },
});

const TxEnumerationWrapper = styled("div")({
  paddingTop: 10,
  paddingLeft: 38,
  paddingRight: 38,
});

export const TxEnumerationHeader: FunctionComponent = ({ children }) => {
  return (
    <TxEnumerationWrapper>
      <Typography variant="body2">
        <strong>{children}</strong>
      </Typography>
    </TxEnumerationWrapper>
  );
};

const useInfoChipStyles = makeStyles((theme) => ({
  success: {
    backgroundColor: theme.palette.success.light,
  },
  error: {
    backgroundColor: theme.palette.error.light,
  },
  warning: {
    backgroundColor: theme.palette.warning.light,
  },
  info: {
    backgroundColor: theme.palette.success.light,
  },
}));

type CustomChipProps = Omit<ChipProps, "color"> & {
  color?:
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "success"
    | "info"
    | "default";
};

export const CustomChip: FunctionComponent<CustomChipProps> = ({
  size = "small",
  color = "default",
  ...rest
}) => {
  const styles = useInfoChipStyles();
  const className = classNames({
    [styles.success]: color === "success",
    [styles.error]: color === "error",
    [styles.warning]: color === "warning",
    [styles.info]: color === "info",
  });
  let resolvedColor = undefined;
  if (["primary", "secondary", "default"].includes(color)) {
    resolvedColor = color as ChipProps["color"];
  }
  return (
    <Chip color={resolvedColor} className={className} size={size} {...rest} />
  );
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

type AddressInfoProps = AddressOnChainLinkProps & {
  label: string;
};

export const AddressInfo: FunctionComponent<AddressInfoProps> = ({
  address,
  addressUrl,
  Icon,
  label,
}) => {
  return (
    <BluePadder>
      <FullWidthWrapper>
        <Typography variant="body2">{label}</Typography>
        <AddressOnChainLink
          address={address}
          addressUrl={addressUrl}
          Icon={Icon}
        />
      </FullWidthWrapper>
    </BluePadder>
  );
};
