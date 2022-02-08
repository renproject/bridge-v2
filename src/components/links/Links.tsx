import { Link as MuiLink, LinkProps } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";

export const externalLinkAttributes = {
  target: "_blank",
  rel: "noopener noreferrer",
};

export type CustomLinkProps = LinkProps & {
  external?: boolean;
  externalPointer?: boolean;
  to?: any;
};

export const Link: FunctionComponent<CustomLinkProps> = ({
  external,
  externalPointer = external,
  children,
  target = external ? "_blank" : undefined,
  to,
  ...rest
}) => {
  const additionalParams =
    target === "_blank"
      ? {
          rel: externalLinkAttributes.rel,
        }
      : {};
  if (to) {
    return (
      <MuiLink
        component={RouterLink}
        to={to}
        target={target}
        {...rest}
        {...additionalParams}
      >
        {children}
        {externalPointer && " ↗"}
      </MuiLink>
    );
  }
  return (
    <MuiLink target={target} {...rest} {...additionalParams}>
      {children}
      {externalPointer && " ↗"}
    </MuiLink>
  );
};

export const CustomLink = Link;

export { RouterLink, MuiLink };
export type { RouterLinkProps };
