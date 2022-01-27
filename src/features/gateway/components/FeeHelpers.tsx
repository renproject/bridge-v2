import { Button, Fade } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import { FunctionComponent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

const useFeesTogglerStyles = makeStyles((theme) => ({
  wrapper: {
    maxHeight: 0,
    transition: "max-height 1s ease-out",
    overflow: "hidden",
  },
  wrapperShown: {
    maxHeight: 140,
  },
  buttonWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 10,
  },
}));

export const FeesToggler: FunctionComponent = ({ children }) => {
  const { t } = useTranslation();
  const styles = useFeesTogglerStyles();
  const [show, setShow] = useState(false);
  const toggleShow = useCallback(() => {
    setShow((shown) => !shown);
  }, []);
  const wrapperClassName = classNames(styles.wrapper, {
    [styles.wrapperShown]: show,
  });
  return (
    <div>
      <div className={styles.buttonWrapper}>
        <Button
          color="primary"
          variant="text"
          size="small"
          onClick={toggleShow}
        >
          {show
            ? t("fees.toggler-hide-fees-label")
            : t("fees.toggler-show-fees-label")}
        </Button>
      </div>
      <div className={wrapperClassName}>
        <Fade in={show}>
          <div>{children}</div>
        </Fade>
      </div>
    </div>
  );
};
