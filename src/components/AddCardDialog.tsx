import { AddCardForm, AddCardFormProps } from "@/cards/AddCardForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";

interface AddCardDialogProps extends Omit<AddCardFormProps, "close"> {
  asChild?: boolean;
  children: ReactNode;
}

export default function AddCardDialog({
  children,
  ...props
}: AddCardDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={props.asChild}>{children}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-scroll p-0 md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader className="border-b p-4">
          <DialogTitle>Add Panel</DialogTitle>
          <DialogDescription className="sr-only">
            Set your panel here.
          </DialogDescription>
        </DialogHeader>
        <div className="h-full overflow-scroll">
          <div className="divide-border grid grid-cols-1 divide-x overflow-scroll px-4 pb-4">
            <AddCardForm {...props} close={() => setOpen(true)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
