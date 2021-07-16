import {
  Button,
  ButtonProps,
  DialogContent,
  MenuItem,
  Select,
} from "@material-ui/core";
import { makeStyles, styled } from "@material-ui/core/styles";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageMenuIconButton } from "../../../components/buttons/Buttons";
import { SpacedPaperContent } from "../../../components/layout/Paper";
import { BridgeModal } from "../../../components/modals/BridgeModal";
import { nativeLanguageNames } from "../../../i18n/localeBundles";

const useLanguageSelectorStyles = makeStyles(() => ({
  select: {
    padding: `0 12px`,
  },
}));

export const LanguageButtonWrapper = styled("div")({
  marginBottom: 16,
  minWidth: 320,
});

export const LanguageButton: FunctionComponent<ButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <Button variant="outlined" size="large" fullWidth {...props}>
      {children}
    </Button>
  );
};

export type LanguageSelectorProps = {
  mode?: "select" | "dialog";
};

export const LanguageSelector: FunctionComponent<LanguageSelectorProps> = ({
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

  const { i18n } = useTranslation();
  const { language } = i18n;

  if (mode === "dialog") {
    return (
      <>
        <LanguageMenuIconButton onClick={handleOpen} />
        <BridgeModal
          open={open}
          maxWidth="xs"
          title="Choose Language"
          onClose={handleClose}
        >
          <SpacedPaperContent topPadding bottomPadding>
            {Object.keys(nativeLanguageNames).map((languageKey) => (
              <LanguageButtonWrapper key={languageKey}>
                <LanguageButton
                  key={languageKey}
                  onClick={() => i18n.changeLanguage(languageKey)}
                  value={languageKey}
                >
                  {nativeLanguageNames[languageKey]}
                </LanguageButton>
              </LanguageButtonWrapper>
            ))}
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
      {Object.keys(nativeLanguageNames).map((languageKey) => (
        <MenuItem
          key={languageKey}
          onClick={() => i18n.changeLanguage(languageKey)}
          value={languageKey}
          selected={languageKey === language}
        >
          {nativeLanguageNames[languageKey]}
        </MenuItem>
      ))}
    </Select>
  );
};
