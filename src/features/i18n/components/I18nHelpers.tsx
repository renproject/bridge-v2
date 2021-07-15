import { MenuItem, Select } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { languages } from "../../../services/i18n";

const useLanguageSelectorStyles = makeStyles(() => ({
  select: {
    padding: `0 12px`,
  },
}));

export const LanguageSelector: FunctionComponent = () => {
  const classes = useLanguageSelectorStyles();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const { i18n } = useTranslation();
  const { language } = i18n;

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
      {Object.keys(languages).map((languageKey) => (
        <MenuItem
          key={languageKey}
          onClick={() => i18n.changeLanguage(languageKey)}
          value={languageKey}
          selected={languageKey === language}
        >
          {languages[languageKey]}
        </MenuItem>
      ))}
    </Select>
  );
};
