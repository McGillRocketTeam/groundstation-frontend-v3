import { SerializedDockview } from "dockview-react";
import { create } from "zustand";

interface SavedDashboard {
  name: string;
  slug: string;
  dockview?: SerializedDockview;
}

interface UserSettings {
  dashboards: Record<string, SavedDashboard>;
}

interface UserSettingsState {
  settings: UserSettings;
  overwriteSettings: (settings: UserSettings) => void;
  updateDashboardDockView: (props: {
    slug: string;
    dockview: SerializedDockview;
  }) => void;
  saveDashboard: (dashboard: SavedDashboard) => void;
  deleteDashboard: (slug: string) => void;
  updateDashboardMetadata: (props: {
    oldSlug: string;
    newSlug?: string;
    newName?: string;
  }) => void;
  getDashboard: (slug: string) => SavedDashboard | undefined;
  getDashboardList: () => SavedDashboard[];
}

const SETTINGS_STORAGE_KEY = "mrt_user_settings";

const getInitialSettings = (): UserSettings => {
  // Migrate old dashboards to the new local storage method
  const legacyLayout = localStorage.getItem("mrt_dockview_layout");
  if (legacyLayout) {
    console.warn("Detected legacy layout, migrating to new settings");
    const legacy = JSON.parse(legacyLayout) as SerializedDockview;
    const initialDashboard: SavedDashboard = {
      name: "Home",
      slug: "",
      dockview: legacy,
    };
    const initialSettings: UserSettings = {
      dashboards: { "": initialDashboard },
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(initialSettings));

    // Backup the old layout in case something happens but move it to a
    // new name so we dont migrate again
    localStorage.setItem("legacy_mrt_dockview_layout", legacyLayout);
    localStorage.removeItem("mrt_dockview_layout");
    return initialSettings;
  }

  const settingsString = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (settingsString) {
    return JSON.parse(settingsString) as UserSettings;
  }
  return { dashboards: {} };
};

export const useUserSettingsStore = create<UserSettingsState>((set, get) => ({
  settings: getInitialSettings(),
  overwriteSettings: (settings) => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    set(({ settings }))
  },
  updateDashboardDockView: (props) => {
    set((state) => {
      const newSettings = { ...state.settings };
      if (newSettings.dashboards[props.slug]) {
        newSettings.dashboards[props.slug].dockview = props.dockview;
      } else {
        console.warn(
          `Couldn't update dashboard because dashboard with slug "${props.slug}" could not be found.`,
        );
      }
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(newSettings),
      );
      return { settings: newSettings };
    });
  },
  saveDashboard: (dashboard) => {
    set((state) => {
      const newSettings = { ...state.settings };
      newSettings.dashboards[dashboard.slug] = dashboard;
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(newSettings),
      );
      return { settings: newSettings };
    });
  },
  deleteDashboard: (slug) => {
    set((state) => {
      const newSettings = { ...state.settings };
      if (newSettings.dashboards[slug]) {
        delete newSettings.dashboards[slug];
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify(newSettings),
        );
      } else {
        console.warn(`Dashboard with slug "${slug}" not found for deletion.`);
      }
      return { settings: newSettings };
    });
  },
  updateDashboardMetadata: ({ oldSlug, newSlug, newName }) => {
    set((state) => {
      const newSettings = { ...state.settings };
      const dashboard = newSettings.dashboards[oldSlug];

      if (dashboard) {
        if (newSlug && newSlug !== oldSlug) {
          // If a new slug is provided, delete the old entry and add a new one
          delete newSettings.dashboards[oldSlug];
          newSettings.dashboards[newSlug] = { ...dashboard, slug: newSlug };
        } else {
          // If no new slug or same slug, just update the existing entry
          newSettings.dashboards[oldSlug] = { ...dashboard };
        }

        if (newName) {
          if (newSlug) {
            newSettings.dashboards[newSlug].name = newName;
          } else {
            newSettings.dashboards[oldSlug].name = newName;
          }
        }
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify(newSettings),
        );
      } else {
        console.warn(
          `Dashboard with slug "${oldSlug}" not found for metadata update.`,
        );
      }

      return { settings: newSettings };
    });
  },
  getDashboard: (slug) => {
    return get().settings.dashboards[slug];
  },
  getDashboardList: () => {
    return Object.values(get().settings.dashboards);
  },
}));

// Optional: If you need to respond to changes from other tabs/windows,
// you can add a listener for the 'storage' event.
window.addEventListener("storage", (event) => {
  if (event.key === SETTINGS_STORAGE_KEY && event.newValue) {
    try {
      const newSettings = JSON.parse(event.newValue) as UserSettings;
      useUserSettingsStore.setState({ settings: newSettings });
    } catch (e) {
      console.error("Error parsing settings from local storage:", e);
    }
  }
});
