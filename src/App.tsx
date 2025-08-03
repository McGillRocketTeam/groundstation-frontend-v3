import DockViewLayout from "@/layout/dockview/dockview";
import { BrowserRouter, Route, Routes } from "react-router";
import RouterLayout from "@/layout/RouterLayout";
import SettingsPage from "@/components/settings/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Route */}
        <Route element={<RouterLayout />}>
          <Route
            path={""} // This will be "" for index, "critical" for critical, etc.
            element={<DockViewLayout />}
          />
          <Route
            path={":slug"} // This will be "" for index, "critical" for critical, etc.
            element={<DockViewLayout />}
          />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
