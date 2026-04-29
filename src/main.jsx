import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import JobSearchDashboard from "../JobSearchDashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <JobSearchDashboard />
  </StrictMode>
);
