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

export const getKeyframesName = (animationName: string) =>
  `@keyframes ${animationName}`;

export const getStandardAnimation = (animationName: string) =>
  `$${animationName} 2s infinite`;

export const createPulseAnimation = (
  color: string,
  spread = 5,
  animationName = "pulse"
) => {
  const initialShadow = getShadow(color, 0.4, 0, 0, 0, 0);
  const throughShadow = getShadow(color, 0, 0, 0, 0, spread);
  const toShadow = getShadow(color, 0, 0, 0, 0, 0);
  const keyframesName = getKeyframesName(animationName);
  const pulsingKeyframes = {
    [keyframesName]: {
      "0%": {
        boxShadow: initialShadow,
      },
      "70%": {
        boxShadow: throughShadow,
      },
      "100%": {
        boxShadow: toShadow,
      },
    },
  };
  const pulsingStyles = {
    boxShadow: initialShadow,
    animation: getStandardAnimation(animationName),
  };
  return { pulsingKeyframes, pulsingStyles, keyframesName };
};

export const createPulseOpacityAnimation = (animationName = "pulseOpacity") => {
  const keyframesName = getKeyframesName(animationName);
  const initialOpacity = 0.6;
  const pulsingKeyframes = {
    [keyframesName]: {
      "0%": {
        opacity: initialOpacity,
      },
      "70%": {
        opacity: 0.2,
      },
      "100%": {
        opacity: initialOpacity,
      },
    },
  };
  const pulsingStyles = {
    opacity: initialOpacity,
    animation: getStandardAnimation(animationName),
  };
  return { pulsingKeyframes, pulsingStyles, keyframesName };
};
