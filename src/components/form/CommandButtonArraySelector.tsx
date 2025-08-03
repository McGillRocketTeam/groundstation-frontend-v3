import { CommandConfiguration } from "@/lib/schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "@/lib/utils";
import { Combobox } from "@/form/components/combobox";
import { useQuery } from "@tanstack/react-query";
import { yamcs } from "@/lib/yamcsClient/api";
import { Fragment, useRef, useState } from "react";
import { Command } from "@/lib/yamcsClient/lib/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "../ui/dialog";
import { BRAND } from "zod";
import { AutoForm } from "@/form/AutoForm";
import { commandToAutoForm } from "@/lib/yamcsCommands/command-schema-parser";
import { Cross2Icon } from "@radix-ui/react-icons";

export function CommandButtonArraySelector({
  commands,
  onCommandsChange,
}: {
  commands: CommandConfiguration[];
  onCommandsChange: (newCommands: CommandConfiguration[]) => void;
}) {
  if (commands === undefined) {
    onCommandsChange([]);
  }

  const { data: allCommands } = useQuery({
    queryKey: ["yamcs:getCommands"],
    queryFn: async () => await yamcs.getCommands("gs_backend"),
  });

  const [dialogCommand, setDialogCommand] = useState<Command | undefined>();
  const lastInputRef = useRef<HTMLInputElement>(null);

  function addRow(
    qualifiedName: string & BRAND<"QualifiedParameterName">,
    args?: Pick<CommandConfiguration, "arguments">,
  ) {
    onCommandsChange([
      ...commands,
      {
        label: `Command ${commands.length + 1}`,
        qualifiedName: qualifiedName,
        arguments: args,
      },
    ]);

    // Focus the last input after the DOM updates
    setTimeout(() => {
      lastInputRef.current?.focus();
      lastInputRef.current?.select();
    }, 0);
  }

  function removeRow(commandToRemove: CommandConfiguration) {
    onCommandsChange(commands.filter((command) => command !== commandToRemove));
  }

  return (
    <Dialog
      open={dialogCommand !== undefined}
      onOpenChange={(open) => !open && setDialogCommand(undefined)}
    >
      <Table className="border">
        {commands.length > 0 && (
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Command</TableHead>
              <TableHead className="text-right">Delay (s)</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {commands.map((command, index) => {
            const isLastRow = index === commands.length - 1;
            return (
              <TableRow
                key={command.qualifiedName + JSON.stringify(command.arguments)}
              >
                <TableCell className="align-top">
                  <input
                    className="focus:outline-none w-full"
                    value={command.label}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      const updatedCommands = commands.map((cmd, i) =>
                        i === index ? { ...cmd, label: newLabel } : cmd,
                      );
                      onCommandsChange(updatedCommands);
                    }}
                    ref={isLastRow ? lastInputRef : null}
                  />
                </TableCell>
                <TableCell>
                  {/* The command name with a subtree for the arguments */}
                  {command.qualifiedName}
                  {command.arguments && (
                    <div className="grid grid-cols-[1fr_1fr] pl-2">
                      {Object.entries(command.arguments).map(
                        (assignment, index) => {
                          return (
                            <Fragment key={assignment[0]}>
                              <div className="relative pl-4">
                                {/* Vertical Marker */}
                                <div
                                  className={cn(
                                    "bg-border absolute top-0 left-0 h-full w-px",
                                    // make the last vertical marker half height
                                    index ===
                                      Object.keys(command.arguments!).length -
                                        1 && "h-1/2",
                                  )}
                                ></div>
                                {/* Horizontal Marker */}
                                <div className="bg-border absolute bottom-1/2 left-0 h-px w-3"></div>
                                <div className="pl-0">{assignment[0]}</div>
                              </div>
                              <div>{assignment[1]}</div>
                            </Fragment>
                          );
                        },
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right align-top">
                  <input
                    className="focus:outline-none w-full text-right"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="None"
                    value={command.confirmationTime ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const confirmationTime =
                        value === "" ? undefined : parseFloat(value);
                      const updatedCommands = commands.map((cmd, i) =>
                        i === index ? { ...cmd, confirmationTime } : cmd,
                      );
                      onCommandsChange(updatedCommands);
                    }}
                  />
                </TableCell>
                <TableCell className="grid place-items-center">
                  <button
                    type="button"
                    className="h-full hover:text-destructive transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      removeRow(command);
                    }}
                  >
                    <Cross2Icon />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        {allCommands?.commands && (
          <TableFooter className={cn(commands.length === 0 && "border-t-0")}>
            <TableRow>
              <TableCell className="p-0" colSpan={4}>
                <Combobox
                  placeholder="Add Command"
                  className="w-full "
                  options={allCommands.commands!.map((c) => ({
                    value: c,
                    name: c.qualifiedName,
                  }))}
                  onValueChange={(selection) => {
                    // If there are no args, add it directly,
                    // otherwise show the args dialog
                    if (selection && selection.argument === undefined) {
                      addRow(selection.qualifiedName);
                    } else if (selection) {
                      setDialogCommand(selection);
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
      <DialogPortal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Command Arguments</DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
          </DialogHeader>
          {dialogCommand && (
            <AutoForm
              autoForm={commandToAutoForm(dialogCommand)!}
              onSubmit={(args) => {
                addRow(dialogCommand.qualifiedName, args);
                setDialogCommand(undefined);
              }}
            />
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
