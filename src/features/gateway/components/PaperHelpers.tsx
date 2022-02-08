import { FunctionComponent } from "react";
import { PaperContent } from "../../../components/layout/Paper";

export const PCW: FunctionComponent = ({ children }) => (
  <PaperContent bottomPadding> {children}</PaperContent>
);
