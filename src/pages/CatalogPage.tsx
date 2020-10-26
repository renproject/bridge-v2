import React, { FunctionComponent } from "react";
import { Catalog } from "../components/catalog/Catalog";
import { MainLayout } from "../components/layout/MainLayout";
import { usePageTitle } from "../hooks/usePageTitle";

export const CatalogPage: FunctionComponent = () => {
  usePageTitle("Catalog");
  return (
    <MainLayout>
      <Catalog />
    </MainLayout>
  );
};
