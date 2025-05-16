import { Fragment } from "react/jsx-runtime";
import {
  Acknowledgment,
  CommandHistoryRecord,
  yamcs,
} from "@/lib/yamcsClient/api";
import { AcknowledgementIcon } from "./AcknowledgementIcon";
import { cn, extractValue } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CommandDetail({ cmd }: { cmd: CommandHistoryRecord }) {
  // const [showDialog, setShowDialog] = useState(false);
  const commandQuery = useQuery({
    queryKey: [cmd.commandName],
    queryFn: () => yamcs.getCommand("gs_backend", cmd.commandName),
  });

  // const { addNotification } = useNotifications();

  // @ts-expect-error will use this later
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleConfirmCmd = async (
    cmdName: string,
    cmdArgs: { [key: string]: string },
  ) => {
    try {
      await yamcs.issueCommand("gs_backend", "realtime", cmdName, {
        args: cmdArgs,
      });
      toast.success("Command sent successfully");
    } catch (error) {
      // let message = "Unknown Error";
      // if (error instanceof Error) message = error.message;

      // addNotification({
      //   title: "Failed to send command: " + message,
      //   text: "Failed to send command: " + message,
      //   type: "error",
      // });
      console.error("Failed to send command: ", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div>
        <div className="font-semibold">Command</div>
        <div>{cmd.commandName}</div>
        {cmd.userAssignments.length > 0 && (
          <div className="grid grid-cols-[1fr_1fr] pl-2">
            {cmd.userAssignments.map((assignment, index) => {
              return (
                <Fragment key={assignment.name}>
                  <div className="relative pl-4">
                    {/* Vertical Marker */}
                    <div
                      className={cn(
                        "bg-border absolute top-0 left-0 h-full w-px",
                        // make the last vertical marker half height
                        index === cmd.userAssignments.length - 1 && "h-1/2",
                      )}
                    ></div>
                    {/* Horizontal Marker */}
                    <div className="bg-border absolute bottom-1/2 left-0 h-px w-3"></div>
                    <div className="pl-0">{assignment.name}</div>
                  </div>
                  <div>{extractValue(assignment.value)?.toString()}</div>
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
      <hr />
      <div>
        <div className="font-semibold">Generation Time</div>
        <div>{new Date(cmd.generationTime).toLocaleString()}</div>
      </div>
      <div>
        <div className="font-semibold">Issuer</div>
        <div>
          {cmd.username} @{cmd.origin}
        </div>
      </div>
      <div>
        <div className="font-semibold">Queue</div>
        <div>{cmd.queue}</div>
      </div>
      <hr />
      <div>
        <div className="pb-1 font-semibold">Yamcs Acknowledgments</div>
        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-x-2 gap-y-1">
          <GridRow
            name="Queued"
            time={cmd.generationTime}
            ack={cmd.acksByName["Acknowledge_Queued"]}
          />
          <GridRow
            name="Released"
            time={cmd.generationTime}
            ack={cmd.acksByName["Acknowledge_Released"]}
          />
          <GridRow
            name="Sent"
            time={cmd.generationTime}
            ack={cmd.acksByName["Acknowledge_Sent"]}
          />
          <GridRow
            name="Completed"
            time={cmd.generationTime}
            ack={cmd.completed}
          />
        </div>
      </div>
      {cmd.extraAcks.length > 0 && (
        <div>
          <div className="pb-1 font-semibold">Extra Acknowledgments</div>
          <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-x-2 gap-y-1">
            {cmd.extraAcks.map((ack) => (
              <GridRow key={ack.name} time={cmd.generationTime} ack={ack} />
            ))}
          </div>
        </div>
      )}
      <hr />
      <Button
        disabled={commandQuery.isLoading || !commandQuery.data}
        variant="destructive"
        size="sm"
        // onClick={() => setShowDialog(true)}
      >
        Resend Command
      </Button>
    </div>
  );
}

function GridRow({
  ack,
  time,
  name,
}: {
  ack?: Acknowledgment;
  time?: string;
  name?: string;
}) {
  return (
    <>
      <AcknowledgementIcon status={ack?.status ?? "none"} />
      <div>{name ?? ack?.name ?? "Unknown"}</div>
      <div className="text-center">{ack?.status ?? "-"}</div>
      {time && ack?.time ? (
        <div>{getTimeDifference(new Date(time), new Date(ack.time))}</div>
      ) : (
        <div>-</div>
      )}
    </>
  );
}

function getTimeDifference(date1: Date, date2: Date): string {
  // Calculate the difference in milliseconds
  const diff = date2.getTime() - date1.getTime();

  if (Math.abs(diff) < 1000) {
    // If the difference is less than 1 second, return in milliseconds
    return `${diff >= 0 ? "+" : "-"} ${Math.abs(diff)} ms`;
  } else if (Math.abs(diff) < 60 * 1000) {
    // If the difference is less than 1 minute, return in seconds
    const seconds = Math.floor(diff / 1000);
    return `${diff >= 0 ? "+" : "-"} ${Math.abs(seconds)} s`;
  } else {
    // Otherwise, return in minutes
    const minutes = Math.floor(diff / (60 * 1000));
    return `${diff >= 0 ? "+" : "-"} ${Math.abs(minutes)} min`;
  }
}
