import { ComponentMap } from "./types";
import { DefaultCard } from "./default/DefaultCard";
import { CounterCard } from "./counter/CounterCard";
import { ChartCard } from "./chart/ChartCard";
import { CommandCard } from "./command/CommandCard";

export * from "./types";
export * from "./schemas";

export const components: ComponentMap = {
  default: DefaultCard,
  command: CommandCard,
  counter: CounterCard,
  chart: ChartCard,
};
