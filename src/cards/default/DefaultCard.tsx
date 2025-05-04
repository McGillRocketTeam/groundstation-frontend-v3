import { IDockviewPanelProps } from "dockview";
import { DefaultCardParams } from "./schema";
import { useQuery } from "@tanstack/react-query";
import { yamcs } from "@/lib/yamcsClient/api";

export const DefaultCard = (props: IDockviewPanelProps<DefaultCardParams>) => {
  const { data } = useQuery({
    queryKey: ["data"],
    queryFn: async () => {
      return await yamcs.getCommands("gs_backend");
    },
  });

  return (
    <div className="grid h-full place-items-center">
      {data?.commands && (
        <>
          <ul>
            {data.commands.map((c) => (
              <li key={c.qualifiedName}>{c.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
