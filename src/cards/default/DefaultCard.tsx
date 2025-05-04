import { Button } from "@/components/ui/button";
import { IDockviewPanelProps } from "dockview";
import { DefaultCardParams } from "./schema";

export const DefaultCard = (props: IDockviewPanelProps<DefaultCardParams>) => {
  return (
    <div className="grid h-full place-items-center">
      <Button>{props.params.custom}</Button>
    </div>
  );
};
