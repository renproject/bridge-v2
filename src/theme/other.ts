import { Breakpoints } from "@material-ui/core/styles/createBreakpoints";
import { Shape } from "@material-ui/core/styles/shape";
import { getShadow } from './animationUtils'

export const shape: Partial<Shape> = {
  borderRadius: 20,
};

export const breakpoints: Partial<Breakpoints> = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

export const defaultShadow = getShadow("#001B3A", 0.1, 0, 0, 3);
