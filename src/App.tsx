import DockViewLayout from "@/layout/dockview/dockview";
import { BrowserRouter, Route, Routes } from "react-router";
import RouterLayout from "@/layout/RouterLayout";
import SettingsPage from "@/components/settings/SettingsPage";
import { getDashboardList } from "./lib/dashboard-persistance";

// I have the following data structure i want to turn into routes:
// {
// dashboards: [
// {name: string, slug: string, ...}
// ]
// }
//
// parse all the dashboards and make routes for them
// they should be top level routes
// i.e. the index path dashboard would have a slug of ""
// and the critical dashboard would have a slug iof "critical"

function App() {
  const dashboards = getDashboardList();
  return (
    <BrowserRouter>
      <Routes>
        {dashboards?.map((dashboard) => (
          <Route
            key={dashboard.slug || "index"} // Use slug as key, or "index" for the empty slug
            path={dashboard.slug} // This will be "" for index, "critical" for critical, etc.
            element={<DockViewLayout />}
          />
        ))}
        {/* Default Route */}
        <Route element={<RouterLayout />}>
          <Route index element={<DockViewLayout />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
