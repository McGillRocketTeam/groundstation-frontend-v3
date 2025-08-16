import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Parameter } from "@/lib/yamcsClient/lib/client";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { ParameterSelector } from "./ParameterSelector";
import { ChartSeries } from "@/cards/chart/chart-data";
import { yamcs } from "@/lib/yamcsClient/api";
import { capitalize } from "lodash";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";

const CHART_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#2dd4bf",
  "#06b6d4",
  "#0ea5e9",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

export function ChartSeriesSelector({
  series,
  onSeriesChange,
}: {
  series: ChartSeries[];
  onSeriesChange: (value: ChartSeries[]) => void;
}) {
  if (!series) onSeriesChange([]);

  async function createSeries(parameter: Parameter) {
    const newSeries = {
      yamcsPropertyType: "CHART",
      parameter: parameter.qualifiedName,
      name: parameter.qualifiedName,
      type: "number",
      color: CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)],
    };

    // Parse enumeration type and add it
    if (parameter.type?.engType === "enumeration") {
      newSeries.type = "enumeration";
      const parameterType = await yamcs.getParameterType(
        "gs_backend",
        parameter.type?.qualifiedName,
      );

      // Reduce the enumValue array into an object with keys as the value and values as the label
      newSeries["enumeration"] = parameterType.enumValue.reduce((acc, item) => {
        acc[item.value] = item.label;
        return acc;
      }, {});
    }
    onSeriesChange([...series, newSeries as ChartSeries]);
  }

  return (
    <Table className="border">
      {series.length > 0 && (
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Parameter</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Color</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {series.map((seriesRow, index) => (
          <TableRow key={seriesRow.parameter}>
            <TableCell>
              <input
                className="focus:outline-none w-full "
                value={seriesRow.name}
                onChange={(e) => {
                  const newLabel = e.target.value;
                  const updatedSeries = series.map((seriesItem, i) =>
                    i === index
                      ? { ...seriesItem, name: newLabel }
                      : seriesItem,
                  );
                  onSeriesChange(updatedSeries);
                }}
                // ref={isLastRow ? lastInputRef : null}
              />
            </TableCell>
            <TableCell>{seriesRow.parameter}</TableCell>
            <TableCell>{capitalize(seriesRow.type)}</TableCell>
            <TableCell className="items-center justify-center">
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <button
                    className="size-4 rounded-[0.25rem]"
                    style={{ background: seriesRow.color }}
                  />
                </PopoverTrigger>
                <PopoverContent className="grid grid-cols-[repeat(6,1.5rem)] w-min gap-2">
                  {CHART_COLORS.map((color) => (
                    <PopoverClose key={color} asChild>
                      <button
                        onClick={() => {
                          onSeriesChange(
                            series.map((s, i) => {
                              if (i === index) {
                                return { ...s, color };
                              } else {
                                return s;
                              }
                            }),
                          );
                        }}
                        className="size-6 rounded-[0.25rem]"
                        style={{ background: color }}
                      />
                    </PopoverClose>
                  ))}
                </PopoverContent>
              </Popover>
            </TableCell>
            <TableCell className="w-10 p-0" colSpan={3}>
              <button
                onClick={() =>
                  onSeriesChange(
                    series.filter((s) => s.parameter !== seriesRow.parameter),
                  )
                }
                type="button"
                className="hover:text-destructive p-2"
              >
                <Cross2Icon />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter className={cn(series.length === 0 && "border-t-0")}>
        <TableRow>
          <TableCell className="p-0" colSpan={5}>
            <ParameterSelector
              disablePairs={false}
              filterOut={series.map((s) => s.parameter)}
              onSelect={(parameter) => createSeries(parameter)}
              asChild
            >
              <button
                type="button"
                className="flex w-full flex-row items-center justify-between p-2"
              >
                Add Series <PlusIcon className="w-8" />
              </button>
            </ParameterSelector>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
