import { Button, Popover } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";

const useFeesTogglerStyles = makeStyles((theme) => ({
  wrapper: {
    padding: 9,
    "& *": {
      color: `${theme.customColors.popoverTextColor}!important`,
    },
  },
  buttonWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 10,
  },
  paper: {
    borderRadius: 4,
    background: theme.customColors.popoverBackground,
    color: theme.customColors.popoverTextColor,
  },
}));

const popoverId = "transaction-fees-popover";

export const FeesToggler: FunctionComponent = ({ children }) => {
  const { t } = useTranslation();
  const styles = useFeesTogglerStyles();

  const [anchorEl, setAnchorEl] = useState(null);
  const opened = Boolean(anchorEl);

  const handleOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const id = opened ? popoverId : undefined;
  return (
    <div>
      <div className={styles.buttonWrapper}>
        <Button
          color="primary"
          variant="text"
          size="small"
          aria-owns={id}
          onClick={handleOpen}
        >
          {opened
            ? t("fees.toggler-hide-fees-label")
            : t("fees.toggler-show-fees-label")}
        </Button>
        <Popover
          id={popoverId}
          onClose={handleClose}
          open={opened}
          anchorEl={anchorEl}
          keepMounted={true}
          PaperProps={{
            className: styles.paper,
          }}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          <div className={styles.wrapper}>{children}</div>
        </Popover>
      </div>
    </div>
  );
};
