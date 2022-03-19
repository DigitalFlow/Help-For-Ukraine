import * as React from "react";
import { SSRProvider } from "react-bootstrap";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./components/App";

ReactDOM.render(
  <SSRProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SSRProvider>,
  document.getElementById("root")
);
