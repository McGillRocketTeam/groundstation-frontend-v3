import DockViewLayout from "@/layout/dockview/dockview";
import "@fontsource/dm-mono/300.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "@fontsource-variable/roboto-mono";
import Header from "./components/Header";

function App() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <DockViewLayout />
    </div>
  );
}

export default App;
