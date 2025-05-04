import { z } from "zod";
import { IDockviewPanelProps } from "dockview";
import { componentSchemas } from "./schemas";

export type ComponentKey = keyof typeof componentSchemas;

export type ComponentParams = {
  [K in ComponentKey]: z.infer<(typeof componentSchemas)[K]>;
};

export type ComponentMap = {
  [K in ComponentKey]: React.ComponentType<
    IDockviewPanelProps<ComponentParams[K]>
  >;
};

export type AddPanelConfig<T extends ComponentKey> = {
  id: string;
  component: T;
  params: ComponentParams[T];
  position?: {
    direction: "left" | "right" | "above" | "below";
    referencePanel: string;
  };
};
