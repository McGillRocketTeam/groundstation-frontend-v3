import "./dockview.css";
import { DockviewApi, SerializedDockview } from "dockview";
import { DockviewReact, DockviewReadyEvent } from "dockview";
import {
  components,
  componentSchemas,
  ComponentKey,
  AddPanelConfig,
} from "@/cards";
import tabComponents from "./tab";
import RightComponent from "./right-component";
import { QualifiedParameterName } from "@/lib/schemas";
import { useEffect, useState } from "react";
import { initDockviewContainer } from "./initDockviewContainer";
import { redirect, useLocation } from "react-router";
import { getDashboard } from "@/lib/dashboard-persistance";

export default function DockviewLayout() {
  const [api, setApi] = useState<DockviewApi>();
  const location = useLocation();

  // Initialize the container size
  useEffect(() => {
    const cleanup = initDockviewContainer("dockview-container");
    return cleanup;
  }, []);

  // used for persisting state
  // triggers autosave
  useEffect(() => {
    if (!api) {
      return;
    }

    const disposable = api.onDidLayoutChange(() => {
      const layout: SerializedDockview = api.toJSON();
      localStorage.setItem("mrt_dockview_layout", JSON.stringify(layout));
    });

    return () => disposable.dispose();
  }, [api]);

  const onReady = (event: DockviewReadyEvent) => {
    setApi(event.api);

    const dashboard = getDashboard(location.pathname.substring(1));
    if (dashboard) {
      event.api.fromJSON(dashboard.dockview);
    } else {
      console.error(
        `Dashboard not found for slug ${location.pathname.substring(1)}`,
      );
    }
  };

  return (
    <>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div id="dockview-container">
          <DockviewReact
            className="dockview-theme-custom"
            onReady={onReady}
            components={components}
            rightHeaderActionsComponent={RightComponent}
            defaultTabComponent={tabComponents.default}
            tabComponents={tabComponents}
          />
        </div>
      </div>
    </>
  );
}
