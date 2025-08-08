import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Value } from "./yamcsClient/lib/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to get the paired parameter
export function getPairedQualifiedName(param: string): string | null {
  if (!param.includes("/FlightComputer/") && !param.includes("/GSRadio/")) return null;

  if (param.includes("433")) {
    return param.replace("433", "903");
  } else if (param.includes("903")) {
    return param.replace("903", "433");
  }
  return null;
}

export function extractValue(value: Value) {
  switch (value.type) {
    case "AGGREGATE":
      return null;
    case "ARRAY":
      return null;
    case "BINARY":
      return value.binaryValue;
    case "BOOLEAN":
      return value.booleanValue;
    case "DOUBLE":
      return Number(value.doubleValue);
    case "ENUMERATED":
      return null;
    case "FLOAT":
      return Number(value.floatValue);
    case "NONE":
      return null;
    case "SINT32":
      return Number(value.sint32Value);
    case "SINT64":
      return Number(value.sint64Value);
    case "STRING":
      return value.stringValue;
    case "TIMESTAMP":
      return value.timestampValue;
    case "UINT32":
      return Number(value.uint32Value);
    case "UINT64":
      return Number(value.uint64Value);
  }
}

export function extractNumberValue(value: Value) {
  switch (value.type) {
    case "AGGREGATE":
      return null;
    case "ARRAY":
      return null;
    case "BINARY":
      return null;
    case "BOOLEAN":
      return null;
    case "DOUBLE":
      return value.doubleValue;
    case "ENUMERATED":
      return null;
    case "FLOAT":
      return value.floatValue;
    case "NONE":
      return null;
    case "SINT32":
      return value.sint32Value;
    case "SINT64":
      return value.sint64Value;
    case "STRING":
      return null;
    case "TIMESTAMP":
      return null;
    case "UINT32":
      return value.uint32Value;
    case "UINT64":
      return value.uint64Value;
  }
}
