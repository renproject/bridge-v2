import { Breakpoints, } from '@material-ui/core/styles/createBreakpoints'
import { Shape } from '@material-ui/core/styles/shape'

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
