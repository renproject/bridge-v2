import { Link as MuiLink, LinkProps } from '@material-ui/core'
import React, { FunctionComponent } from 'react'
import { Link as RouterLink, LinkProps as RouterLinkProps, } from 'react-router-dom'

export type CustomLinkProps = LinkProps & {
  external?: boolean;
  to?: any;
};

export const Link: FunctionComponent<CustomLinkProps> = ({
  external,
  children,
  to,
  ...rest
}) => {
  if (to) {
    return (
      <MuiLink component={RouterLink} to={to} {...rest}>
        {children}
        {external && " ↗"}
      </MuiLink>
    );
  }
  return (
    <MuiLink {...rest}>
      {children}
      {external && " ↗"}
    </MuiLink>
  );
};

export { RouterLink, MuiLink };
export type { RouterLinkProps };
