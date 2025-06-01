import { IDockviewPanelProps } from "dockview-react";
import { SerialTerminalCardParams } from "./schema";
import React, { memo, useMemo, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface OutputLine {
  source: "user" | string;
  text: string;
  timestamp: Date;
}

export const SerialTerminalCard = ({
  params,
}: IDockviewPanelProps<SerialTerminalCardParams>) => {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<OutputLine[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);
  const [activeLinks, setActiveLinks] = useState<Record<string, boolean>>(
    params.connections.reduce(
      (acc, currentString) => {
        acc[currentString] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );
  const [isAutoScroll, setAutoScroll] = useState<boolean>(true);

  function addToOutput(line: OutputLine) {
    setOutput((prior) => [...prior, line]);
  }

  function handleSubmit(event: React.KeyboardEvent<HTMLInputElement>) {
    event.preventDefault(); // Prevent default form submission behavior (page reload)
    if (input.trim()) {
      console.log("Submitting:", input);
      addToOutput({ source: "user", text: input, timestamp: new Date() });
      setInput("");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 p-2 flex flex-row gap-4">
        {Object.keys(activeLinks).map((link) => (
          <div className="flex items-start gap-1">
            <Checkbox checked={activeLinks[link]} id={`${link}-toggle`} />
            <Label htmlFor={`${link}-toggle`}>{link}</Label>
          </div>
        ))}
      </div>
      <ScrollArea className="grow overflow-scroll border-y">
        {output.map((line) => (
          <TerminalLine data={line} />
        ))}
      </ScrollArea>
      <input
        value={input}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit(e);
          }
        }}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        className="shrink-0 p-2"
        placeholder="Type a command..."
      />
    </div>
  );
};

const TerminalLine = memo(function TerminalLine({
  data,
}: {
  data: OutputLine;
}) {
  return <div>Hello, {data.text}!</div>;
});
