import { ModeToggle } from "../ThemeSwitcher";
import CalibrationSection from "./CalibrationSection";

export default function SettingsPage() {
  return (
    <div className="w-full bg-muted">
      <div className="w-[min(100%,1000px)] mx-auto p-6 sm:p-4">
        <CalibrationSection />

        <ModeToggle />
      </div>
    </div>
  );
}
