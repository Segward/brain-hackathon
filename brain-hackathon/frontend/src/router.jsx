import { Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import Program from "./components/program.jsx";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/program" element={<Program />} />
      <Route path="*" element={<div>Not found</div>} />
    </Routes>
  );
}

export default Router;
