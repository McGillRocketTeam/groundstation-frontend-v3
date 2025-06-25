import { IDockviewPanelProps } from "dockview-react";
import { CommandButtonCardParams } from "./schema";

export const CommandButtonCard = ({
  params,
}: IDockviewPanelProps<CommandButtonCardParams>) => {
  return <div>Hello {params.command.label}!</div>;
};
