import { IDockviewPanelProps } from "dockview-react";
import { CommandButtonTableCardParams } from "./schema";
import { yamcs } from "@/lib/yamcsClient/api";
import { useQuery } from "@tanstack/react-query";
import { AutoForm } from "@/form/AutoForm";
import { z } from "zod";

export const CommandButtonTableCard = ({
  params,
}: IDockviewPanelProps<CommandButtonTableCardParams>) => {
  // const { data } = useQuery({
  //   queryKey: ["yamcs:commands"],
  //   queryFn: async () => await yamcs.getCommands("gs_backend"),
  // });
  //
  // if (!data) {
  //   return (
  //     <div className="grid w-full h-full place-items-center">
  //       No Commands Found
  //     </div>
  //   );
  // }
  //
  // return (
  //   <div className="overflow-y-scroll w-full h-full">
  //     <pre>{JSON.stringify(data.commands, undefined, 2)}</pre>
  //   </div>
  // );
  //
  return (
    <AutoForm
      autoForm={{
        fields: [
          {
            id: "name",
            name: "Name",
            element: "text",
            schema: z.string(),
          },
          {
            id: "age",
            name: "Age",
            element: "dropdown",
            schema: z.number(),
            hint: "Test hint",
            options: [
              {
                name: "20",
                value: 20,
              },
              {
                name: "25",
                value: 25,
              },
            ],
          },
        ] as const,
      }}
      onSubmit={(values) => console.log(values)}
    />
  );
};
