import { Button } from "@/components/ui/button";
import { IDockviewPanelProps } from "dockview";
import { CounterCardParams } from "./schema";
import { useState } from "react";

export const CounterCard = (props: IDockviewPanelProps<CounterCardParams>) => {
  const [count, setCount] = useState(props.params.initialCount);
  return (
    <div className="grid h-full place-items-center">
      <Button
        onClick={() => setCount((c) => c + 1)}
      >{`${props.params.label}: ${count}`}</Button>
    </div>
  );
};
