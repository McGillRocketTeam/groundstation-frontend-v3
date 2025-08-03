import { CommandConfiguration } from "@/lib/schemas";
import { Combobox } from "@/form/components/combobox";
import { yamcs } from "@/lib/yamcsClient/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Command } from "@/lib/yamcsClient/lib/client";
import { DialogDescription } from "@radix-ui/react-dialog";

export function CommandButtonSelector({
  // children,
  onSelection,
}: {
  // children: ReactNode;
  onSelection: (selection: CommandConfiguration) => void;
}) {
  const { data: commands } = useQuery({
    queryKey: ["yamcs:getCommands"],
    queryFn: async () => await yamcs.getCommands("gs_backend"),
  });
  const [currentSelection, setCurrentSelection] = useState<
    Command | undefined
  >();

  return (
    <div className="flex flex-col">
      {currentSelection?.toString()}
      <Dialog
        open={currentSelection !== undefined}
        // Allow for the dialog to internally close itself. For example
        // when the built in close button is pressed, we clear the selection
        // so it can be opened again
        onOpenChange={(open) => !open && setCurrentSelection(undefined)}
      >
        <Combobox
          className="w-full"
          placeholder="Add a new command"
          value={currentSelection}
          onValueChange={setCurrentSelection}
          options={
            commands
              ? commands.commands!.map((c) => ({
                  value: c,
                  name: c.qualifiedName,
                }))
              : []
          }
        ></Combobox>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Command Arguments</DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
