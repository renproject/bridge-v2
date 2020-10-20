import React, { FunctionComponent } from "react";
import { Catalog } from '../components/catalog/Catalog'
import { MainLayout } from "../components/layout/MainLayout";

export const CatalogPage: FunctionComponent = () => {
  return (
    <MainLayout>
      <Catalog />
    </MainLayout>
  );
};
