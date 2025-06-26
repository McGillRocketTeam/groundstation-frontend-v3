import { CommandHistoryRecord, yamcs } from "@/lib/yamcsClient/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AcknowledgementIcon } from "./AcknowledgementIcon";
import { useEffect, useState } from "react";
import { CommandHistoryEntry } from "@/lib/yamcsClient/lib/client";
import CommandDetail from "./CommandDetail";
import CommandName from "@/components/command/CommandName";

export const CommandCard = () => {
  const [searchText] = useState("");
  const [historyRecords, setHistoryRecords] = useState<CommandHistoryRecord[]>(
    [],
  );

  const [newRowIds, setNewRowIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const listener = (entry: CommandHistoryEntry) => {
      setHistoryRecords((prevRecords) => {
        const existingIndex = prevRecords.findIndex((r) => r.id === entry.id);
        if (existingIndex === -1) {
          setNewRowIds((prev) => {
            const next = new Set(prev);
            next.add(entry.id);
            return next;
          });

          setTimeout(() => {
            setNewRowIds((prev) => {
              const next = new Set(prev);
              next.delete(entry.id);
              return next;
            });
          }, 2000);

          return [new CommandHistoryRecord(entry), ...prevRecords];
        } else {
          const updatedRecords = [...prevRecords];
          updatedRecords[existingIndex] =
            updatedRecords[existingIndex].mergeEntry(entry);
          return updatedRecords;
        }
      });
    };

    // populate initial data
    yamcs
      .getCommandHistoryEntries("gs_backend", {
        start: new Date(0).toISOString(),
        limit: 100,
      })
      .then((data) => {
        setHistoryRecords(
          data.entry?.map((entry) => new CommandHistoryRecord(entry)) ?? [],
        );
      });

    const subscription = yamcs.createCommandSubscription(
      {
        instance: "gs_backend",
        processor: "realtime",
      },
      listener,
    );

    return () => {
      console.log("UNSUBBING");
      subscription.removeMessageListener(listener);
    };
  }, []);

  return (
    <div className="grid h-full">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-10 text-center">Q</TableHead>
              <TableHead className="w-10 text-center">R</TableHead>
              <TableHead className="w-10 text-center">S</TableHead>
              <TableHead className="w-10">CA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyRecords
              .filter((cmd) =>
                cmd.commandName
                  .toLocaleLowerCase()
                  .includes(searchText.toLocaleLowerCase()),
              )
              .map((cmd) => (
                <Popover modal={true} key={cmd.id}>
                  <PopoverTrigger asChild>
                    <TableRow
                      data-new={newRowIds.has(cmd.id)}
                      className="data-[state=open]:bg-background-tertiary cursor-pointer text-sm data-[new=true]:animate-pulse data-[new=true]:bg-amber-200"
                    >
                      <TableCell className="space-y-1">
                        <div className="text-muted-foreground">
                          {formatCmdDate(cmd.generationTime)}
                        </div>
                        <CommandName name={cmd.commandName} />
                      </TableCell>

                      <TableCell className="w-10">
                        <Tooltip>
                          <TooltipTrigger className="grid w-full place-items-center">
                            <AcknowledgementIcon
                              status={
                                cmd.acksByName["Acknowledge_Queued"]?.status ??
                                "none"
                              }
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            Acknowledge Queued:{" "}
                            {cmd.acksByName["Acknowledge_Queued"]?.status ??
                              "Unknown"}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      <TableCell className="w-10">
                        <Tooltip>
                          <TooltipTrigger className="grid w-full place-items-center">
                            <AcknowledgementIcon
                              status={
                                cmd.acksByName["Acknowledge_Released"]
                                  ?.status ?? "none"
                              }
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            Acknowledge Released:{" "}
                            {cmd.acksByName["Acknowledge_Released"]?.status ??
                              "Unknown"}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="w-10">
                        <Tooltip>
                          <TooltipTrigger className="grid w-full place-items-center">
                            <AcknowledgementIcon
                              status={
                                cmd.acksByName["Acknowledge_Sent"]?.status ??
                                "none"
                              }
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            Acknowledge Sent:{" "}
                            {cmd.acksByName["Acknowledge_Sent"]?.status ??
                              "Unknown"}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="w-10 space-y-2">
                        {cmd.extraAcks.map((ack) => (
                          <Tooltip key={ack.name}>
                            <TooltipTrigger className="grid w-full place-items-center">
                              <AcknowledgementIcon status={ack.status} />
                            </TooltipTrigger>
                            <TooltipContent>
                              {ack.name}: {ack.status ?? "Unknown"}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {cmd.extraAcks.length === 0 && (
                          <AcknowledgementIcon status={undefined} />
                        )}
                      </TableCell>
                    </TableRow>
                  </PopoverTrigger>
                  <PopoverContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="p-0"
                  >
                    <ScrollArea className="">
                      <div className="p-2">
                        <CommandDetail cmd={cmd} />
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              ))}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  );
};

function formatCmdDate(cmdDate: string) {
  const now = new Date();
  const date = new Date(cmdDate);

  if (date.toDateString() === now.toDateString()) {
    return "Today, " + date.toLocaleTimeString();
  } else {
    return date.toLocaleString();
  }
}
