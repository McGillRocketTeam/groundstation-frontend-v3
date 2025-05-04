import { AddCardForm } from "@/cards/AddCardForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "@radix-ui/react-icons";
import { IDockviewHeaderActionsProps } from "dockview-react";
import { useState } from "react";

export default function RightComponent(props: IDockviewHeaderActionsProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-[var(--dv-tabs-and-actions-container-height)]"
        >
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-scroll p-0 md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader className="border-b p-4">
          <DialogTitle>Add Panel</DialogTitle>
          <DialogDescription className="sr-only">
            Set your panel here.
          </DialogDescription>
        </DialogHeader>
        <div className="h-full overflow-scroll">
          <div className="divide-border grid grid-cols-1 divide-x overflow-scroll px-4 pb-4">
            <AddCardForm
              onSubmit={(panel) => {
                console.log(panel);
                // @ts-expect-error not sure why ts is mad
                props.containerApi.addPanel({
                  ...panel,
                  position: { referenceGroup: props.group },
                });
                setOpen(false);
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
