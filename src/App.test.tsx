import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

test("App renders", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);

  expect(div.innerHTML).toContain("loader");
});
