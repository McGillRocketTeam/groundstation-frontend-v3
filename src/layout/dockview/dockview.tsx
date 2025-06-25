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

export default function DockviewLayout() {
  const [api, setApi] = useState<DockviewApi>();

  function addDefaultCards(
    addTypeSafePanel: <T extends ComponentKey>(
      config: AddPanelConfig<T>,
    ) => void,
  ) {
    addTypeSafePanel({
      id: "panel_1",
      title: "Commands",
      component: "command",
      params: { custom: "asdf" },
    });
    addTypeSafePanel({
      id: "panel_6",
      title: "Connected Devices",
      component: "connectedDevices",
      params: {},
    });
    addTypeSafePanel({
      id: "panel_5",
      title: "Packets",
      component: "packetHistory",
      params: { container: "/FC1/FlightComputer/FCPacket" },
    });

    addTypeSafePanel({
      id: "panel_2",
      component: "parameterTable",
      params: {
        parameters: [
          QualifiedParameterName.parse("/FC1/FlightComputer/battery_voltage"),
          QualifiedParameterName.parse("/FC1/FlightComputer/flight_stage"),
          QualifiedParameterName.parse(
            "/FC1/FlightComputer/drogueEmatch_armed_SW",
          ),
        ],
      },
      title: "Parameter Table",
      position: {
        direction: "right",
        referencePanel: "panel_1",
      },
    });

    addTypeSafePanel({
      id: "panel_3",
      component: "chart",
      title: "Random Chart",
      params: { data: [1, 2, 3], title: "My Chart" },
      position: {
        direction: "below",
        referencePanel: "panel_1",
      },
    });
  }

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
    const addTypeSafePanel = <T extends ComponentKey>(
      config: AddPanelConfig<T>,
    ) => {
      componentSchemas[config.component].parse(config.params);
      event.api.addPanel({ ...config, tabComponent: "default" });
    };

    const layoutStorage = localStorage.getItem("mrt_dockview_layout");
    if (layoutStorage) {
      try {
        const layout = JSON.parse(layoutStorage);
        event.api.fromJSON(layout);
      } catch {
        console.error("Unable to parse saved layout, populating default cards");
        addDefaultCards(addTypeSafePanel);
      }
    } else {
      console.warn("No layout found, populating default cards");
      addDefaultCards(addTypeSafePanel);
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
