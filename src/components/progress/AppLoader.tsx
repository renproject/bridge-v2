import React, { FunctionComponent } from "react";

export const AppLoader: FunctionComponent = () => (
  <div id="root">
    <div className="loader">
      <div className="lds-ellipsis">
        <div/>
        <div/>
        <div/>
        <div/>
      </div>
    </div>
  </div>
);
