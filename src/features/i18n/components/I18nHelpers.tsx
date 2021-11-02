import { Button, ButtonProps, MenuItem, Select } from "@material-ui/core";
import { makeStyles, styled } from "@material-ui/core/styles";
import classNames from "classnames";
import { FunctionComponent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageMenuIconButton } from "../../../components/buttons/Buttons";
import { CheckedIcon } from "../../../components/icons/RenIcons";
import { SpacedPaperContent } from "../../../components/layout/Paper";
import { BridgeModal } from "../../../components/modals/BridgeModal";
import { enableAllTranslations } from "../../../i18n/i18n";
import {
  availableLocales,
  enabledLocales,
  nativeLanguageNames,
} from "../../../i18n/localeBundles";

const useLanguageButtonStyles = makeStyles((theme) => ({
  root: {
    fontSize: 16,
    padding: `0px 16px`,
    height: 48,
    boxSizing: "border-box",
    border: `1px solid ${theme.palette.grey["400"]}`,
    boxShadow: `0px 1px 2px rgba(0, 27, 58, 0.1)`,
    transitionProperty: "background-color, box-shadow",
    "&:hover": {
      border: `2px solid ${theme.palette.primary.main}`,
      background: "transparent",
      padding: `0px 15px`,
    },
  },
  label: {
    justifyContent: "space-between",
  },
  selected: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    pointerEvents: "none",
    cursor: "not-allowed",
    "&:hover": {
      border: `1px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

export const LanguageButtonWrapper = styled("div")({
  marginBottom: 16,
  minWidth: 320,
});

type LanguageButtonProps = ButtonProps & {
  selected?: boolean;
};

export const LanguageButton: FunctionComponent<LanguageButtonProps> = ({
  selected = false,
  children,
  ...props
}) => {
  const { selected: selectedClassName, ...classes } = useLanguageButtonStyles();
  const rootClassName = classNames({
    [selectedClassName]: selected,
  });
  return (
    <Button
      classes={classes}
      className={rootClassName}
      // color={selected ? "primary" : "default"}
      // variant={selected ? "contained" : "outlined"}
      fullWidth
      {...props}
      endIcon={selected ? <CheckedIcon /> : null}
    >
      {children}
    </Button>
  );
};

const useLanguageSelectorStyles = makeStyles(() => ({
  select: {
    padding: `0 12px`,
  },
}));

export type LanguageSelectorProps = {
  buttonClassName?: string;
  mode?: "select" | "dialog";
};

export const LanguageSelector: FunctionComponent<LanguageSelectorProps> = ({
  buttonClassName,
  mode = "select",
}) => {
  const classes = useLanguageSelectorStyles();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const { t, i18n } = useTranslation();
  const { language } = i18n;

  const handleLanguageChange = useCallback(
    (event) => {
      i18n.changeLanguage(event.currentTarget.value).then(() => {
        handleClose();
      });
    },
    [i18n]
  );

  const resolvedAvailableLocales = enableAllTranslations
    ? availableLocales
    : enabledLocales;

  if (resolvedAvailableLocales.length < 2) {
    return null;
  }

  if (mode === "dialog") {
    return (
      <>
        <LanguageMenuIconButton
          onClick={handleOpen}
          className={buttonClassName}
          title={language}
        />
        <BridgeModal
          open={open}
          maxWidth="xs"
          title={t("languages.choose-language")}
          onClose={handleClose}
        >
          <SpacedPaperContent topPadding bottomPadding fixedHeight>
            {resolvedAvailableLocales.map((languageKey) => (
              <LanguageButtonWrapper key={languageKey}>
                <LanguageButton
                  key={languageKey}
                  onClick={handleLanguageChange}
                  value={languageKey}
                  selected={language === languageKey}
                >
                  {nativeLanguageNames[languageKey]}
                </LanguageButton>
              </LanguageButtonWrapper>
            ))}
            {enableAllTranslations && (
              <LanguageButton
                onClick={handleLanguageChange}
                value="non-existent"
                selected={language === "non-existent"}
              >
                Non existent
              </LanguageButton>
            )}
          </SpacedPaperContent>
        </BridgeModal>
      </>
    );
  }
  return (
    <Select
      labelId="language-selector-label"
      id="language-selector-select"
      open={open}
      onClose={handleClose}
      onOpen={handleOpen}
      value={i18n.language}
      classes={classes}
    >
      {resolvedAvailableLocales.map((languageKey) => (
        <MenuItem
          key={languageKey}
          onClick={() => i18n.changeLanguage(languageKey)}
          value={languageKey}
          selected={languageKey === language}
        >
          {nativeLanguageNames[languageKey]}
        </MenuItem>
      ))}
      {enableAllTranslations && (
        <MenuItem
          onClick={() => i18n.changeLanguage("non-existent")}
          value="non-existent"
          selected={language === "non-existent"}
        >
          Non existent
        </MenuItem>
      )}
    </Select>
  );
};
