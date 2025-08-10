import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useEffect, useState } from "react";
import { Parameter } from "@/lib/yamcsClient/lib/client";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { ParameterSelector } from "./ParameterSelector";
import { yamcs } from "@/lib/yamcsClient/api";
import { LegacyParameterType } from "@/cards/parameterTable/schema";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";

type UserModifiedParameter = {
  friendlyName: string;
  parameter: Parameter;
};

export function ParameterArraySelector({
  value,
  onValueChange,
}: {
  value: LegacyParameterType[];
  onValueChange: (value: UserModifiedParameter[]) => void;
}) {
  const [selectedParameters, setSelectedParameters] = useState<
    UserModifiedParameter[]
  >([]);

  // Parameters are not stored locally with meta information.
  // If there is existing parameters we must their fetch this
  // metadata on load from the api.
  useEffect(() => {
    async function fetchOriginalParams() {
      if (value !== undefined && value.length > 0) {
        const originalParameters = await yamcs.getParametersBatch(
          "gs_backend",
          {
            id: value.map((param) => ({
              name: typeof param === "string" ? param : param.qualifiedName,
            })),
          },
        );

        // If the initial data is empty but we know it can be updated
        if (selectedParameters.length == 0) {
          const newSelectedParameters: UserModifiedParameter[] =
            originalParameters.map((obj, index) => ({
              friendlyName:
                typeof value[index] === "string"
                  ? value[index]
                  : value[index].friendlyName,
              parameter: obj.parameter,
            }));
          setSelectedParameters(newSelectedParameters);
        }
      }
    }

    fetchOriginalParams();
  }, []);

  useEffect(() => {
    onValueChange(selectedParameters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedParameters]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 }, // small drag threshold
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedParameters.findIndex(
      (r) => r.parameter.qualifiedName === String(active.id),
    );
    const newIndex = selectedParameters.findIndex(
      (r) => r.parameter.qualifiedName === String(over.id),
    );

    setSelectedParameters((items) => arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[
        restrictToVerticalAxis,
        restrictToFirstScrollableAncestor,
        restrictToWindowEdges,
      ]}
      onDragEnd={handleDragEnd}
    >
      <Table className="border">
        {selectedParameters.length > 0 && (
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead>Name</TableHead>
              <TableHead>Parameter</TableHead>
              <TableHead className="text-center">Units</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          <SortableContext
            items={selectedParameters.map((r) => r.parameter.qualifiedName)}
            strategy={verticalListSortingStrategy}
          >
            {selectedParameters.map((param, index) => (
              <CustomTableRow
                key={param.parameter.qualifiedName}
                param={param}
                index={index}
                onUpdateName={(newName) => {
                  const updatedParams = selectedParameters.map((param, i) =>
                    i === index ? { ...param, friendlyName: newName } : param,
                  );
                  setSelectedParameters(updatedParams);
                }}
                onDelete={() =>
                  setSelectedParameters((prior) =>
                    prior.filter(
                      (p) =>
                        p.parameter.qualifiedName !==
                        param.parameter.qualifiedName,
                    ),
                  )
                }
              />
            ))}
          </SortableContext>
        </TableBody>
        <TableFooter
          className={cn(selectedParameters.length === 0 && "border-t-0")}
        >
          <TableRow>
            <TableCell className="p-0" colSpan={5}>
              <ParameterSelector
                filterOut={selectedParameters.map(
                  (p) => p.parameter.qualifiedName,
                )}
                onSelect={(p) =>
                  setSelectedParameters((prior) => [
                    ...prior,
                    {
                      friendlyName: p.qualifiedName,
                      parameter: p,
                    },
                  ])
                }
                asChild
              >
                <button
                  type="button"
                  className="flex w-full flex-row items-center justify-between p-2"
                >
                  Add Parameter <PlusIcon className="w-8" />
                </button>
              </ParameterSelector>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </DndContext>
  );
}

function CustomTableRow({
  param,
  index,
  onUpdateName,
  onDelete,
}: {
  param: UserModifiedParameter;
  index: number;
  onUpdateName: (newName: string) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: param.parameter.qualifiedName });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "bg-muted/70" : undefined}
      data-index={index}
    >
      <TableCell className="w-6">
        <button
          className="cursor-grab active:cursor-grabbing"
          aria-label={`Drag handle for ${param.friendlyName}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell>
        <input
          className="focus:outline-none w-full"
          value={param.friendlyName}
          onChange={(e) => {
            const newLabel = e.target.value;
            onUpdateName(newLabel);
          }}
          // ref={isLastRow ? lastInputRef : null}
        />
      </TableCell>
      <TableCell>{param.parameter.qualifiedName}</TableCell>
      <TableCell className="text-center">
        {param.parameter.type?.unitSet?.map((u) => u.unit).join("/")}
      </TableCell>
      <TableCell className="w-10 p-0" colSpan={3}>
        <button
          onClick={() => onDelete()}
          type="button"
          className="hover:text-destructive p-2"
        >
          <Cross2Icon />
        </button>
      </TableCell>
    </TableRow>
  );
}
