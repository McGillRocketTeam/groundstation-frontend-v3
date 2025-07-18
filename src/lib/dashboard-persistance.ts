import { SerializedDockview } from "dockview-react";

interface SavedDashboard {
  name: string;
  slug: string;
  dockview: SerializedDockview;
}

interface UserSettings {
  dashboards: Record<string, SavedDashboard>;
}

const SETTINGS_STORAGE_KEY = "mrt_user_settings";

export function saveDashboard(dashboard: SavedDashboard) {
  let settingsString = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!settingsString) {
    settingsString = JSON.stringify({ dashboards: {} });
  }

  const settings = JSON.parse(settingsString) as UserSettings;
  settings.dashboards[dashboard.slug] = dashboard;

  const newSettingsString = JSON.stringify(settings);
  localStorage.setItem(SETTINGS_STORAGE_KEY, newSettingsString);
}

export function getDashboard(slug: string) {
  const settingsString = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!settingsString) return;

  const settings = JSON.parse(settingsString) as UserSettings;
  return settings.dashboards[slug];
}

export function getDashboardList() {
  // Migrate old dashboards to the new local storage method
  const legacyLayout = localStorage.getItem("mrt_dockview_layout");
  if (legacyLayout) {
    console.warn("Detected legacy layout, migrating to new settings");
    const legacy = JSON.parse(legacyLayout) as SerializedDockview;
    saveDashboard({ name: "Home", slug: "", dockview: legacy });

    // Backup the old layout in case something happens but move it to a
    // new name so we dont migrate again
    localStorage.setItem("legacy_mrt_dockview_layout", legacyLayout);
    localStorage.removeItem("mrt_dockview_layout");
  }

  const settingsString = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!settingsString) return;

  const settings = JSON.parse(settingsString) as UserSettings;
  return Object.values(settings.dashboards);
}
