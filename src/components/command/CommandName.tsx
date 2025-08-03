import { formatCommandName } from "@/lib/yamcsCommands/format-command-name";

export default function CommandName({ name }: { name: string }) {
  const formattedCommand = formatCommandName(name);

  // Fallback in case we don't get the rich format
  if (typeof formattedCommand === "string") {
    return <div>{name}</div>;
  }

  return (
    <div>
      <span>{formattedCommand.container}</span>
      <span className="px-[0.5ch] text-muted-foreground opacity-50">{"/"}</span>
      <span>{formattedCommand.name}</span>
    </div>
  );
}
