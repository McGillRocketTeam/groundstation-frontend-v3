import { QualifiedParameterNameType } from "@/lib/schemas";
import { extractValue } from "@/lib/utils";
import { Value } from "@/lib/yamcsClient/lib/client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Calibration {
  name: string;
  multiplier: number;
  offset: number;
}

// Define the state interface for the store without persistence details
interface CalibrationStoreState {
  calibrations: Record<string, Calibration>;
  calibrationAssignments: Record<string, string>;
}

// Define the actions interface
interface CalibrationStoreActions {
  createCalibration: (calibration: Calibration) => void;
  assignCalibration: (
    parameterName: QualifiedParameterNameType,
    calibrationName: string,
  ) => void;
  removeCalibrationAssignment: (
    parameterName: QualifiedParameterNameType,
  ) => void;
  deleteCalibration: (calibrationName: string) => void;
  applyCalibrationValue: (
    qualifiedParameter: QualifiedParameterNameType,
    value: Value,
  ) => ReturnType<typeof extractValue>;
  getCalibrationsWithAssignedParameters: () => Record<string, string[]>;
}

// Combine state and actions into one type for the store
export type CalibrationStore = CalibrationStoreState & CalibrationStoreActions;

/**
 * Global store to keep track of different calibrations for parameter values.
 * The user can create calibrations (multiplier and offset) and then assign specific parameters to them.
 * This store's state is persisted to localStorage.
 */
export const useCalibrationStore = create<CalibrationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      calibrations: {},
      calibrationAssignments: {},

      // Actions
      createCalibration: (calibration) =>
        set((state) => ({
          calibrations: {
            ...state.calibrations,
            [calibration.name]: calibration,
          },
        })),

      assignCalibration: (parameterName, calibrationName) => {
        if (!get().calibrations[calibrationName]) {
          console.warn(
            `Calibration "${calibrationName}" does not exist. Assignment failed for parameter "${parameterName}".`,
          );
          return;
        }
        set((state) => ({
          calibrationAssignments: {
            ...state.calibrationAssignments,
            [parameterName]: calibrationName,
          },
        }));
      },

      removeCalibrationAssignment: (parameterName) =>
        set((state) => {
          const newAssignments = { ...state.calibrationAssignments };
          delete newAssignments[parameterName];
          return { calibrationAssignments: newAssignments };
        }),

      deleteCalibration: (calibrationName) => {
        set((state) => {
          // Remove the calibration itself
          const newCalibrations = { ...state.calibrations };
          delete newCalibrations[calibrationName];

          // Remove all assignments that point to this calibration
          const newAssignments: Record<string, string> = {};
          for (const paramName in state.calibrationAssignments) {
            if (state.calibrationAssignments[paramName] !== calibrationName) {
              newAssignments[paramName] =
                state.calibrationAssignments[paramName];
            }
          }

          return {
            calibrations: newCalibrations,
            calibrationAssignments: newAssignments,
          };
        });
      },

      applyCalibrationValue: (qualifiedParameter, value) => {
        const rawValue = extractValue(value);
        const assignedCalibrationName =
          get().calibrationAssignments[qualifiedParameter];

        if (typeof rawValue !== "number" || !assignedCalibrationName) {
          return rawValue;
        }

        const calibration = get().calibrations[assignedCalibrationName];

        if (!calibration) {
          console.warn(
            `Assigned calibration "${assignedCalibrationName}" not found for parameter "${qualifiedParameter}". Returning raw value.`,
          );
          return rawValue;
        }

        return rawValue * calibration.multiplier + calibration.offset;
      },

      getCalibrationsWithAssignedParameters: () => {
        const { calibrations, calibrationAssignments } = get();
        const result: Record<string, string[]> = {};

        Object.keys(calibrations).forEach((calName) => {
          result[calName] = [];
        });

        for (const parameterName in calibrationAssignments) {
          const calibrationName = calibrationAssignments[parameterName];
          if (result[calibrationName]) {
            result[calibrationName].push(parameterName);
          } else {
            // This might happen if a calibration was deleted but its assignment not properly cleaned up
            console.warn(
              `Parameter "${parameterName}" is assigned to non-existent calibration "${calibrationName}".`,
            );
          }
        }

        return result;
      },
    }),
    {
      name: "calibration-storage",
      storage: createJSONStorage(() => localStorage),
      // `getCalibrationsWithAssignedParameters` and `applyCalibrationValue`
      // are derived/action functions, so they don't need to be persisted.
      partialize: (state) => ({
        calibrations: state.calibrations,
        calibrationAssignments: state.calibrationAssignments,
      }),
    },
  ),
);
