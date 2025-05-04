import DockViewLayout from "@/layout/dockview/dockview";
import "@fontsource/dm-mono/300.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import Header from "./components/header";

function App() {
  return (
    <div className="flex h-screen flex-col font-mono">
      <Header />
      <DockViewLayout />
    </div>
  );
}

export default App;
