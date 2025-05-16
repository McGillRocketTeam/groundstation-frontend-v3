import DockViewLayout from "@/layout/dockview/dockview";
import { BrowserRouter, Route, Routes } from "react-router";
import RouterLayout from "./layout/RouterLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Route */}
        <Route element={<RouterLayout />}>
          <Route index element={<DockViewLayout />} />
          <Route path="settings" element={<div>Hello Settings</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
