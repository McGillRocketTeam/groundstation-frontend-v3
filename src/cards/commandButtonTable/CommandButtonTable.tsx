import { IDockviewPanelProps } from "dockview-react";
import { CommandButtonTableCardParams } from "./schema";
import { yamcs } from "@/lib/yamcsClient/api";
import { useQuery } from "@tanstack/react-query";
import { AutoForm } from "@/form/AutoForm";
import { commandToAutoForm } from "@/lib/yamcsCommands/command-schema-parser";

export const CommandButtonTableCard = ({
  params,
}: IDockviewPanelProps<CommandButtonTableCardParams>) => {
  const { data } = useQuery({
    queryKey: ["yamcs:commands"],
    queryFn: async () =>
      await yamcs.getCommand("gs_backend", "/LabJackT7/write_digital_pin"),
    // await yamcs.getCommands("gs_backend"),
  });

  if (!data) {
    return (
      <div className="grid w-full h-full place-items-center">
        No Commands Found
      </div>
    );
  }

  return (
    <div className="overflow-y-scroll w-full h-full p-4">
      <AutoForm
        autoForm={commandToAutoForm(data)!}
        onSubmit={(values) => console.log(values)}
      />
    </div>
  );
};
