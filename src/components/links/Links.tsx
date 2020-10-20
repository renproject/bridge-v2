import { Link as MuiLink, LinkProps } from "@material-ui/core";
import React, { FunctionComponent } from "react";

type StyledLinkProps = LinkProps & {
  external?: boolean;
};

export const Link: FunctionComponent<StyledLinkProps> = ({
  external,
  children,
  ...rest
}) => {
  return (
    <MuiLink {...rest}>
      {children}
      {external && " ↗"}
    </MuiLink>
  );
};
