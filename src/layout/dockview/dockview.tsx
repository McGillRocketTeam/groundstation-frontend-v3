import "./dockview.css";
import { themeLight } from "dockview";
import { DockviewReact, DockviewReadyEvent } from "dockview";
import {
  components,
  componentSchemas,
  ComponentKey,
  AddPanelConfig,
} from "@/cards";
import tabComponents from "./tab";
import RightComponent from "./right-component";

export default function App() {
  const onReady = (event: DockviewReadyEvent) => {
    const addTypeSafePanel = <T extends ComponentKey>(
      config: AddPanelConfig<T>,
    ) => {
      componentSchemas[config.component].parse(config.params);
      event.api.addPanel({ ...config, tabComponent: "default" });
    };

    addTypeSafePanel({
      id: "panel_1",
      title: "asdf",
      component: "command",
      params: { custom: "asdf" },
    });

    addTypeSafePanel({
      id: "panel_2",
      component: "counter",
      params: { initialCount: 0, label: "Clicks" },
      position: {
        direction: "right",
        referencePanel: "panel_1",
      },
    });

    addTypeSafePanel({
      id: "panel_3",
      component: "chart",
      params: { data: [1, 2, 3], title: "My Chart" },
      position: {
        direction: "below",
        referencePanel: "panel_1",
      },
    });
  };

  return (
    <div className="grow">
      <DockviewReact
        theme={themeLight}
        onReady={onReady}
        // @ts-expect-error Allow for typesafe cards
        components={components}
        rightHeaderActionsComponent={RightComponent}
        defaultTabComponent={tabComponents.default}
        tabComponents={tabComponents}
      />
    </div>
  );
}
