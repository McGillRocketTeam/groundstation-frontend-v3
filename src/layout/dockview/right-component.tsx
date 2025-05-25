import AddCardDialog from "@/components/AddCardDialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { IDockviewHeaderActionsProps } from "dockview-react";

export default function RightComponent(props: IDockviewHeaderActionsProps) {
  return (
    <AddCardDialog
      asChild
      onSubmit={(panel) => {
        // @ts-expect-error not sure why ts is mad
        props.containerApi.addPanel({
          ...panel,
          position: { referenceGroup: props.group },
        });
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="size-[var(--dv-tabs-and-actions-container-height)]"
      >
        <PlusIcon />
      </Button>
    </AddCardDialog>
  );
}
