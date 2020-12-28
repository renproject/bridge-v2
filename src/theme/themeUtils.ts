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

