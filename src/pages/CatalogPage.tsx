import React, { FunctionComponent } from "react";
import { Catalog } from "../components/catalog/Catalog";
import { ConnectedMainLayout } from "./MainLayout";
import { usePageTitle } from "../providers/TitleProviders";

const CatalogPage: FunctionComponent = () => {
  usePageTitle("Catalog");
  return (
    <ConnectedMainLayout>
      <Catalog />
    </ConnectedMainLayout>
  );
};

export default CatalogPage;
