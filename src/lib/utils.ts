import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Value } from "./yamcsClient/lib/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
