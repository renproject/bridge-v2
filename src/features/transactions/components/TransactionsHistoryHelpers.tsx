import {
  Box,
  Chip,
  ChipProps,
  darken,
  Dialog,
  Typography,
} from "@material-ui/core";
import { DialogProps } from "@material-ui/core/Dialog";
import { makeStyles, styled } from "@material-ui/core/styles";
import classNames from "classnames";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { ActionButton } from "../../../components/buttons/Buttons";
import { CustomSvgIconComponent } from "../../../components/icons/RenIcons";
import { SmallHorizontalPadder } from "../../../components/layout/LayoutHelpers";
import { CustomLink } from "../../../components/links/Links";
import { storageKeys } from "../../../constants/constants";
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

const TxFiltersWrapper = styled("div")({
  paddingTop: 10,
  paddingLeft: 38,
  paddingRight: 38,
});

export const TxFiltersHeader: FunctionComponent = ({ children }) => {
  return (
    <TxFiltersWrapper>
      <Typography variant="body2">
        <strong>{children}</strong>
      </Typography>
    </TxFiltersWrapper>
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
    backgroundColor: theme.palette.info.light,
  },
  pending: {
    backgroundColor: theme.customColors.chipPending,
  },
  done: {
    backgroundColor: theme.customColors.chipDone,
  },
  advanced: {
    backgroundColor: theme.customColors.chipAdvanced,
    "&:hover": {
      backgroundColor: darken(theme.customColors.chipAdvanced, 0.05),
    },
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
    | "pending"
    | "done"
    | "advanced"
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
    [styles.pending]: color === "pending",
    [styles.done]: color === "done",
    [styles.advanced]: color === "advanced",
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
  width: "100%",
});

const useAddressOnChainLinkStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "center",
    fontSize: 14,
  },
  separator: {
    marginLeft: 8,
    marginRight: 8,
  },
}));

type AddressOnChainLinkProps = {
  address: string;
  addressUrl?: string;
  Icon?: CustomSvgIconComponent;
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
      {addressUrl ? (
        <CustomLink
          color="primary"
          underline="hover"
          external
          externalPointer={false}
          href={addressUrl}
        >
          {trimAddress(address)}
        </CustomLink>
      ) : (
        <span>{trimAddress(address)}</span>
      )}
      {Icon !== undefined && (
        <>
          {" "}
          <span className={styles.separator}>{t("common.on")}</span>
          <Icon />
        </>
      )}
    </div>
  );
};

const useAddressInfoStyles = makeStyles(() => ({
  wrapper: {
    minHeight: 26,
  },
  label: {
    fontSize: 14,
  },
}));

type AddressInfoProps = AddressOnChainLinkProps & {
  label: string;
};

export const AddressInfo: FunctionComponent<AddressInfoProps> = ({
  address,
  addressUrl,
  Icon,
  label,
}) => {
  const styles = useAddressInfoStyles();
  return (
    <Typography gutterBottom component="div">
      <BluePadder>
        <FullWidthWrapper className={styles.wrapper}>
          <Typography variant="body2">{label}</Typography>
          <AddressOnChainLink
            address={address}
            addressUrl={addressUrl}
            Icon={Icon}
          />
        </FullWidthWrapper>
      </BluePadder>
    </Typography>
  );
};

const ACK_RENEWAL_HRS = 24;

export const TransactionSafetyWarning: FunctionComponent = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const lastAck = localStorage.getItem(storageKeys.SAFETY_ACK);
    if (lastAck === null) {
      setOpen(true);
    } else {
      const lastTs = Number(lastAck);
      if (Date.now() - lastTs > ACK_RENEWAL_HRS * 3600 * 1000) {
        setOpen(true);
      }
    }
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem(storageKeys.SAFETY_ACK, Date.now().toString());
    setOpen(false);
  }, []);

  return (
    <WideDialog open={open}>
      <Box p={6} textAlign="center">
        <Typography variant="body1" paragraph>
          RenBridge uses local browser storage to keep track of your ongoing
          bridge transactions. While bridging transactions through Ren, please
          do not remove your browser history and cache, and please do not use
          incognito mode, as you risk losing track of your bridge transactions.
          You can avoid this issue by bookmarking your unique bridge URL when
          prompted by the UI.
        </Typography>
        <Typography variant="body1">
          RenBridge uses the Ren protocol, which is new technology. While it has
          undergone security audits, that does not completely eliminate risks.
          Please be mindful when bridging large amounts of assets.
        </Typography>
        <Typography variant="body1">
          By proceeding, you understand the risks and are responsible for any
          lost funds.
        </Typography>
        <Box mt={6}>
          <ActionButton onClick={handleAccept}>Accept Terms</ActionButton>
        </Box>
      </Box>
    </WideDialog>
  );
};
