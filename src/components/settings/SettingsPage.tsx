import SettingsImportExportSection from "./ImportExportSection";
import SettingsThemeSection from "./ThemeSection";

export default function SettingsPage() {
  return (
    <div className="w-full">
      <div className="w-[min(100%,1000px)] mx-auto p-6 sm:p-4 space-y-8">
        <h2 className="text-2xl">Ground Station GUI Settings</h2>
        <SettingsThemeSection />
        <SettingsImportExportSection />
      </div>
    </div>
  );
}
