import { IDockviewPanelProps } from "dockview-react";
import { SerialTerminalCardParams } from "./schema";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon } from "@radix-ui/react-icons";
import { yamcs } from "@/lib/yamcsClient/api";
import { SerialEvent } from "@/lib/yamcsClient/lib/client";

interface OutputLine {
  id: string;
  source: "user" | string;
  text: string;
  timestamp: Date;
}

export const SerialTerminalCard = ({
  params,
}: IDockviewPanelProps<SerialTerminalCardParams>) => {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<OutputLine[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  const wsRef = useRef<SerialTerminalSubscription | null>(null);

  // Keep track of the active links
  const [activeLinks] = useState<Record<string, boolean>>(
    params.connections.reduce(
      (acc, currentString) => {
        acc[currentString] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  // Update the subscription when any links change
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.removeMessageListener(listener);
    }
    if (Object.keys(activeLinks).length > 0) {
      const links: string[] = [];
      for (const activeLink in activeLinks) {
        if (activeLinks[activeLink]) {
          links.push(activeLink);
        }
      }

      wsRef.current = yamcs.createSerialTerminalSubscription(
        { dataLinks: links },
        listener,
      );
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.removeMessageListener(listener);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLinks]);

  // The callback for when there is a new serial event
  const listener = (data: SerialEvent) => {
    addToOutput({
      source: data.link,
      text: data.message.trim(),
      timestamp: new Date(),
    });
  };

  // Used for inserting a new message into the terminal
  const addToOutput = useCallback(
    (line: Omit<OutputLine, "id">) => {
      if (line.text === "clear") {
        setOutput([]);
      } else {
        setOutput((prior) => {
          const newLine = { id: crypto.randomUUID(), ...line };
          const updated = [...prior, newLine];

          if (!autoScroll) {
            setNewMessagesCount((count) => count + 1);
          }

          return updated.length > 200
            ? updated.slice(updated.length - 200)
            : updated;
        });
      }
    },
    [autoScroll],
  );

  // Scroll to bottom when output changes
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [output, autoScroll]);

  // Listener to detect manual scroll up
  // this will pause auto-scroll
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLDivElement | null;

    if (!scrollContainer) return;

    const handleScroll = () => {
      const isAtBottom =
        scrollContainer.scrollHeight -
          scrollContainer.scrollTop -
          scrollContainer.clientHeight <
        30;

      setAutoScroll(isAtBottom);

      if (isAtBottom) {
        setNewMessagesCount(0); // Reset counter on manual scroll to bottom
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function handleSubmit(event: React.KeyboardEvent<HTMLInputElement>) {
    event.preventDefault();
    // Check if message exists
    if (input.trim()) {
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
      <ScrollArea
        ref={scrollAreaRef}
        className="grow overflow-scroll border-y relative"
      >
        {output.map((line) => (
          <TerminalLine key={line.id} message={line} />
        ))}
        {!autoScroll && newMessagesCount > 0 && (
          <div className="absolute right-4 bottom-4 z-10">
            <Button
              onClick={() => {
                setAutoScroll(true);
                setNewMessagesCount(0);
                messagesEndRef.current?.scrollIntoView();
              }}
              size="sm"
            >
              {newMessagesCount.toLocaleString()} New Messages <ArrowDownIcon />
            </Button>
          </div>
        )}
        <div ref={messagesEndRef} />
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
  message,
}: {
  message: OutputLine;
}) {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="px-2 group text-sm flex items-start space-x-2 hover:bg-muted">
      <span className="text-gray-500 text-xs min-w-[60px]">
        {formatTimestamp(message.timestamp)}
      </span>
      <span
        className={cn(message.source === "user" ? "text-blue-700" : "text-mrt")}
      >{`[${message.source.toLocaleUpperCase()}]`}</span>
      <span className="flex-1"> {message.id}</span>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(message.text);
        }}
        className="hidden group-hover:block text-muted-foreground"
      >
        Copy
      </button>
    </div>
  );
});
