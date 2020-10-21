import React, { FunctionComponent } from "react";
import { RouteComponentProps } from "react-router";
import { MainLayout } from "../components/layout/MainLayout";
import { storageKeys } from "../constants/constants";
import { paths } from "./routes";

export const HomePage: FunctionComponent<RouteComponentProps> = ({
  history,
}) => {
  if (!localStorage.getItem(storageKeys.TERMS_AGREED)) {
    history.replace(paths.WELCOME);
  }

  return <MainLayout></MainLayout>;
};
