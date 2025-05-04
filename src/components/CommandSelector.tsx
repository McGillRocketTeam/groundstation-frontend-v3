import { Search, ArrowLeft, X } from "lucide-react";
import { useEffect, useState } from "react";
import { yamcs } from "../lib/yamcsClient/api.ts";
import { Command } from "../lib/yamcsClient/lib/client";
import { cn } from "../lib/utils.ts";

type CommandTree = {
  [key: string]: CommandTree | Command;
};

export default function CmdSelector({
  onConfirmCmd,
  onClose,
  warning,
}: {
  onConfirmCmd: (
    commandName: string,
    commandArgs: { [key: string]: string },
  ) => void;
  onClose?: () => void;
  warning?: boolean;
}) {
  //const wsRef = useRef<CommandSubscription>(null);
  const [availableCommands, setAvailableCommands] = useState<Command[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [commandTree, setCommandTree] = useState<CommandTree>({});

  useEffect(() => {
    // Fetch available commands from the backend
    yamcs.getCommands("gs_backend").then((data) => {
      setAvailableCommands(data.commands!);
      setCommandTree(buildCommandTree(data.commands!));
    });
  }, []);

  const buildCommandTree = (commands: Command[]): CommandTree => {
    const tree: CommandTree = {};
    commands.forEach((command) => {
      const parts = command.qualifiedName.split("/").slice(1);
      // For debugging
      //console.log("Parts:", parts);
      let currentLevel = tree;
      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = index === parts.length - 1 ? command : {};
        }
        currentLevel = currentLevel[part] as CommandTree;
      });
    });
    // For debugging
    // console.log("Built command tree:", tree);
    return tree;
  };

  const getCurrentLevel = (path: string[]): CommandTree | Command => {
    let currentLevel: CommandTree | Command = commandTree;
    path.forEach((part) => {
      currentLevel = (currentLevel as CommandTree)[part];
    });
    return currentLevel;
  };

  const renderTree = (path: string[]) => {
    const currentLevel = getCurrentLevel(path);

    if (typeof currentLevel === "object" && !Array.isArray(currentLevel)) {
      // Table component to display available commands in a folder like structure
      return (
        <>
          {Object.keys(currentLevel).map((key) => {
            const value = currentLevel[key];
            {
              /*I feel like this is not the best check. But it works for now*/
            }
            if (typeof value === "object" && !("qualifiedName" in value)) {
              return (
                <TableRow
                  className="cursor-pointer text-sm"
                  key={key}
                  onClick={() => setCurrentPath([...path, key])}
                >
                  <TableCell className="font-mono">{key}</TableCell>
                </TableRow>
              );
            } else {
              return (
                <TableRow
                  className="cursor-pointer text-sm"
                  key={key}
                  onClick={() => setSelectedCommand(value as Command)}
                >
                  <TableCell className="font-mono">{key}</TableCell>
                </TableRow>
              );
            }
          })}
        </>
      );
    }
    return null;
  };

  const RenderSearchResults = () => {
    const filteredCommands = availableCommands.filter((command) =>
      command.name
        .toLowerCase()
        .replace(" ", "")
        .replace("/", "")
        .includes(searchText.toLowerCase().replace(" ", "").replace("/", "")),
    );

    // Table component to display search results
    return (
      <>
        {filteredCommands.map((command) => (
          <TableRow
            className="cursor-pointer text-sm"
            key={command.qualifiedName}
            onClick={() => setSelectedCommand(command)}
          >
            <TableCell className="font-mono">{command.qualifiedName}</TableCell>
          </TableRow>
        ))}
      </>
    );
  };

  // Card component to display available commands
  const handleBackClick = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };

  return (
    <Card className="pointer-events-auto flex flex-col p-0">
      <div className="border-border flex flex-row items-center border-b text-nowrap">
        <div className="grid h-full w-full grid-cols-[1rem_1fr_auto] items-center gap-2 p-2">
          <Search className="h-4 w-4" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-background-secondary w-full focus:outline-none"
            placeholder="Search Available Commands"
          />
          {searchText.length > 0 && (
            <span className="text-muted-foreground text-sm">
              {
                availableCommands.filter((command) =>
                  command.name
                    .toLowerCase()
                    .replace(" ", "")
                    .replace("/", "")
                    .includes(
                      searchText
                        .toLowerCase()
                        .replace(" ", "")
                        .replace("/", ""),
                    ),
                ).length
              }{" "}
              results
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={() => onClose()}
            className="border-border hover:bg-background bg-background-secondary border-l p-3"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Table>
        <TableHeader className="border-border bg-background-secondary sticky top-0 border-b backdrop-blur-lg">
          {warning && (
            <TableRow>
              <TableHead className="bg-warning-100 text-primary">
                Send a new command
              </TableHead>
            </TableRow>
          )}
          <TableRow>
            <TableHead
              onClick={handleBackClick}
              className={cn(currentPath.length > 0 && "cursor-pointer")}
            >
              <div className="flex w-full items-center justify-between">
                <span>
                  {currentPath.length > 0 ? currentPath.join(" / ") : "Folders"}
                </span>
                {currentPath.length > 0 && <ArrowLeft className="h-4 w-4" />}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {searchText ? <RenderSearchResults /> : renderTree(currentPath)}
        </TableBody>
      </Table>
      {selectedCommand && (
        <SendCommandDialog
          command={selectedCommand}
          onClose={() => setSelectedCommand(null)}
          handleConfirm={onConfirmCmd}
        />
      )}
    </Card>
  );
}

export function SendCommandDialog({
  command,
  onClose,
  handleConfirm,
}: {
  command: Command;
  onClose: () => void;
  handleConfirm: (cmdName: string, args: { [key: string]: string }) => void;
}) {
  // Dialog component to send a command
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Send Command: {command.name}</DialogTitle>
        </DialogHeader>
        <CommandForm
          command={command}
          onSubmit={(args) => {
            handleConfirm(command.qualifiedName, args);
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
