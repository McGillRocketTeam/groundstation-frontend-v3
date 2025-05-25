import { ComponentKey } from "@/cards";
import { AddCardForm, AddCardFormProps } from "@/cards/AddCardForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";

interface AddCardDialogProps<K extends ComponentKey>
  extends Omit<AddCardFormProps<K>, "close"> {
  asChild?: boolean;
  children: ReactNode;
}

export default function AddCardDialog<K extends ComponentKey>({
  children,
  ...props
}: AddCardDialogProps<K>) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={props.asChild}>{children}</DialogTrigger>
      <DialogContent className="max-h-[80vh] flex flex-col gap-0 p-0 md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader className="border-b p-4 top-0 shrink-0">
          <DialogTitle>
            {props.defaultValues ? "Update Panel" : "Add Panel"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Set your panel here.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="divide-border grid grid-cols-1 divide-x overflow-scroll p-4">
            <AddCardForm {...props} close={() => setOpen(false)} />
          </div>
        </ScrollArea>
        <DialogFooter className="p-4">
          <Button form="AddCardForm" type="submit">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
