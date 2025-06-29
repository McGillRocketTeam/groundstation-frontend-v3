import { IDockviewPanelProps } from "dockview-react";
import { CommandButtonTableCardParams } from "./schema";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CommandConfiguration } from "../commandButton/schema";
import { useState, useRef, useCallback } from "react";
import { cn, getPairedQualifiedName } from "@/lib/utils";
import { yamcs } from "@/lib/yamcsClient/api";

export const CommandButtonTableCard = ({
  params,
}: IDockviewPanelProps<CommandButtonTableCardParams>) => {
  const [holdingStates, setHoldingStates] = useState<
    Record<string, { isHolding: boolean; progress: number }>
  >({});
  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const intervalsRef = useRef<Record<string, NodeJS.Timeout>>({});

  async function sendCommand(command: CommandConfiguration) {
    // Issue to the mirroring flight computer, if this is an FC Command
    const pairedComamnd = getPairedQualifiedName(command.qualifiedName);
    if (pairedComamnd) {
      await yamcs.issueCommand("gs_backend", "realtime", pairedComamnd, {
        args: command.arguments,
      });
    }

    yamcs.issueCommand("gs_backend", "realtime", command.qualifiedName, {
      args: command.arguments,
    });
  }

  const getCommandKey = useCallback((command: CommandConfiguration) => {
    return (
      command.label + command.qualifiedName + JSON.stringify(command.arguments)
    );
  }, []);

  const handleMouseDown = useCallback(
    (command: CommandConfiguration) => {
      const key = getCommandKey(command);
      const confirmationTime = command.confirmationTime;

      if (!confirmationTime) {
        sendCommand(command);
        return;
      }

      setHoldingStates((prev) => ({
        ...prev,
        [key]: { isHolding: true, progress: 0 },
      }));

      let progress = 0;
      const intervalMs = 50;
      const increment = (intervalMs / (confirmationTime * 1000)) * 100;

      intervalsRef.current[key] = setInterval(() => {
        progress += increment;
        setHoldingStates((prev) => ({
          ...prev,
          [key]: { isHolding: true, progress: Math.min(progress, 100) },
        }));
      }, intervalMs);

      timersRef.current[key] = setTimeout(() => {
        sendCommand(command);
        clearInterval(intervalsRef.current[key]);
        setHoldingStates((prev) => ({
          ...prev,
          [key]: { isHolding: false, progress: 0 },
        }));
      }, confirmationTime * 1000);
    },
    [getCommandKey],
  );

  const handleMouseUp = useCallback(
    (command: CommandConfiguration) => {
      const key = getCommandKey(command);

      if (timersRef.current[key]) {
        clearTimeout(timersRef.current[key]);
        delete timersRef.current[key];
      }

      if (intervalsRef.current[key]) {
        clearInterval(intervalsRef.current[key]);
        delete intervalsRef.current[key];
      }

      setHoldingStates((prev) => ({
        ...prev,
        [key]: { isHolding: false, progress: 0 },
      }));
    },
    [getCommandKey],
  );

  return (
    <Table>
      <TableBody>
        {params.commands.map((command) => {
          const key = getCommandKey(command);
          const holdingState = holdingStates[key];
          const hasConfirmation = !!command.confirmationTime;

          return (
            <TableRow key={key}>
              <TableCell>{command.label}</TableCell>
              <TableCell className="w-20">
                <Button
                  className={cn(
                    "relative overflow-hidden",
                    holdingState?.isHolding &&
                      "bg-transparent hover:bg-transparent focus:bg-transparent",
                  )}
                  onClick={
                    hasConfirmation ? undefined : () => sendCommand(command)
                  }
                  onMouseDown={
                    hasConfirmation ? () => handleMouseDown(command) : undefined
                  }
                  onMouseUp={
                    hasConfirmation ? () => handleMouseUp(command) : undefined
                  }
                  onMouseLeave={
                    hasConfirmation ? () => handleMouseUp(command) : undefined
                  }
                >
                  {hasConfirmation && holdingState?.isHolding && (
                    <>
                      <div className="absolute inset-0 bg-primary" />
                      <div
                        className="absolute inset-0 bg-destructive transition-all duration-75"
                        style={{
                          width: `${holdingState.progress}%`,
                        }}
                      />
                    </>
                  )}
                  <span className="relative z-10">
                    {hasConfirmation
                      ? holdingState?.isHolding
                        ? `HOLD`
                        : `SEND`
                      : "SEND"}
                  </span>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
