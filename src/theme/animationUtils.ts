import { alpha } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { black } from "./colors";

export const getShadow = (
  color = black,
  fadeLevel = 0.15,
  x = 1,
  y = 1,
  blur = 2,
  spread = 0
) => `${x}px ${y}px ${blur}px ${spread}px ${alpha(color, fadeLevel)}`;

export const getKeyframesName = (animationName: string) =>
  `@keyframes ${animationName}`;

export const getStandardAnimation = (animationName: string) =>
  `$${animationName} 2s infinite`;

export const createPulseAnimation = (
  color: string,
  spread = 5,
  animationName = "pulse"
) => {
  const initialShadow = getShadow(color, 0.5, 0, 0, 0, 0);
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

export const getTranslate3dX = (pixels = 0) => {
  return `translate3d(${pixels}px, 0, 0)`;
};

export const getRotate = (degrees = 0) => {
  return `rotate(${degrees}deg)`;
};

export const createShakeAnimation = (
  magnitude = 1,
  animationName = "shake"
) => {
  const keyframesName = getKeyframesName(animationName);
  const shakeKeyframesStyles = {
    "0%": {
      transform: getRotate(),
    },
    "20%": {
      transform: getRotate(magnitude),
    },
    "40%": {
      transform: getRotate(-2 * magnitude),
    },
    "60%": {
      transform: getRotate(2 * magnitude),
    },
    "80%": {
      transform: getRotate(-magnitude),
    },
    "100": {
      transform: getRotate(),
    },
  };
  const shakeKeyframes = {
    [keyframesName]: shakeKeyframesStyles,
  };
  const shakeStyles = {
    animation: `$${animationName} 0.2s ease-in-out infinite`,
    transformOrigin: "50% 50%",
    transform: getRotate(0),
  };
  return {
    shakeKeyframes,
    shakeStyles,
    keyframesName,
    shakeKeyframesStyles,
  };
};

export const useShakingStyles = makeStyles(() => {
  const { shakeKeyframes, shakeStyles } = createShakeAnimation(1);
  return {
    ...shakeKeyframes,
    shaking: shakeStyles,
  };
});
