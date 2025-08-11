import "./dockview.css";
import { DockviewApi, SerializedDockview } from "dockview";
import { DockviewReact, DockviewReadyEvent } from "dockview";
import { components } from "@/cards";
import tabComponents from "./tab";
import RightComponent from "./right-component";
import { useEffect, useState } from "react";
import { initDockviewContainer } from "./initDockviewContainer";
import { Link, useLocation, useParams } from "react-router";
import { useUserSettingsStore } from "@/lib/dashboard-persistance";

export default function DockviewLayout() {
  const { updateDashboardDockView, getDashboard } = useUserSettingsStore();
  const [api, setApi] = useState<DockviewApi>();
  const location = useLocation();
  const params = useParams();

  // Initialize the container size
  useEffect(() => {
    const cleanup = initDockviewContainer("dockview-container");
    return cleanup;
  }, []);

  const [preventAutosave, setPreventAutosave] = useState(false);

  // On navigation, change dashboards
  useEffect(() => {
    if (!api) return;

    // Set the flag to prevent autosave during this update
    setPreventAutosave(true);

    const dashboard = getDashboard(params.slug ?? "");
    if (dashboard?.dockview) {
      api.fromJSON(dashboard.dockview);
    } else {
      api.addPanel({
        id: crypto.randomUUID(),
        component: "pid",
        title: "New Panel",
      });
      console.error(`Dashboard not found for slug ${params.slug}`);
    }

    // Unset the flag after the layout update has been initiated
    // Using a setTimeout with 0ms ensures this runs after the current render cycle,
    // allowing the layout changes to propagate before re-enabling autosave.
    // This is a common pattern for "next tick" type operations.
    const timer = setTimeout(() => {
      setPreventAutosave(false);
    }, 0);

    return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
  }, [api, params.slug]);

  // used for persisting state
  // triggers autosave
  useEffect(() => {
    if (!api) {
      return;
    }

    const disposable = api.onDidLayoutChange(() => {
      // Only autosave if the flag is not set
      if (!preventAutosave) {
        const layout: SerializedDockview = api.toJSON();
        updateDashboardDockView({
          slug: location.pathname.substring(1),
          dockview: layout,
        });
      }
    });

    return () => disposable.dispose();
  }, [api, preventAutosave, location.pathname]);

  const onReady = (event: DockviewReadyEvent) => {
    setApi(event.api);

    console.log(params.slug);
    const dashboard = getDashboard(params.slug ?? "");
    if (dashboard?.dockview) {
      event.api.fromJSON(dashboard.dockview);
    } else {
      console.error(`Dashboard not found for slug ${params.slug}`);
    }
  };

  return (
    <>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div id="dockview-container">
          {/* {api?.panels.length === 0 ? ( */}
          {/*   <div className="grid w-full h-full place-items-center"> */}
          {/*     <div className="text-center space-y-2"> */}
          {/*       <div className="text-error text-xl">No Dashboard Found</div> */}
          {/*       <p className="max-w-[65ch] text-balance"> */}
          {/*         You can import a dashboard from{" "} */}
          {/*         <Link className="underline" to="/settings"> */}
          {/*           settings */}
          {/*         </Link>{" "} */}
          {/*         or create a new one from the sidebar. */}
          {/*       </p> */}
          {/*     </div> */}
          {/*   </div> */}
          {/* ) : ( */}
          <DockviewReact
            className="dockview-theme-custom"
            onReady={onReady}
            components={components}
            rightHeaderActionsComponent={RightComponent}
            defaultTabComponent={tabComponents.default}
            tabComponents={tabComponents}
          />
          {/* )} */}
        </div>
      </div>
    </>
  );
}
