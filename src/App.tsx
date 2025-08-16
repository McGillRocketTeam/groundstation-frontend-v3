import DockViewLayout from "@/layout/dockview/dockview";
import { BrowserRouter, Route, Routes } from "react-router";
import RouterLayout from "@/layout/RouterLayout";
import SettingsPage from "@/components/settings/SettingsPage";
import TW1 from "./checklist/TW1";
import { ThemeProvider } from "./components/ThemeProvider";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Default Route */}
          <Route element={<RouterLayout />}>
            <Route
              path={""} // This will be "" for index, "critical" for critical, etc.
              element={<DockViewLayout />}
            />
            <Route path="tw1" element={<TW1 />} />
            <Route
              path={":slug"} // This will be "" for index, "critical" for critical, etc.
              element={<DockViewLayout />}
            />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
