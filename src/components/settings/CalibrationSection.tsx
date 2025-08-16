import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCalibrationStore } from "@/stores/calibration";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CreateCalibrationForm from "./CreateCalibrationForm";
import { useState } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { ParameterSelector } from "../form/ParameterSelector";
import { QualifiedParameterNameType } from "@/lib/schemas";
import {
  anonymizeParameter,
  getSiblingParameter,
} from "@/lib/yamcsCommands/format-command-name";

export default function CalibrationSection() {
  const {
    getCalibrationsWithAssignedParameters,
    createCalibration,
    assignCalibration,
    removeCalibrationAssignment,
    deleteCalibration,
    calibrations,
  } = useCalibrationStore();

  const [showPopover, setShowPopover] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex w-full justify-between items-center">
        <div>
          <h2 className="text-2xl">CALIBRATION</h2>
          <span className="text-muted-foreground text-sm">
            Assign a multiplier and offset to each parameter.
          </span>
        </div>
        <Popover open={showPopover} onOpenChange={setShowPopover}>
          <PopoverTrigger asChild>
            <Button>New</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-4">
              <div className="text-xs font-semibold">CREATE CALIBRATION</div>
              <CreateCalibrationForm
                onSubmit={(result) => {
                  createCalibration(result);
                  setShowPopover(false);
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Table className="p-4 bg-white border">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Formula</TableHead>
            <TableHead>Parameters</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(getCalibrationsWithAssignedParameters()).map(
            ([calibrationName, parameters]) => {
              const { multiplier, offset } = calibrations[calibrationName];
              return (
                <TableRow key={calibrationName}>
                  <TableCell className="align-top">{calibrationName}</TableCell>
                  <TableCell className="align-top">{`f(x) = ${multiplier}x ${offset >= 0 ? "+" : "-"} ${Math.abs(offset)}`}</TableCell>
                  <TableCell className="flex flex-col items-start">
                    {parameters
                      .filter((p) =>
                        p.includes("/FlightComputer/")
                          ? p.includes("435")
                          : true,
                      )
                      .map((parameter) => (
                        <button
                          key={parameter}
                          onClick={() => {
                            removeCalibrationAssignment(
                              parameter as QualifiedParameterNameType,
                            );
                            const sibling = getSiblingParameter(parameter);
                            if (sibling) {
                              removeCalibrationAssignment(
                                sibling as QualifiedParameterNameType,
                              );
                            }
                          }}
                          className="hover:text-destructive"
                        >
                          {anonymizeParameter(parameter)}
                        </button>
                      ))}
                    <ParameterSelector
                      asChild
                      filter={(p) =>
                        !parameters.includes(p.qualifiedName) &&
                        (p.type?.engType === "integer" ||
                          p.type?.engType === "float")
                      }
                      onSelect={(parameter) => {
                        assignCalibration(
                          parameter.qualifiedName,
                          calibrationName,
                        );
                        const sibling = getSiblingParameter(
                          parameter.qualifiedName,
                        );
                        if (sibling) {
                          assignCalibration(
                            sibling as QualifiedParameterNameType,
                            calibrationName,
                          );
                        }
                      }}
                    >
                      <Button variant="link" className="mt-2 px-0" size="sm">
                        Add
                      </Button>
                    </ParameterSelector>
                  </TableCell>
                  <TableCell className="w-10 p-0 align-top" colSpan={3}>
                    <button
                      onClick={() => deleteCalibration(calibrationName)}
                      type="button"
                      className="hover:text-destructive p-2"
                    >
                      <Cross2Icon />
                    </button>
                  </TableCell>
                </TableRow>
              );
            },
          )}
        </TableBody>
      </Table>
    </section>
  );
}
