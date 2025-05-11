import DockViewLayout from "@/layout/dockview/dockview";
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
