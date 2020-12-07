import { fade } from "@material-ui/core";
import { black } from "./colors";

export const generatePlaceholderStyles = (color: string) => {
  const placeholder = {
    color,
  };

  return {
    "&::placeholder": placeholder,
    "&::-webkit-input-placeholder": placeholder,
    "&::-moz-placeholder": placeholder, // Firefox 19+
    "&:-ms-input-placeholder": placeholder, // IE 11
    "&::-ms-input-placeholder": placeholder, // Edge
  };
};

export const getShadow = (
  color = black,
  fadeLevel = 0.15,
  x = 1,
  y = 1,
  blur = 2,
  spread = 0
) => `${x}px ${y}px ${blur}px ${spread}px ${fade(color, fadeLevel)}`;

//  `1px 1px 2px 0 ${fade(color, fadeLevel)}`;
