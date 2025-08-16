import { useMemo } from "react";
import { QualifiedParameterNameType } from "@/lib/schemas";
import {
  ParameterValue,
  SubscribedParameterInfo,
} from "@/lib/yamcsClient/lib/client";
import { useParameterSubscription } from "./use-parameter";
import { getPairedQualifiedName } from "@/lib/utils";

// Type helpers to determine if a parameter is a FlightComputer parameter
type IsFlightComputerParam<T extends string> =
  T extends `${string}/FlightComputer/${string}` ? true : false;

// Discriminated union for parameter results
type ParameterResult<T extends string> =
  IsFlightComputerParam<T> extends true
    ? {
        type: "flightComputer";
        fc435?: ParameterValue;
        fc903?: ParameterValue;
      }
    : {
        type: "standard";
        value?: ParameterValue;
      };

type ParameterInfoResult<T extends string> =
  IsFlightComputerParam<T> extends true
    ? {
        type: "flightComputer";
        fc435?: SubscribedParameterInfo;
        fc903?: SubscribedParameterInfo;
      }
    : {
        type: "standard";
        info?: SubscribedParameterInfo;
      };

export function useDoubleParameterSubscription<
  const T extends readonly QualifiedParameterNameType[],
>(parameters: T | undefined) {
  // Generate the full subscription list including pairs
  const subscriptionParameters = useMemo(() => {
    if (!parameters) return undefined;

    const paramSet = new Set<string>();
    const inputParams = new Set(parameters);

    for (const param of parameters) {
      paramSet.add(param);

      // Only add the pair if it's not already in the input
      const paired = getPairedQualifiedName(param);
      if (paired && !inputParams.has(paired as QualifiedParameterNameType)) {
        paramSet.add(paired);
      }
    }

    return Array.from(paramSet) as QualifiedParameterNameType[];
  }, [parameters]);

  // Use the original hook with expanded parameters
  const { values: allValues, info: allInfo } = useParameterSubscription(
    subscriptionParameters,
  );

  // Transform the output with proper discriminated unions
  const transformedOutput = useMemo(() => {
    if (!parameters)
      return {
        values: {} as Record<T[number], ParameterResult<T[number]>>,
        info: {} as Record<T[number], ParameterInfoResult<T[number]>>,
      };

    const values = {} as Record<T[number], ParameterResult<T[number]>>;
    const info = {} as Record<T[number], ParameterInfoResult<T[number]>>;

    const inputParams = new Set(parameters);

    for (const param of parameters) {
      const paramKey = param as T[number];

      if (param.includes("/FlightComputer/")) {
        // FlightComputer parameter - group FC435/FC903
        const fc435Param = param.includes("/FC435/")
          ? param
          : param.replace("/FC903/", "/FC435/");
        const fc903Param = param.includes("/FC903/")
          ? param
          : param.replace("/FC435/", "/FC903/");

        // Check if both are explicitly requested
        const bothExplicit =
          inputParams.has(fc435Param as QualifiedParameterNameType) &&
          inputParams.has(fc903Param as QualifiedParameterNameType);

        if (bothExplicit) {
          // If both are explicit, only populate the one that matches the current param
          if (param.includes("/FC435/")) {
            values[paramKey] = {
              type: "flightComputer",
              fc435: allValues[param],
            } as ParameterResult<T[number]>;
            info[paramKey] = {
              type: "flightComputer",
              fc435: allInfo[param],
            } as ParameterInfoResult<T[number]>;
          } else {
            values[paramKey] = {
              type: "flightComputer",
              fc903: allValues[param],
            } as ParameterResult<T[number]>;
            info[paramKey] = {
              type: "flightComputer",
              fc903: allInfo[param],
            } as ParameterInfoResult<T[number]>;
          }
        } else {
          // Single param requested, provide both FC435 and FC903
          values[paramKey] = {
            type: "flightComputer",
            fc435: allValues[fc435Param as QualifiedParameterNameType],
            fc903: allValues[fc903Param as QualifiedParameterNameType],
          } as ParameterResult<T[number]>;

          info[paramKey] = {
            type: "flightComputer",
            fc435: allInfo[fc435Param as QualifiedParameterNameType],
            fc903: allInfo[fc903Param as QualifiedParameterNameType],
          } as ParameterInfoResult<T[number]>;
        }
      } else {
        // Non-FlightComputer parameter - single value
        values[paramKey] = {
          type: "standard",
          value: allValues[paramKey],
        } as ParameterResult<T[number]>;

        info[paramKey] = {
          type: "standard",
          info: allInfo[paramKey],
        } as ParameterInfoResult<T[number]>;
      }
    }

    return { values, info };
  }, [parameters, allValues, allInfo]);

  return transformedOutput;
}
