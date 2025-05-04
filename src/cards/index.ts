import { ComponentMap } from "./types";
import { DefaultCard } from "./default/DefaultCard";
import { CounterCard } from "./counter/CounterCard";
import { ChartCard } from "./chart/ChartCard";

export * from "./types";
export * from "./schemas";

export const components: ComponentMap = {
  default: DefaultCard,
  counter: CounterCard,
  chart: ChartCard,
};
