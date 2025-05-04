import { Button } from "@/components/ui/button";
import "./dockview.css";
import { themeLight } from "dockview";

import {
  DockviewReact,
  DockviewReadyEvent,
  IDockviewPanelProps,
} from "dockview";

const Default = (props: IDockviewPanelProps<CardParamters>) => {
  return (
    <div className="grid h-full place-items-center">
      <Button>{props.params.custom}</Button>
    </div>
  );
};

const components = {
  default: Default,
};

type CardParamters = {
  custom: string;
};

export default function DockViewLayout() {
  const onReady = (event: DockviewReadyEvent) => {
    event.api.addPanel<CardParamters>({
      id: "panel_1",
      component: "default",
      params: { custom: "asdf" },
    });

    event.api.addPanel({
      id: "panel_2",
      component: "default",
      position: {
        direction: "right",
        referencePanel: "panel_1",
      },
    });

    event.api.addPanel({
      id: "panel_3",
      component: "default",
      position: {
        direction: "below",
        referencePanel: "panel_1",
      },
    });
    event.api.addPanel({
      id: "panel_4",
      component: "default",
    });
    event.api.addPanel({
      id: "panel_5",
      component: "default",
    });
  };

  return (
    <div className="grow">
      <DockviewReact
        theme={themeLight}
        onReady={onReady}
        components={components}
      />
    </div>
  );
}
